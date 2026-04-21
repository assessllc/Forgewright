/**
 * Forgewright — Stripe Product & Price Definitions
 *
 * Single source of truth for plan metadata. All checkout and webhook handlers
 * import from here so price IDs never drift between files.
 *
 * Pricing model: usage-based subscription
 *   Free tier  — 10 Discovery sessions / month, all features accessible
 *   Pro tier   — $15/month, unlimited sessions, all features
 *
 * Note: The Stripe Price ID below is a placeholder. After claiming the sandbox
 * at https://dashboard.stripe.com/claim_sandbox/... you must:
 *   1. Create a Product named "Forgewright Pro"
 *   2. Create a recurring Price at $15.00/month
 *   3. Replace STRIPE_PRO_PRICE_ID with the actual price_xxx ID
 *
 * Until the price is created in Stripe, the checkout will fail gracefully
 * with a clear error message rather than silently.
 */

export const PLANS = {
  free: {
    id: "free",
    label: "Free",
    monthlySessionLimit: 10,
    price: 0,
    stripePriceId: null,
  },
  pro: {
    id: "pro",
    label: "Pro",
    monthlySessionLimit: Infinity,
    price: 15_00, // cents
    // Replace with actual Stripe Price ID after claiming sandbox
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
  },
} as const;

export type PlanId = keyof typeof PLANS;

/**
 * Return the session limit for a given plan.
 * Infinity is returned for Pro — callers should treat any value >= 999 as unlimited.
 */
export function getSessionLimit(plan: PlanId): number {
  return PLANS[plan].monthlySessionLimit === Infinity ? 999_999 : PLANS[plan].monthlySessionLimit;
}
