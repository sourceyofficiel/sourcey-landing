import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyWebhookEvent, STRIPE_ENABLED } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 *
 * Verifies the Stripe signature and dispatches relevant events.
 * Configure this endpoint in Stripe Dashboard > Developers > Webhooks
 * with events :
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 *   - invoice.payment_succeeded
 *   - invoice.payment_failed
 */
export async function POST(req: Request) {
  if (!STRIPE_ENABLED) {
    return NextResponse.json(
      { error: "Stripe non configuré" },
      { status: 503 }
    );
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }
  const body = await req.text();
  const event = await verifyWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  const e = event as { type: string; data: { object: Record<string, unknown> } };
  try {
    switch (e.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(e.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(e.data.object);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(e.data.object);
        break;
      default:
        console.info("[stripe.webhook] unhandled", e.type);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe.webhook]", err);
    return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
  }
}

async function handleSubscriptionChange(sub: Record<string, unknown>) {
  const customerId = sub.customer as string | undefined;
  const status = sub.status as string | undefined;
  const items = sub.items as { data: { price: { id: string } }[] } | undefined;
  const priceId = items?.data?.[0]?.price?.id;
  if (!customerId || !priceId) return;

  const plan = mapPriceIdToPlan(priceId);
  // Look up user by stripe customer id (need a column on User to store it
  // — wire this when adding NextAuth v5 + Stripe Adapter)
  console.info("[stripe.webhook] subscription change", {
    customerId,
    status,
    plan,
  });
  // Example wiring (when User.stripeCustomerId exists) :
  // await prisma.user.updateMany({
  //   where: { stripeCustomerId: customerId },
  //   data: { plan },
  // });
}

async function handleSubscriptionCanceled(sub: Record<string, unknown>) {
  const customerId = sub.customer as string | undefined;
  console.info("[stripe.webhook] subscription canceled", { customerId });
  // await prisma.user.updateMany({
  //   where: { stripeCustomerId: customerId },
  //   data: { plan: "free" },
  // });
}

async function handlePaymentFailed(invoice: Record<string, unknown>) {
  const customerEmail = invoice.customer_email as string | undefined;
  console.info("[stripe.webhook] payment failed", { customerEmail });
  // Send email reminder via Resend
}

function mapPriceIdToPlan(priceId: string): string {
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_PRO_YEARLY) return "pro";
  if (priceId === process.env.STRIPE_PRICE_STARTER_MONTHLY) return "starter";
  if (priceId === process.env.STRIPE_PRICE_STARTER_YEARLY) return "starter";
  return "free";
}

// Avoid TS unused import error
void prisma;
