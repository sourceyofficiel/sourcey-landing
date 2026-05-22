import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { STRIPE_ENABLED } from "@/lib/stripe";
import { payoutPendingCommissionsForAffiliate } from "@/lib/cron-affiliate";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/affiliate/stripe-connect/callback
 *
 * Stripe redirige ici quand l'affilié a terminé son onboarding Express
 * (KYC + IBAN). On vérifie l'état du compte côté Stripe et on met à jour
 * stripeConnectOnboarded en base, puis on redirige vers le dashboard.
 *
 * Note : le webhook `account.updated` est la source de vérité finale (cf.
 * /api/webhooks/stripe). Ici on fait juste un check immédiat pour que l'user
 * voie son IBAN validé sans attendre le webhook.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const dashboardUrl = new URL("/app/affiliation", origin);

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login?redirect=/app/affiliation", origin));
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, stripeConnectAccountId: true },
  });
  if (!dbUser?.stripeConnectAccountId) {
    return NextResponse.redirect(dashboardUrl);
  }

  if (STRIPE_ENABLED) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const account = await stripe.accounts.retrieve(dbUser.stripeConnectAccountId);
      const onboarded = Boolean(
        account.charges_enabled && account.payouts_enabled
      );
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { stripeConnectOnboarded: onboarded },
      });

      // Si l'onboarding vient de se terminer, on rattrape les commissions
      // accumulées en `confirmed` qui n'avaient pas pu être versées faute
      // d'IBAN. Async/fire-and-forget pour ne pas bloquer le redirect.
      if (onboarded) {
        payoutPendingCommissionsForAffiliate(dbUser.id).catch((e) =>
          console.error("[connect.callback] catchup payout", e)
        );
      }
    } catch (e) {
      console.error("[affiliate.connect.callback]", e);
    }
  }

  dashboardUrl.searchParams.set("onboarded", "1");
  return NextResponse.redirect(dashboardUrl);
}
