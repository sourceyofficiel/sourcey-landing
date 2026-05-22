"use client";

import { useState, useMemo } from "react";
import { TrendingUp, Users, Banknote } from "lucide-react";

/**
 * AffiliateSimulator — calcule en live les revenus selon nombre de filleuls.
 *
 * Inputs :
 *   - plan affilié (essential / pro / premium)
 *   - nombre de filleuls (slider 1-50)
 *   - plan moyen des filleuls (essential / pro / premium)
 *
 * Outputs :
 *   - mois 1 (one-shot 100% × nb filleuls)
 *   - mois 2+ (récurrent rate × prix filleul × nb filleuls)
 *   - revenus annuels approximatifs
 */

const PLANS = {
  essential: { name: "Essentiel", price: 29, rate: 0.05 },
  pro: { name: "Pro", price: 79, rate: 0.1 },
  premium: { name: "Premium", price: 149, rate: 0.15 },
} as const;

type PlanKey = keyof typeof PLANS;

export function AffiliateSimulator() {
  const [affiliatePlan, setAffiliatePlan] = useState<PlanKey>("pro");
  const [referredPlan, setReferredPlan] = useState<PlanKey>("pro");
  const [nbReferrals, setNbReferrals] = useState(5);

  const calc = useMemo(() => {
    const aff = PLANS[affiliatePlan];
    const ref = PLANS[referredPlan];
    const month1 = ref.price * nbReferrals; // 100% du prix mensuel × nb filleuls
    const recurringMonthly = ref.price * aff.rate * nbReferrals;
    const year1Total = month1 + recurringMonthly * 11; // mois 1 + 11 mois récurrents
    return {
      month1,
      recurringMonthly,
      year1Total,
      ratePct: aff.rate * 100,
    };
  }, [affiliatePlan, referredPlan, nbReferrals]);

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.15)]">
      <div className="grid gap-0 md:grid-cols-[1fr_1.1fr]">
        {/* === LEFT : inputs === */}
        <div className="border-b border-neutral-200 bg-neutral-50/50 p-7 md:border-b-0 md:border-r md:p-9">
          <h3 className="font-display text-[20px] font-extrabold tracking-tight text-neutral-900">
            Configure ta simulation
          </h3>
          <p className="mt-1 text-[13px] text-neutral-500">
            Joue avec les valeurs pour voir l&apos;impact sur tes revenus.
          </p>

          {/* Plan affilié */}
          <div className="mt-7">
            <label className="block text-[12px] font-bold uppercase tracking-wider text-neutral-500">
              Ton plan affilié
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(PLANS) as PlanKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAffiliatePlan(key)}
                  className={`rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all ${
                    affiliatePlan === key
                      ? "bg-primary-600 text-white shadow-[0_8px_20px_-8px_rgba(56,107,255,0.5)]"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-primary-300 hover:text-neutral-900"
                  }`}
                >
                  {PLANS[key].name}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-neutral-400">
              Taux récurrent : <strong>{calc.ratePct.toFixed(0)}%</strong>
            </p>
          </div>

          {/* Plan filleuls */}
          <div className="mt-6">
            <label className="block text-[12px] font-bold uppercase tracking-wider text-neutral-500">
              Plan moyen de tes filleuls
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(Object.keys(PLANS) as PlanKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReferredPlan(key)}
                  className={`rounded-xl px-3 py-2.5 text-[13px] font-bold transition-all ${
                    referredPlan === key
                      ? "bg-neutral-900 text-white"
                      : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                  }`}
                >
                  {PLANS[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Nombre de filleuls */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="block text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                Nombre de filleuls
              </label>
              <span className="font-display text-[18px] font-extrabold text-primary-600">
                {nbReferrals}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              value={nbReferrals}
              onChange={(e) => setNbReferrals(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary-600"
            />
            <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
              <span>1</span>
              <span>50</span>
            </div>
          </div>
        </div>

        {/* === RIGHT : results === */}
        <div className="bg-gradient-to-br from-primary-50/40 via-white to-white p-7 md:p-9">
          <h3 className="font-display text-[20px] font-extrabold tracking-tight text-neutral-900">
            Tes revenus estimés
          </h3>
          <p className="mt-1 text-[13px] text-neutral-500">
            Avec {nbReferrals} filleul{nbReferrals > 1 ? "s" : ""} sur le plan{" "}
            {PLANS[referredPlan].name}.
          </p>

          <div className="mt-7 grid gap-4">
            {/* Mois 1 */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Banknote className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                    Mois 1 (one-shot)
                  </div>
                  <div className="mt-1 font-display text-[28px] font-extrabold leading-none text-neutral-900">
                    {calc.month1.toLocaleString("fr-FR")} €
                  </div>
                  <div className="mt-1.5 text-[12px] text-neutral-500">
                    100% du 1er mois × {nbReferrals} filleul
                    {nbReferrals > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Récurrent */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">
                    Mois 2+ (récurrent)
                  </div>
                  <div className="mt-1 font-display text-[28px] font-extrabold leading-none text-neutral-900">
                    {calc.recurringMonthly.toLocaleString("fr-FR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}{" "}
                    €<span className="text-[14px] text-neutral-400">/mois</span>
                  </div>
                  <div className="mt-1.5 text-[12px] text-neutral-500">
                    {calc.ratePct.toFixed(0)}% × {PLANS[referredPlan].price} € ×{" "}
                    {nbReferrals}
                  </div>
                </div>
              </div>
            </div>

            {/* Année 1 total */}
            <div className="relative overflow-hidden rounded-2xl bg-[#0E1535] p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-bold uppercase tracking-wider text-white/60">
                    Total estimé sur 12 mois
                  </div>
                  <div className="mt-1 font-display text-[34px] font-extrabold leading-none">
                    {calc.year1Total.toLocaleString("fr-FR", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{" "}
                    €
                  </div>
                  <div className="mt-1.5 text-[12px] text-white/60">
                    Si tous tes filleuls restent abonnés toute l&apos;année
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
