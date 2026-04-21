/**
 * Billing Router
 *
 * Handles Stripe checkout, subscription status, billing portal, and usage gate.
 *
 * Architecture:
 * - Minimal local storage: only Stripe IDs stored in users table (stripeCustomerId, stripeSubscriptionId, plan)
 * - Usage tracking: usage_tracking table counts Discovery sessions per (userId, month)
 * - Webhook: /api/stripe/webhook handles checkout.session.completed and customer.subscription.deleted
 *
 * Free tier:  10 Discovery sessions / month
 * Pro tier:   $15/month, unlimited sessions
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { users, usageTracking } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import Stripe from "stripe";
import { PLANS, getSessionLimit, type PlanId } from "../products";

// ─── Stripe client ────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
  // stripe@22 uses "2025-03-31.basil" as the latest API version
  return new Stripe(key);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get or create the usage record for (userId, month).
 * Returns the current sessionCount.
 */
async function getMonthlyUsage(userId: number): Promise<{ count: number; month: string }> {
  const db = await getDb();
  if (!db) return { count: 0, month: currentMonth() };

  const month = currentMonth();
  const [row] = await db
    .select({ sessionCount: usageTracking.sessionCount })
    .from(usageTracking)
    .where(and(eq(usageTracking.userId, userId), eq(usageTracking.month, month)))
    .limit(1);

  return { count: row?.sessionCount ?? 0, month };
}

/**
 * Increment the session count for (userId, currentMonth).
 * Uses INSERT ... ON DUPLICATE KEY UPDATE for atomic upsert.
 */
async function incrementSessionCount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const month = currentMonth();
  const now = Date.now();

  // Drizzle doesn't support ON DUPLICATE KEY UPDATE natively for MySQL,
  // so we use a raw query via the underlying connection pool.
  await (db as unknown as { execute: (sql: string, params: unknown[]) => Promise<unknown> }).execute(
    `INSERT INTO usage_tracking (userId, month, sessionCount, lastUpdated)
     VALUES (?, ?, 1, ?)
     ON DUPLICATE KEY UPDATE sessionCount = sessionCount + 1, lastUpdated = ?`,
    [userId, month, now, now]
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const billingRouter = router({
  /**
   * Check if the current user is allowed to create a new Discovery session.
   * Returns { allowed: true } for Pro users and free users under the limit.
   * Returns { allowed: false, reason, limit, used } when the limit is hit.
   */
  checkUsageGate: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { allowed: true, plan: "free" as PlanId, limit: 10, used: 0 };

    const [user] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const plan = (user?.plan ?? "free") as PlanId;

    if (plan === "pro") {
      return { allowed: true, plan, limit: null, used: 0 };
    }

    const { count, month } = await getMonthlyUsage(ctx.user.id);
    const limit = getSessionLimit(plan);
    const allowed = count < limit;

    return {
      allowed,
      plan,
      limit,
      used: count,
      month,
      ...(allowed ? {} : {
        reason: `You've used ${count} of ${limit} free sessions this month. Upgrade to Pro for unlimited sessions.`,
      }),
    };
  }),

  /**
   * Record a new Discovery session creation.
   * Called by the sessions router after successfully creating a session.
   * Throws 402 if the user is over their limit (double-check gate).
   */
  recordSessionCreation: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: true };

    const [user] = await db
      .select({ plan: users.plan })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const plan = (user?.plan ?? "free") as PlanId;

    if (plan !== "pro") {
      const { count } = await getMonthlyUsage(ctx.user.id);
      const limit = getSessionLimit(plan);
      if (count >= limit) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Monthly session limit reached (${limit}). Upgrade to Pro for unlimited sessions.`,
        });
      }
    }

    await incrementSessionCount(ctx.user.id);
    return { success: true };
  }),

  /**
   * Create a Stripe Checkout Session for the Pro plan.
   * Returns a URL to redirect the user to Stripe's hosted checkout.
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const proPriceId = PLANS.pro.stripePriceId;
      if (!proPriceId) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Pro plan price not configured. Please set STRIPE_PRO_PRICE_ID.",
        });
      }

      // Check if user already has a Pro subscription
      const [user] = await db
        .select({ plan: users.plan, stripeCustomerId: users.stripeCustomerId, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (user?.plan === "pro") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You already have an active Pro subscription.",
        });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: proPriceId, quantity: 1 }],
        customer_email: user?.email ?? undefined,
        allow_promotion_codes: true,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: user?.email ?? "",
          customer_name: user?.name ?? "",
        },
        success_url: `${input.origin}/settings?upgrade=success`,
        cancel_url: `${input.origin}/pricing?upgrade=cancelled`,
      });

      if (!session.url) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create checkout session" });
      }

      return { url: session.url };
    }),

  /**
   * Create a Stripe Billing Portal session for subscription management.
   * Allows users to cancel, update payment method, or view invoices.
   */
  createBillingPortalSession: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [user] = await db
        .select({ stripeCustomerId: users.stripeCustomerId })
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      if (!user?.stripeCustomerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No billing account found. Please subscribe first.",
        });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${input.origin}/settings`,
      });

      return { url: session.url };
    }),

  /**
   * Get the current user's subscription status.
   * Returns plan, usage for the current month, and Stripe subscription details if Pro.
   */
  getSubscriptionStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { plan: "free" as PlanId, used: 0, limit: 10, month: currentMonth() };

    const [user] = await db
      .select({
        plan: users.plan,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const plan = (user?.plan ?? "free") as PlanId;
    const { count, month } = await getMonthlyUsage(ctx.user.id);
    const limit = plan === "pro" ? null : getSessionLimit(plan);

    return {
      plan,
      used: count,
      limit,
      month,
      hasStripeCustomer: !!user?.stripeCustomerId,
      hasActiveSubscription: !!user?.stripeSubscriptionId,
    };
  }),

  /**
   * Public endpoint: return plan feature comparison for the Pricing page.
   */
  getPlans: publicProcedure.query(() => {
    return [
      {
        id: "free",
        label: "Free",
        price: 0,
        priceLabel: "Free forever",
        features: [
          "10 Discovery sessions / month",
          "All 22 prompt patterns",
          "All 32 anti-patterns",
          "Scaffold Builder (8 blocks)",
          "Variant generation",
          "Reverse Mode",
          "Pattern Library",
          "Example Library (108 prompts)",
          "Swarm Composer",
          "Output Diagnosis",
          "A/B Comparison",
          "Personal Insights",
        ],
        cta: "Get started free",
        highlighted: false,
      },
      {
        id: "pro",
        label: "Pro",
        price: 15,
        priceLabel: "$15 / month",
        features: [
          "Unlimited Discovery sessions",
          "Everything in Free",
          "Priority support",
          "Early access to new features",
          "Export sessions as Markdown ZIP",
          "Billing portal (manage subscription)",
        ],
        cta: "Upgrade to Pro",
        highlighted: true,
      },
    ];
  }),
});
