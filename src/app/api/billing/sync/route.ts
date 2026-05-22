import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STRIPE_ENABLED, mapPriceIdToPlan } from "@/lib/stripe";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/billing/sync
 *
 * Force-sync immédiat de l'état Stripe → DB pour l'utilisateur connecté.
 * Appelé depuis la page /app/billing/success pour éviter d'attendre que le
 * webhook Stripe arrive (parfois quelques secondes de latence + ordre des
 * events imprévisible).
 *
 * Logique :
 *   1. Lit le stripeCustomerId / stripeSubscriptionId en base (ou trouve via
 *      l'email Stripe customer).
 *   2. Récupère la sub côté Stripe (source de vérité).
 *   3. Update plan, status, renewsAt directement.
 *
 * Idempotent : peut être appelé en boucle, ne casse rien.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!STRIPE_ENABLED) {
    // Mock mode : on n'a rien à sync, on retourne l'état actuel.
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true, subscriptionStatus: true },
    });
    return NextResponse.json({ ok: true, mock: true, ...dbUser });
  }

  // Optionnellement on accepte le session_id depuis la query/body pour
  // récupérer la sub directement depuis le checkout.
  let sessionId: string | undefined;
  try {
    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: string;
    };
    sessionId = body.sessionId;
  } catch {
    // ignore
  }
  const urlSession = new URL(req.url).searchParams.get("session_id");
  sessionId = sessionId ?? urlSession ?? undefined;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true, stripeSubscriptionId: true },
  });

  let customerId = dbUser?.stripeCustomerId ?? null;
  let subscriptionId = dbUser?.stripeSubscriptionId ?? null;

  // Si on a un session_id, on l'utilise comme source de vérité (le webhook
  // n'a peut-être pas encore tourné).
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.customer)
        customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
      if (session.subscription)
        subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
    } catch (e) {
      console.error("[billing.sync] session retrieve", e);
    }
  }

  if (!subscriptionId) {
    return NextResponse.json(
      { ok: false, error: "Aucune subscription Stripe trouvée" },
      { status: 404 }
    );
  }

  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = sub.items.data[0]?.price?.id;
    const plan = priceId ? mapPriceIdToPlan(priceId) : undefined;
    const periodEnd = sub.items.data[0]?.current_period_end;
    const planRenewsAt = periodEnd ? new Date(periodEnd * 1000) : null;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customerId ?? undefined,
        stripeSubscriptionId: subscriptionId,
        ...(plan ? { plan } : {}),
        subscriptionStatus: sub.status,
        planRenewsAt,
      },
    });

    return NextResponse.json({
      ok: true,
      plan,
      status: sub.status,
      renewsAt: planRenewsAt,
    });
  } catch (e) {
    console.error("[billing.sync]", e);
    return NextResponse.json(
      { ok: false, error: "Erreur sync Stripe" },
      { status: 500 }
    );
  }
}
