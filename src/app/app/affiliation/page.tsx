import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-mock";
import {
  buildAffiliateLink,
  isPlanEligibleForAffiliate,
  isSubscriptionActive,
  RECURRING_RATES,
} from "@/lib/affiliate";
import { normalizePlanSlug, getPlan } from "@/lib/plans";

import { AffiliateLink } from "./AffiliateLink";
import { AffiliateStats } from "./AffiliateStats";
import { ReferralTable } from "./ReferralTable";
import { PayoutHistory } from "./PayoutHistory";
import { StripeConnectBanner } from "./StripeConnectBanner";
import { ActivateAffiliateButton } from "./ActivateAffiliateButton";

export const metadata = { title: "Affiliation · Sourcey" };
export const dynamic = "force-dynamic";

/**
 * /app/affiliation — dashboard complet de l'affilié.
 *
 * Quatre états de la page :
 *   1. Plan free / sub inactive   → carte "Tu n'es pas encore éligible"
 *   2. Eligible mais pas activé   → carte d'activation 1-click
 *   3. Activé mais pas onboardé Stripe → banner urgent + dashboard partiel
 *   4. Activé + onboardé          → dashboard complet
 *
 * Les composants côté client (AffiliateStats, ReferralTable, PayoutHistory)
 * fetchent /api/affiliate/stats pour avoir les données fraîches (polling).
 */
export default async function AffiliateDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      plan: true,
      subscriptionStatus: true,
      affiliateCode: true,
      affiliateActive: true,
      affiliateSuspendedAt: true,
      stripeConnectAccountId: true,
      stripeConnectOnboarded: true,
    },
  });
  if (!dbUser) return null;

  const planSlug = normalizePlanSlug(dbUser.plan);
  const plan = getPlan(planSlug);
  const recurringRate = RECURRING_RATES[planSlug];
  const eligible =
    isPlanEligibleForAffiliate(dbUser.plan) &&
    isSubscriptionActive(dbUser.subscriptionStatus);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 md:py-10">
      {/* === Header === */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-neutral-900">
          Programme d&apos;affiliation
        </h1>
        <p className="text-sm text-neutral-600">
          Partage Sourcey, encaisse 100% du 1er mois + commission récurrente.
        </p>
      </div>

      {/* === État 1 : pas éligible === */}
      {!eligible && (
        <section className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <div className="bg-gradient-to-br from-primary-50 via-white to-white p-8 md:p-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-100">
              <Sparkles className="h-3 w-3" /> Programme d&apos;affiliation
            </div>
            <h2 className="mt-4 font-display text-[24px] font-extrabold tracking-tight text-neutral-900 md:text-[28px]">
              Passe sur un plan payant pour activer ton lien
            </h2>
            <p className="mt-2 max-w-[560px] text-[14px] text-neutral-500 md:text-[15px]">
              Le programme d&apos;affiliation est réservé aux abonnés
              Essentiel, Pro et Premium. Avec un plan payant, tu touches{" "}
              <strong className="text-neutral-700">100% du 1er mois</strong> de
              chaque filleul + une commission récurrente (5%, 10% ou 15%) sur
              son abonnement tant qu&apos;il reste client.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-primary-700"
              >
                Voir les plans <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/affiliation"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-3 text-[14px] font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                En savoir plus sur le programme
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* === État 2 : éligible mais pas activé === */}
      {eligible && !dbUser.affiliateActive && (
        <section className="mt-8 overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 md:p-10">
          <h2 className="font-display text-[22px] font-extrabold tracking-tight text-neutral-900 md:text-[26px]">
            Active ton programme en 1 clic
          </h2>
          <p className="mt-2 max-w-[560px] text-[14px] text-neutral-500 md:text-[15px]">
            Tu es abonné <strong>{plan?.name}</strong> — tu peux activer ton
            lien d&apos;affiliation et commencer à toucher des commissions
            immédiatement. Taux récurrent : <strong>{(recurringRate * 100).toFixed(0)}%</strong>.
          </p>
          <div className="mt-6">
            <ActivateAffiliateButton />
          </div>
        </section>
      )}

      {/* === État 3 / 4 : activé === */}
      {eligible && dbUser.affiliateActive && dbUser.affiliateCode && (
        <>
          {/* Bannière Stripe Connect si onboarding pas fini */}
          {!dbUser.stripeConnectOnboarded && <StripeConnectBanner />}

          {/* Suspension anti-fraude */}
          {dbUser.affiliateSuspendedAt && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="text-[14px] font-bold text-red-900">
                Ton lien est temporairement suspendu
              </h3>
              <p className="mt-1 text-[13px] text-red-700">
                Notre système anti-fraude a détecté une activité suspecte sur
                ton lien. Contacte le support pour réactiver.
              </p>
            </div>
          )}

          {/* Lien affilié + copier/partager */}
          <section className="mt-8">
            <AffiliateLink
              code={dbUser.affiliateCode}
              link={buildAffiliateLink(dbUser.affiliateCode)}
            />
          </section>

          {/* Métriques */}
          <section className="mt-6">
            <AffiliateStats />
          </section>

          {/* Tableau des filleuls */}
          <section className="mt-10">
            <h2 className="font-display text-[20px] font-extrabold tracking-tight text-neutral-900">
              Tes filleuls
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              Identifiants anonymisés pour préserver la confidentialité.
            </p>
            <div className="mt-4">
              <ReferralTable />
            </div>
          </section>

          {/* Historique des paiements */}
          <section className="mt-10">
            <h2 className="font-display text-[20px] font-extrabold tracking-tight text-neutral-900">
              Historique des virements
            </h2>
            <p className="mt-1 text-[13px] text-neutral-500">
              Versés instantanément dès que le filleul paye son abonnement.
            </p>
            <div className="mt-4">
              <PayoutHistory />
            </div>
          </section>

          {/* Encart "Ton taux actuel" + incentive upgrade */}
          <section className="mt-10 overflow-hidden rounded-3xl bg-[#0E1535] p-8 text-white md:p-10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-wider text-white/60">
                  Ton plan actuel : {plan?.name}
                </div>
                <div className="mt-2 font-display text-[34px] font-extrabold leading-none md:text-[44px]">
                  {(recurringRate * 100).toFixed(0)}%{" "}
                  <span className="text-[16px] font-medium text-white/60">
                    sur chaque mensualité filleul
                  </span>
                </div>
              </div>
              {planSlug !== "premium" && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-[14px] font-bold text-neutral-900 transition-colors hover:bg-neutral-100"
                >
                  Passer à Premium pour 15%
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
