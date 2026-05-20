import { NextResponse } from "next/server";
import { createCheckoutSession, STRIPE_ENABLED } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/checkout
 * Body: { priceKey: 'starter_monthly' | 'pro_monthly' | ... }
 * Returns: { url } — redirect the browser there.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }
    const body = (await req.json()) as { priceKey?: string };
    const priceKey = body.priceKey;
    if (
      priceKey !== "starter_monthly" &&
      priceKey !== "starter_yearly" &&
      priceKey !== "pro_monthly" &&
      priceKey !== "pro_yearly"
    ) {
      return NextResponse.json({ error: "priceKey invalide" }, { status: 400 });
    }

    // Récupère le Stripe customer ID si déjà existant (pour les users qui s'upgradent)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    const session = await createCheckoutSession({
      priceKey,
      userId: user.id,
      customerEmail: user.email,
      customerId: dbUser?.stripeCustomerId,
      successUrl: `${origin}/app/billing/success`,
      cancelUrl: `${origin}/app/billing`,
    });

    return NextResponse.json({ url: session.url, mock: !STRIPE_ENABLED });
  } catch (e) {
    console.error("[/api/billing/checkout]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
