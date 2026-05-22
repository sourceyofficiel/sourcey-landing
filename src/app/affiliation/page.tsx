import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Share2,
  UserPlus,
  Wallet,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";

import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2Footer } from "@/components/v2/V2Footer";
import { AffiliateSimulator } from "@/components/affiliate/AffiliateSimulator";
import { AffiliateCTAButton } from "@/components/affiliate/AffiliateCTAButton";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  PAYOUT_MIN_AMOUNT,
  RECURRING_RATES,
  buildAffiliateLink,
  isPlanEligibleForAffiliate,
  isSubscriptionActive,
} from "@/lib/affiliate";
import { normalizePlanSlug } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Programme d'affiliation — Sourcey",
  description:
    "Gagne jusqu'à 15% de commissions récurrentes en parrainant des e-commerçants sur Sourcey. 100% du premier mois reversé.",
};

export const dynamic = "force-dynamic";

export default async function AffiliationPage() {
  const user = await getCurrentUser();

  // Si user connecté + abonné + déjà activé → on lui affiche son lien direct.
  // Sinon → on calcule l'état du CTA pour le bouton (activer / s'abonner / login).
  let viewerState:
    | { kind: "anonymous" }
    | { kind: "free" }
    | { kind: "eligible_not_activated"; planSlug: string }
    | { kind: "activated"; planSlug: string; link: string; code: string };

  if (!user) {
    viewerState = { kind: "anonymous" };
  } else {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        plan: true,
        subscriptionStatus: true,
        affiliateCode: true,
        affiliateActive: true,
      },
    });
    const planSlug = normalizePlanSlug(dbUser?.plan);
    const eligible =
      isPlanEligibleForAffiliate(dbUser?.plan) &&
      isSubscriptionActive(dbUser?.subscriptionStatus);

    if (!eligible) {
      viewerState = { kind: "free" };
    } else if (dbUser?.affiliateActive && dbUser?.affiliateCode) {
      viewerState = {
        kind: "activated",
        planSlug,
        code: dbUser.affiliateCode,
        link: buildAffiliateLink(dbUser.affiliateCode),
      };
    } else {
      viewerState = { kind: "eligible_not_activated", planSlug };
    }
  }

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav user={user} transparentTop />

      {/* === HERO === */}
      <section className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-16 md:px-8 md:pb-16 md:pt-24">
        <div className="mx-auto max-w-[820px] text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-100">
            <Sparkles className="h-3 w-3" />
            Programme d&apos;affiliation
          </div>
          <h1 className="mt-5 font-display text-[clamp(34px,5.4vw,60px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900">
            Gagne jusqu&apos;à{" "}
            <span className="text-primary-600">15% chaque mois</span> en
            parrainant Sourcey.
          </h1>
          <p className="mx-auto mt-5 max-w-[640px] text-[15px] leading-relaxed text-neutral-500 md:text-[16.5px]">
            Tu connais un e-commerçant qui galère avec son sourcing en Chine ?
            Partage ton lien — touche{" "}
            <strong className="font-semibold text-neutral-900">
              100% de son premier mois
            </strong>{" "}
            puis une commission récurrente tant qu&apos;il reste abonné.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <AffiliateCTAButton viewerState={viewerState} />
            <p className="text-[12px] text-neutral-400">
              Sans engagement · Virement automatique le 1er du mois ·{" "}
              {PAYOUT_MIN_AMOUNT} € min
            </p>
          </div>
        </div>
      </section>

      {/* === COMMENT ÇA MARCHE === */}
      <section className="relative mx-auto max-w-[1100px] px-5 py-16 md:px-8 md:py-20">
        <h2 className="text-center font-display text-[clamp(26px,3.4vw,40px)] font-extrabold tracking-tight text-neutral-900">
          Comment ça marche
        </h2>
        <p className="mx-auto mt-3 max-w-[560px] text-center text-[14px] text-neutral-500 md:text-[15px]">
          Trois étapes simples, zéro paperasse, virement automatique chaque
          mois.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Share2,
              title: "Partage ton lien",
              desc: "Active ton lien unique en 1 clic depuis ton dashboard et envoie-le à qui tu veux : Instagram, WhatsApp, ton site, ta newsletter.",
              num: "1",
            },
            {
              icon: UserPlus,
              title: "Un filleul s'inscrit",
              desc: "Quand quelqu'un clique sur ton lien et prend un plan payant dans les 90 jours qui suivent, il devient ton filleul.",
              num: "2",
            },
            {
              icon: Wallet,
              title: "Touche tes commissions",
              desc: "100% du 1er mois + une commission récurrente chaque mois (5/10/15% selon ton plan), virées automatiquement sur ton compte.",
              num: "3",
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-3xl border border-neutral-200 bg-white p-7 transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.12)]"
              >
                <div className="absolute right-6 top-6 text-[44px] font-extrabold leading-none text-neutral-100">
                  {step.num}
                </div>
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-[18px] font-extrabold tracking-tight text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* === TABLEAU DES COMMISSIONS === */}
      <section className="relative mx-auto max-w-[1000px] px-5 py-16 md:px-8 md:py-20">
        <h2 className="text-center font-display text-[clamp(26px,3.4vw,40px)] font-extrabold tracking-tight text-neutral-900">
          Tes commissions selon ton plan
        </h2>
        <p className="mx-auto mt-3 max-w-[600px] text-center text-[14px] text-neutral-500 md:text-[15px]">
          Plus tu es sur un plan élevé, plus ta commission récurrente est
          importante. <strong className="text-neutral-700">100% du premier mois</strong>{" "}
          dans tous les cas, peu importe le plan du filleul.
        </p>

        <div className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                  Ton plan affilié
                </th>
                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                  1er mois (one-shot)
                </th>
                <th className="px-6 py-4 text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                  Mois 2+ (récurrent)
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  { slug: "essential", name: "Essentiel", price: "29 €/mois", highlight: false },
                  { slug: "pro", name: "Pro", price: "79 €/mois", highlight: true },
                  { slug: "premium", name: "Premium", price: "149 €/mois", highlight: false },
                ] as const
              ).map((row) => {
                const rate = RECURRING_RATES[row.slug] * 100;
                return (
                  <tr
                    key={row.slug}
                    className={`border-b border-neutral-100 last:border-b-0 ${row.highlight ? "bg-primary-50/40" : ""}`}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="font-display text-[18px] font-extrabold text-neutral-900">
                          {row.name}
                        </div>
                        {row.highlight && (
                          <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                            Populaire
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-neutral-500">
                        {row.price}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-[15px] font-bold text-neutral-900">
                        100% du 1er mois
                      </div>
                      <div className="text-[12.5px] text-neutral-500">
                        Peu importe le plan du filleul
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-display text-[22px] font-extrabold text-primary-600">
                        {rate.toFixed(0)}%
                      </div>
                      <div className="text-[12.5px] text-neutral-500">
                        de l&apos;abonnement, à vie
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* === SIMULATEUR === */}
      <section className="relative mx-auto max-w-[1100px] px-5 py-16 md:px-8 md:py-20">
        <h2 className="text-center font-display text-[clamp(26px,3.4vw,40px)] font-extrabold tracking-tight text-neutral-900">
          Combien tu peux gagner ?
        </h2>
        <p className="mx-auto mt-3 max-w-[600px] text-center text-[14px] text-neutral-500 md:text-[15px]">
          Choisis ton plan et ajuste le nombre de filleuls — on calcule
          instantanément tes revenus passifs.
        </p>
        <div className="mt-10">
          <AffiliateSimulator />
        </div>
      </section>

      {/* === CONDITIONS === */}
      <section className="relative mx-auto max-w-[1100px] px-5 py-16 md:px-8">
        <h2 className="text-center font-display text-[clamp(26px,3.4vw,40px)] font-extrabold tracking-tight text-neutral-900">
          Les règles du jeu
        </h2>
        <div className="mx-auto mt-10 grid max-w-[800px] gap-4 md:grid-cols-2">
          {[
            {
              icon: ShieldCheck,
              title: "Réservé aux abonnés payants",
              desc: "Essentiel, Pro ou Premium. Le plan Découvrir ne donne pas accès au programme.",
            },
            {
              icon: Zap,
              title: "Cookie 90 jours",
              desc: "Tu touches ta commission même si le filleul s'inscrit jusqu'à 90 jours après son premier clic.",
            },
            {
              icon: Wallet,
              title: "Virement automatique",
              desc: `Le 1er de chaque mois, à partir de ${PAYOUT_MIN_AMOUNT} € cumulés. En dessous, tu reportes au mois suivant.`,
            },
            {
              icon: ShieldCheck,
              title: "Délai de confirmation 15 jours",
              desc: "Les commissions sont confirmées 15 jours après création (délai de remboursement éventuel).",
            },
          ].map((cond) => {
            const Icon = cond.icon;
            return (
              <div
                key={cond.title}
                className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[14.5px] font-bold text-neutral-900">
                    {cond.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                    {cond.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* === CTA FINAL === */}
      <section className="relative mx-auto max-w-[1100px] px-5 pb-24 pt-8 md:px-8">
        <div className="overflow-hidden rounded-[28px] bg-[#0E1535] p-10 text-center text-white md:p-14">
          <h2 className="font-display text-[clamp(26px,3.4vw,40px)] font-extrabold tracking-tight">
            Prêt à monétiser ton réseau ?
          </h2>
          <p className="mx-auto mt-3 max-w-[520px] text-[14.5px] text-white/70">
            Active ton lien en 30 secondes et commence à toucher des
            commissions dès le premier filleul.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3">
            <AffiliateCTAButton viewerState={viewerState} variant="dark" />
            {viewerState.kind === "anonymous" && (
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-[12.5px] text-white/60 transition-colors hover:text-white"
              >
                Voir les plans <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      </section>

      <V2Footer />
    </main>
  );
}
