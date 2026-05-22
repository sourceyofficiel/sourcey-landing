"use client";

import { useState } from "react";
import { PLANS, type Period, normalizePlanSlug } from "@/lib/plans";
import { BillingToggle } from "@/components/pricing/BillingToggle";
import { PlanCard } from "@/components/pricing/PlanCard";

type PricingViewer =
  | { state: "anonymous" }
  | { state: "free"; userId: string }
  | { state: "paid"; userId: string; currentPlan: string };

/**
 * PricingGrid — toggle + grille des 4 plans.
 *
 * Le state du toggle (mensuel/annuel) est local. Le state du viewer
 * (anonyme / connecté free / connecté payant) vient du serveur via le
 * prop `viewer` pour affichage SSR-friendly du badge "Plan actuel".
 */
export function PricingGrid({ viewer }: { viewer: PricingViewer }) {
  const [period, setPeriod] = useState<Period>("monthly");

  // URL du portail Stripe — sera fetchée à la volée si l'user clique
  // "Gérer mon abonnement". Stocké ici en placeholder pour simplifier.
  const portalUrl = "/api/billing/portal";

  return (
    <div>
      {/* Toggle */}
      <div className="flex justify-center">
        <BillingToggle period={period} onChange={setPeriod} />
      </div>

      {/* Grid */}
      <div className="mt-10 grid gap-5 md:gap-6 lg:grid-cols-4">
        {PLANS.map((plan) => {
          let mode: Parameters<typeof PlanCard>[0]["mode"];
          if (viewer.state === "anonymous") {
            mode = { kind: "anonymous" };
          } else if (viewer.state === "free") {
            mode = { kind: "free-user" };
          } else {
            // paid : check si c'est le plan actif
            const currentBase = normalizePlanSlug(viewer.currentPlan);
            if (currentBase === plan.slug) {
              mode = { kind: "current", portalUrl };
            } else {
              mode = { kind: "upgrade" };
            }
          }
          return (
            <PlanCard key={plan.slug} plan={plan} period={period} mode={mode} />
          );
        })}
      </div>
    </div>
  );
}
