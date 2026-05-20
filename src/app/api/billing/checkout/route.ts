import { NextResponse } from "next/server";
import { createCheckoutSession, STRIPE_ENABLED } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth-mock";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/checkout
 *   Body: { priceKey: 'starter_monthly' | 'starter_yearly' | 'pro_monthly' | 'pro_yearly' }
 *   Returns: { url } — redirect the browser there.
 *
 * In mock mode (no STRIPE_SECRET_KEY), returns the success URL directly
 * so the demo flow can be exercised.
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

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    const session = await createCheckoutSession({
      priceKey,
      customerEmail: user.email,
      successUrl: `${origin}/app/billing/success`,
      cancelUrl: `${origin}/app/billing/cancel`,
    });

    return NextResponse.json({ url: session.url, mock: !STRIPE_ENABLED });
  } catch (e) {
    console.error("[/api/billing/checkout]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
