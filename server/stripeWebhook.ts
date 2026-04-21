/**
 * Stripe Webhook Handler
 *
 * Route: POST /api/stripe/webhook
 *
 * CRITICAL: This route MUST be registered BEFORE express.json() middleware
 * because Stripe signature verification requires the raw request body.
 * The index.ts registers this via registerStripeWebhook(app) before app.use(express.json()).
 *
 * Events handled:
 *   checkout.session.completed  → upgrade user to Pro, store Stripe IDs
 *   customer.subscription.deleted → downgrade user to Free
 *   customer.subscription.updated → sync plan status
 */

import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, or } from "drizzle-orm";

export function registerStripeWebhook(app: Express): void {
  // MUST use express.raw BEFORE express.json for this route
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      if (!sig) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        return res.status(500).json({ error: "Stripe not configured" });
      }

      const stripe = new Stripe(stripeKey);
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`[Webhook] Signature verification failed: ${message}`);
        return res.status(400).json({ error: `Webhook signature verification failed: ${message}` });
      }

      // ── Test event detection (required by Stripe sandbox) ──────────────────
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      const db = await getDb();
      if (!db) {
        console.error("[Webhook] Database unavailable");
        return res.status(500).json({ error: "Database unavailable" });
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;

            // Extract user identity from metadata or client_reference_id
            const userId = session.metadata?.user_id
              ? parseInt(session.metadata.user_id, 10)
              : session.client_reference_id
              ? parseInt(session.client_reference_id, 10)
              : null;

            if (!userId || isNaN(userId)) {
              console.error("[Webhook] checkout.session.completed: missing user_id in metadata");
              break;
            }

            const customerId = typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null;

            const subscriptionId = typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null;

            await db
              .update(users)
              .set({
                plan: "pro",
                stripeCustomerId: customerId ?? undefined,
                stripeSubscriptionId: subscriptionId ?? undefined,
              })
              .where(eq(users.id, userId));

            console.log(`[Webhook] Upgraded user ${userId} to Pro (customer: ${customerId}, sub: ${subscriptionId})`);
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;

            if (!customerId) {
              console.error("[Webhook] customer.subscription.deleted: missing customer ID");
              break;
            }

            await db
              .update(users)
              .set({
                plan: "free",
                stripeSubscriptionId: undefined,
              })
              .where(eq(users.stripeCustomerId, customerId));

            console.log(`[Webhook] Downgraded customer ${customerId} to Free`);
            break;
          }

          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id;

            if (!customerId) break;

            // If subscription is active or trialing → ensure Pro; otherwise downgrade
            const isActive = ["active", "trialing"].includes(subscription.status);
            await db
              .update(users)
              .set({
                plan: isActive ? "pro" : "free",
                stripeSubscriptionId: isActive ? subscription.id : undefined,
              })
              .where(eq(users.stripeCustomerId, customerId));

            console.log(`[Webhook] Updated subscription for customer ${customerId}: status=${subscription.status}`);
            break;
          }

          default:
            // Acknowledge but don't process unhandled event types
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(`[Webhook] Handler error for ${event.type}: ${message}`);
        res.status(500).json({ error: "Webhook handler failed" });
      }
    }
  );
}
