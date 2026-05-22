"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ArrowRight, Loader2, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Plan, Period } from "@/lib/plans";

type Mode =
  | { kind: "anonymous" }
  | { kind: "free-user" }
  | { kind: "current"; portalUrl: string }
  | { kind: "upgrade" };

export function PlanCard({
  plan,
  period,
  mode,
}: {
  plan: Plan;
  period: Period;
  mode: Mode;
}) {
  const [loading, setLoading] = useState(false);

  const isFree = plan.slug === "free";
  const monthlyPrice =
    period === "yearly" ? plan.priceYearlyMonthly : plan.priceMonthly;

  /* ----------------------------------------------------------
     CTA action selon le mode
     ---------------------------------------------------------- */

  async function handleCheckout() {
    if (loading) return;
    if (isFree) return; // CTA déjà géré par <Link> ci-dessous pour free

    if (mode.kind === "anonymous") {
      // Pas connecté → redirige vers signup avec le plan en query
      const planParam = period === "yearly" ? `${plan.slug}_yearly` : `${plan.slug}_monthly`;
      window.location.href = `/signup?plan=${planParam}`;
      return;
    }

    if (mode.kind === "current") {
      window.location.href = mode.portalUrl;
      return;
    }

    // free-user OU upgrade → checkout direct
    setLoading(true);
    try {
      const priceKey = `${plan.slug}_${period === "yearly" ? "yearly" : "monthly"}`;
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error ?? "Erreur");
      }
    } catch (e) {
      console.error(e);
      alert("Une erreur est survenue. Réessaie dans un instant.");
      setLoading(false);
    }
  }

  /* ----------------------------------------------------------
     CTA label dynamique
     ---------------------------------------------------------- */

  let ctaLabel = plan.ctaLabel;
  if (mode.kind === "current") ctaLabel = "Gérer mon abonnement";
  else if (mode.kind === "free-user" && !isFree)
    ctaLabel = `Passer à ${plan.name}`;
  else if (mode.kind === "upgrade" && !isFree)
    ctaLabel = `Passer à ${plan.name}`;

  /* ----------------------------------------------------------
     Render
     ---------------------------------------------------------- */

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-3xl border bg-white p-6 transition-all md:p-7",
        plan.highlighted
          ? "border-primary-300 shadow-[0_20px_50px_-15px_rgba(37,99,235,0.3)] lg:scale-[1.03]"
          : "border-neutral-200 shadow-sm"
      )}
    >
      {/* Badge "Plus populaire" (Pro) */}
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
            <Crown className="h-3 w-3" />
            Le plus choisi
          </span>
        </div>
      )}

      {/* Badge "Votre plan actuel" */}
      {mode.kind === "current" && (
        <div className="absolute -top-3 right-5">
          <span className="rounded-full bg-green-100 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-green-700 ring-1 ring-inset ring-green-200">
            Plan actuel
          </span>
        </div>
      )}

      {/* Nom + tagline */}
      <div>
        <h3 className="font-display text-[20px] font-extrabold tracking-tight text-neutral-900 md:text-[22px]">
          {plan.name}
        </h3>
        <p className="mt-1 text-[12.5px] leading-snug text-neutral-500">
          {plan.tagline}
        </p>
      </div>

      {/* Prix */}
      <div className="mt-5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[36px] font-extrabold leading-none text-neutral-900 md:text-[44px]">
            {monthlyPrice}€
          </span>
          {!isFree && (
            <span className="text-[12.5px] text-neutral-500">/ mois</span>
          )}
        </div>
        {period === "yearly" && !isFree && (
          <div className="mt-1.5 text-[11.5px] text-neutral-500">
            soit{" "}
            <strong className="text-neutral-700">
              {plan.priceYearlyTotal} €
            </strong>{" "}
            facturés à l&apos;année
          </div>
        )}
        {period === "monthly" && !isFree && (
          <div className="mt-1.5 text-[11.5px] text-neutral-400">
            ou {plan.priceYearlyMonthly}€/mois en annuel
          </div>
        )}
        {isFree && (
          <div className="mt-1.5 text-[11.5px] text-neutral-500">
            Pour toujours · sans CB
          </div>
        )}
      </div>

      {/* Order discount badge */}
      {plan.orderDiscount > 0 && (
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700 ring-1 ring-inset ring-primary-100">
          −{plan.orderDiscount}% sur chaque commande
        </div>
      )}

      {/* CTA */}
      <div className="mt-5">
        {isFree && mode.kind === "anonymous" ? (
          <Link
            href="/signup"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white text-[13.5px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
          >
            {ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : isFree ? (
          <div className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-100 text-[13.5px] font-semibold text-neutral-500">
            {mode.kind === "current" ? "Plan gratuit actif" : "Plan gratuit"}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-semibold transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
              plan.highlighted
                ? "bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.5)]"
                : "border border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
            )}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                {ctaLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Features list */}
      <ul className="mt-7 space-y-2.5 border-t border-neutral-100 pt-5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px] leading-snug text-neutral-700">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" strokeWidth={3} />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
