import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyWebhookEvent,
  STRIPE_ENABLED,
  mapPriceIdToPlan,
} from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/stripe
 *
 * Configurer dans Stripe Dashboard → Developers → Webhooks
 * URL : https://sourcey.fr/api/webhooks/stripe
 * Events à écouter :
 *   - checkout.session.completed
 *   - customer.subscription.created
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
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
  const event = verifyWebhookEvent(body, signature);
  if (!event) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(
          event.data.object as Stripe.Subscription
        );
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.info("[stripe.webhook] unhandled", event.type);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[stripe.webhook]", err);
    return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.userId;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !customerId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId ?? null,
    },
  });
  console.info("[stripe.webhook] checkout completed", { userId, customerId });
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price?.id;
  if (!customerId || !priceId) return;

  const plan = mapPriceIdToPlan(priceId);
  // current_period_end is on the first subscription item in latest API versions
  const periodEnd = sub.items.data[0]?.current_period_end;
  const planRenewsAt = periodEnd ? new Date(periodEnd * 1000) : null;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan,
      subscriptionStatus: sub.status,
      stripeSubscriptionId: sub.id,
      planRenewsAt,
    },
  });
  console.info("[stripe.webhook] subscription change", {
    customerId,
    plan,
    status: sub.status,
  });
}

async function handleSubscriptionCanceled(sub: Stripe.Subscription) {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  if (!customerId) return;

  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: "free",
      subscriptionStatus: "canceled",
      stripeSubscriptionId: null,
      planRenewsAt: null,
    },
  });
  console.info("[stripe.webhook] subscription canceled", { customerId });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  console.warn("[stripe.webhook] payment failed", {
    customerId,
    amount: invoice.amount_due,
  });
}
