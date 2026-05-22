import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STRIPE_ENABLED } from "@/lib/stripe";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/affiliate/stripe-connect/onboard
 *
 * Génère un lien Stripe Connect Express pour onboarding KYC + IBAN.
 * Retourne l'URL ; le front fait un window.location.href = url.
 *
 * Si l'user n'a pas encore de stripeConnectAccountId → on en crée un avant.
 * Cas Stripe mock : on retourne directement la callback comme si l'onboarding
 * avait réussi (pour tester le flow en dev sans clé Stripe).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      affiliateActive: true,
      affiliateCode: true,
      stripeConnectAccountId: true,
    },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  if (!dbUser.affiliateActive || !dbUser.affiliateCode) {
    return NextResponse.json(
      { error: "Programme d'affiliation pas encore activé" },
      { status: 403 }
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const returnUrl = `${origin}/api/affiliate/stripe-connect/callback`;
  const refreshUrl = `${origin}/app/affiliation?onboarding=refresh`;

  // Dev / mock : on simule un onboarding réussi.
  if (!STRIPE_ENABLED) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        stripeConnectAccountId:
          dbUser.stripeConnectAccountId ?? `mock_acct_${dbUser.id}`,
        stripeConnectOnboarded: true,
      },
    });
    return NextResponse.json({ url: `${origin}/app/affiliation?mock_onboarded=1` });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // Crée le compte Connect Express si pas encore fait.
  let accountId = dbUser.stripeConnectAccountId;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "FR",
      email: dbUser.email,
      capabilities: { transfers: { requested: true } },
      business_type: "individual",
      metadata: {
        userId: dbUser.id,
        affiliateCode: dbUser.affiliateCode,
      },
    });
    accountId = account.id;
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { stripeConnectAccountId: accountId },
    });
  }

  // Génère un AccountLink (URL temporaire d'onboarding hosted par Stripe).
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
