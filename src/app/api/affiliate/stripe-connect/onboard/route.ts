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
 * Retourne { url } ; le front fait window.location.href = url.
 *
 * En cas d'erreur Stripe (Connect pas activé sur la plateforme, capability
 * refusée, etc.) on retourne 500 avec un message explicite que le front
 * peut afficher à l'user. Sinon le bouton reste en loading et personne
 * ne comprend pourquoi.
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
    return NextResponse.json({
      url: `${origin}/app/affiliation?mock_onboarded=1`,
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  // === Étape 1 : créer le compte Connect si absent ===
  let accountId = dbUser.stripeConnectAccountId;
  if (!accountId) {
    try {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: dbUser.email,
        capabilities: { transfers: { requested: true } },
        business_type: "individual",
        // En France (et UE) un compte qui demande uniquement la capability
        // `transfers` (sans card_payments) doit déclarer le service agreement
        // "recipient" = destinataire de fonds, pas marchand vendeur.
        // C'est exactement notre cas : l'affilié reçoit des virements de
        // Sourcey, il ne vend rien à personne directement.
        // Doc : https://stripe.com/docs/connect/service-agreement-types
        tos_acceptance: {
          service_agreement: "recipient",
        },
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
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur Stripe inconnue";
      console.error("[connect.onboard] accounts.create", e);
      // Le cas le plus fréquent : Stripe Connect pas encore activé sur la
      // plateforme. Message clair pour qu'on sache quoi faire.
      if (msg.includes("review the responsibilities") || msg.includes("platform")) {
        return NextResponse.json(
          {
            error: "STRIPE_CONNECT_NOT_ACTIVATED",
            message:
              "Stripe Connect n'est pas activé sur la plateforme. Va sur Stripe Dashboard → Connect → Get Started et complète le setup, puis réessaie.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        {
          error: "STRIPE_ACCOUNT_CREATE_FAILED",
          message: `Création du compte Connect échouée : ${msg}`,
        },
        { status: 500 }
      );
    }
  }

  // === Étape 2 : générer l'AccountLink d'onboarding ===
  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    });
    return NextResponse.json({ url: link.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur Stripe inconnue";
    console.error("[connect.onboard] accountLinks.create", e);
    return NextResponse.json(
      {
        error: "STRIPE_ACCOUNT_LINK_FAILED",
        message: `Génération du lien d'onboarding échouée : ${msg}`,
      },
      { status: 500 }
    );
  }
}
