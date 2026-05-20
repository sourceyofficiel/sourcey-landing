/**
 * Stripe adapter. Lazy-loads the SDK so the app builds without the
 * package installed (mock fallback).
 *
 * Wiring up real Stripe :
 *  1. `npm install stripe`
 *  2. Set in .env :
 *       STRIPE_SECRET_KEY=sk_live_...
 *       STRIPE_WEBHOOK_SECRET=whsec_...
 *       NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
 *       STRIPE_PRICE_STARTER_MONTHLY=price_...
 *       STRIPE_PRICE_STARTER_YEARLY=price_...
 *       STRIPE_PRICE_PRO_MONTHLY=price_...
 *       STRIPE_PRICE_PRO_YEARLY=price_...
 *  3. Configure webhooks endpoint at /api/webhooks/stripe in Stripe Dashboard
 *  4. Plug `createCheckoutSession` into the pricing CTAs.
 */

export const STRIPE_ENABLED = Boolean(process.env.STRIPE_SECRET_KEY);

export const PRICE_IDS = {
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
} as const;

export type PriceKey = keyof typeof PRICE_IDS;

interface CheckoutInput {
  priceKey: PriceKey;
  customerEmail: string;
  /** Where to send the user after a successful checkout. */
  successUrl: string;
  /** Where to send the user if they cancel. */
  cancelUrl: string;
}

interface CheckoutResult {
  url: string;
  sessionId: string;
}

/**
 * Returns a Stripe Checkout session URL. When Stripe is not configured,
 * returns a mock URL so the UI flow can be tested in local dev.
 */
export async function createCheckoutSession(
  input: CheckoutInput
): Promise<CheckoutResult> {
  if (!STRIPE_ENABLED) {
    return {
      url: `${input.successUrl}?mock_checkout=1`,
      sessionId: `mock_${Date.now()}`,
    };
  }
  const priceId = PRICE_IDS[input.priceKey];
  if (!priceId) {
    throw new Error(`Stripe Price ID manquant pour ${input.priceKey}`);
  }

  // Lazy import so the SDK is optional at install time.
  // Use a dynamic module specifier so webpack doesn't try to bundle the
  // package at build time (it's an optional dep).
  const modName = "stripe";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: Stripe } = (await import(/* webpackIgnore: true */ modName)) as any;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: input.cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });
  return { url: session.url!, sessionId: session.id };
}

/**
 * Customer Portal so users can manage their subscription themselves.
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  if (!STRIPE_ENABLED) return returnUrl;
  // Use a dynamic module specifier so webpack doesn't try to bundle the
  // package at build time (it's an optional dep).
  const modName = "stripe";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: Stripe } = (await import(/* webpackIgnore: true */ modName)) as any;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
  });
  const portal = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return portal.url;
}

/**
 * Verify + construct a webhook event from the incoming request.
 * Returns null if signature invalid or Stripe not configured.
 */
export async function verifyWebhookEvent(
  body: string,
  signature: string
): Promise<unknown | null> {
  if (!STRIPE_ENABLED || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  try {
    // Use a dynamic module specifier so webpack doesn't try to bundle the
  // package at build time (it's an optional dep).
  const modName = "stripe";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { default: Stripe } = (await import(/* webpackIgnore: true */ modName)) as any;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-06-20",
    });
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error("[stripe.verifyWebhookEvent]", e);
    return null;
  }
}
