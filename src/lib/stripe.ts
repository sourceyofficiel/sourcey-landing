/**
 * Stripe adapter — wraps Stripe SDK avec fallback mock si pas de clé.
 *
 * Variables d'environnement requises (production) :
 *   STRIPE_SECRET_KEY=sk_live_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (côté client)
 *   STRIPE_PRICE_STARTER_MONTHLY=price_...
 *   STRIPE_PRICE_PRO_MONTHLY=price_...
 *
 * En dev sans clés → tout est mocké, le flow UI reste testable.
 */
import Stripe from "stripe";

export const STRIPE_ENABLED = Boolean(process.env.STRIPE_SECRET_KEY);

export const PRICE_IDS = {
  // Plans actifs (essentiel / pro / premium)
  essential_monthly: process.env.STRIPE_PRICE_ESSENTIAL_MONTHLY,
  essential_yearly: process.env.STRIPE_PRICE_ESSENTIAL_YEARLY,
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
  premium_yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  // Legacy (compat avec les anciens Stripe Price IDs starter — ne plus utiliser)
  starter_monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY,
  starter_yearly: process.env.STRIPE_PRICE_STARTER_YEARLY,
} as const;

export type PriceKey = keyof typeof PRICE_IDS;

let cachedStripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!STRIPE_ENABLED) {
    throw new Error("Stripe non configuré (STRIPE_SECRET_KEY manquant)");
  }
  if (!cachedStripe) {
    cachedStripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return cachedStripe;
}

/**
 * Reverse-lookup : Stripe Price ID → notre code de plan interne ("starter", "pro").
 */
/**
 * Reverse-lookup : Stripe Price ID → notre code de plan interne.
 * Retourne aussi la variante annuelle (ex: "pro_annual") pour distinguer
 * l'engagement mensuel vs annuel dans la base.
 */
export function mapPriceIdToPlan(priceId: string): string {
  if (priceId === PRICE_IDS.essential_monthly) return "essential";
  if (priceId === PRICE_IDS.essential_yearly) return "essential_annual";
  if (priceId === PRICE_IDS.pro_monthly) return "pro";
  if (priceId === PRICE_IDS.pro_yearly) return "pro_annual";
  if (priceId === PRICE_IDS.premium_monthly) return "premium";
  if (priceId === PRICE_IDS.premium_yearly) return "premium_annual";
  // Legacy starter (compat avec les vieilles subs)
  if (
    priceId === PRICE_IDS.starter_monthly ||
    priceId === PRICE_IDS.starter_yearly
  )
    return "essential";
  return "free";
}

interface CheckoutInput {
  priceKey: PriceKey;
  customerEmail: string;
  customerId?: string | null; // si déjà connu
  userId: string;             // notre ID interne (passé en metadata)
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResult {
  url: string;
  sessionId: string;
}

/**
 * Crée une session de checkout Stripe.
 * En mock mode → renvoie l'URL success directement.
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

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    // Si on a déjà un Stripe customer (user qui repasse au checkout), on le réutilise
    ...(input.customerId
      ? { customer: input.customerId }
      : { customer_email: input.customerEmail }),
    client_reference_id: input.userId,
    metadata: { userId: input.userId },
    subscription_data: {
      metadata: { userId: input.userId },
    },
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: input.successUrl + "?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: input.cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });
  return { url: session.url!, sessionId: session.id };
}

/**
 * Crée une session Customer Portal pour que l'utilisateur gère sa sub lui-même.
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<string> {
  if (!STRIPE_ENABLED) return returnUrl;
  const stripe = getStripe();
  const portal = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return portal.url;
}

/**
 * Vérifie la signature du webhook Stripe et retourne l'event parsé.
 */
export function verifyWebhookEvent(
  body: string,
  signature: string
): Stripe.Event | null {
  if (!STRIPE_ENABLED || !process.env.STRIPE_WEBHOOK_SECRET) return null;
  try {
    const stripe = getStripe();
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
