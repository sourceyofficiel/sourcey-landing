import type { Metadata } from "next";
import { ShieldCheck, Zap, Users, Star, Sparkles } from "lucide-react";

import { V2TopBanner } from "@/components/v2/V2TopBanner";
import { V2Nav } from "@/components/v2/V2Nav";
import { V2Background } from "@/components/v2/V2Background";
import { V2Footer } from "@/components/v2/V2Footer";

import { PricingGrid } from "@/components/pricing/PricingGrid";
import { OrderDiscountSection } from "@/components/pricing/OrderDiscountSection";
import { PassiveRevenueSection } from "@/components/pricing/PassiveRevenueSection";
import { PricingFaq } from "@/components/pricing/PricingFaq";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tarifs — Sourcey",
  description:
    "4 plans Sourcey : Découvrir (gratuit), Essentiel 29€, Pro 79€, Premium 149€. Réductions sur commandes jusqu'à −15%. Sans engagement.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const user = await getCurrentUser();

  // Récupère le plan Stripe stocké en base pour afficher "Plan actuel"
  let viewer:
    | { state: "anonymous" }
    | { state: "free"; userId: string }
    | { state: "paid"; userId: string; currentPlan: string };

  if (!user) {
    viewer = { state: "anonymous" };
  } else {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { plan: true },
    });
    const currentPlan = dbUser?.plan ?? "free";
    if (currentPlan === "free") {
      viewer = { state: "free", userId: user.id };
    } else {
      viewer = { state: "paid", userId: user.id, currentPlan };
    }
  }

  return (
    <main className="relative min-h-screen">
      <V2Background />
      <V2TopBanner />
      <V2Nav user={user} />

      {/* === Hero pricing : title + subtitle + toggle inclus dans PricingGrid === */}
      <section className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-16 md:px-8 md:pb-16 md:pt-24">
        <div className="mx-auto max-w-[760px] text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-100">
            <Sparkles className="h-3 w-3" />
            Tarifs transparents
          </div>
          <h1 className="mt-5 font-display text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900">
            Un plan{" "}
            <span className="text-primary-600">pour chaque étape</span> de ton
            business.
          </h1>
          <p className="mx-auto mt-5 max-w-[600px] text-[15px] leading-relaxed text-neutral-500 md:text-[16.5px]">
            Démarre gratuitement. Bascule sur Essentiel quand tu lances ta
            première gamme. Passe en Pro pour scaler. Tout est sans engagement
            et résiliable en 1 clic.
          </p>
        </div>

        {/* Grid (avec toggle inclus) */}
        <div className="mt-12">
          <PricingGrid viewer={viewer} />
        </div>
      </section>

      {/* === Sections complémentaires === */}
      <OrderDiscountSection />
      <PassiveRevenueSection />
      <SocialProofBar />
      <PricingFaq />

      {/* Ligne de réassurance finale */}
      <section className="mx-auto max-w-[1100px] px-5 pb-20 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[12.5px] text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            Sans engagement
          </span>
          <span className="text-neutral-300">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            Résiliation en 1 clic
          </span>
          <span className="text-neutral-300">·</span>
          <span className="inline-flex items-center gap-1.5">
            Paiement sécurisé{" "}
            <strong className="font-semibold text-neutral-700">Stripe</strong>
          </span>
        </div>
      </section>

      <V2Footer />
    </main>
  );
}

/* ============================================================
   Bande de preuve sociale — 5 chiffres
   ============================================================ */

function SocialProofBar() {
  const STATS = [
    { value: "+340", label: "clients accompagnés" },
    { value: "28", label: "pays de fournisseurs" },
    { value: "4.9/5", label: "note moyenne", icon: Star },
    { value: "24h", label: "réponse moyenne" },
    { value: "0€", label: "engagement", icon: ShieldCheck },
  ];

  return (
    <section className="relative mx-auto max-w-[1100px] px-5 py-12 md:px-8">
      <ul className="grid grid-cols-2 gap-3 rounded-3xl border border-neutral-200 bg-white p-6 md:grid-cols-5 md:gap-6 md:p-8">
        {STATS.map((s) => {
          const Icon = s.icon ?? Users;
          return (
            <li key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1 font-display text-[22px] font-extrabold leading-none text-neutral-900 md:text-[26px]">
                {s.value}
                {s.icon === Star && (
                  <Icon className="h-4 w-4 fill-yellow-400 text-yellow-400 md:h-5 md:w-5" />
                )}
              </div>
              <div className="mt-1.5 text-[11.5px] text-neutral-500 md:text-[12.5px]">
                {s.label}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
