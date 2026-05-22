import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildAffiliateLink,
  generateUniqueAffiliateCode,
  isPlanEligibleForAffiliate,
  isSubscriptionActive,
} from "@/lib/affiliate";
import { STRIPE_ENABLED } from "@/lib/stripe";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/affiliate/activate
 *
 * Active le programme d'affiliation pour l'utilisateur connecté :
 *   1. Vérifie qu'il est connecté + sur un plan payant + sub active.
 *   2. Génère un affiliateCode unique de 8 chars (si pas déjà existant).
 *   3. Crée le compte Stripe Connect Express (idempotent : skip si existant).
 *   4. Retourne le code + lien affilié complet.
 *
 * Idempotent : si l'utilisateur a déjà activé, on retourne ses infos existantes
 * sans erreur (utile pour les re-cliques sur le bouton "Activer").
 */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      plan: true,
      subscriptionStatus: true,
      affiliateCode: true,
      affiliateActive: true,
      stripeConnectAccountId: true,
    },
  });
  if (!dbUser) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  // Plan payant + sub active obligatoires.
  if (!isPlanEligibleForAffiliate(dbUser.plan)) {
    return NextResponse.json(
      {
        error: "PLAN_REQUIRED",
        message:
          "Le programme d'affiliation est réservé aux abonnés Essentiel, Pro et Premium.",
      },
      { status: 403 }
    );
  }
  if (!isSubscriptionActive(dbUser.subscriptionStatus)) {
    return NextResponse.json(
      {
        error: "SUB_NOT_ACTIVE",
        message:
          "Ton abonnement n'est pas actif. Réactive-le avant d'activer l'affiliation.",
      },
      { status: 403 }
    );
  }

  // === Générer le code si absent ===
  let code = dbUser.affiliateCode;
  if (!code) {
    code = await generateUniqueAffiliateCode();
  }

  // === Créer le compte Stripe Connect Express si absent ===
  let stripeConnectAccountId = dbUser.stripeConnectAccountId;
  if (!stripeConnectAccountId && STRIPE_ENABLED) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: dbUser.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { userId: dbUser.id, affiliateCode: code },
      });
      stripeConnectAccountId = account.id;
    } catch (e) {
      console.error("[affiliate.activate] stripe connect", e);
      // Si Stripe Connect échoue, on n'empêche pas l'activation. L'user pourra
      // refaire l'onboarding plus tard via /api/affiliate/stripe-connect/onboard.
    }
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      affiliateCode: code,
      affiliateActive: true,
      stripeConnectAccountId: stripeConnectAccountId ?? undefined,
    },
  });

  return NextResponse.json({
    ok: true,
    code,
    link: buildAffiliateLink(code),
    stripeConnectNeeded: !stripeConnectAccountId,
  });
}
