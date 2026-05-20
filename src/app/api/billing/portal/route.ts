import { NextResponse } from "next/server";
import { createCustomerPortalSession, STRIPE_ENABLED } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/billing/portal
 * Crée une session Stripe Customer Portal et redirige le user.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { stripeCustomerId: true },
    });

    if (!dbUser?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun abonnement actif" },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

    const url = await createCustomerPortalSession(
      dbUser.stripeCustomerId,
      `${origin}/app/billing`
    );

    return NextResponse.json({ url, mock: !STRIPE_ENABLED });
  } catch (e) {
    console.error("[/api/billing/portal]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
