"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn, formatEuro } from "@/lib/utils";
import { b2cPlans } from "@/lib/data/pricing";

export function SavingsCalculator() {
  const [quantity, setQuantity] = useState(500);
  const [unitPrice, setUnitPrice] = useState(3.5);
  const monthlyOrder = quantity * unitPrice;

  const rows = useMemo(() => {
    return b2cPlans.map((p) => ({
      plan: p,
      savings: monthlyOrder * p.unitDiscount,
      net: monthlyOrder * p.unitDiscount - p.priceMonthly,
    }));
  }, [monthlyOrder]);

  const bestIdx = useMemo(() => {
    let i = 0;
    rows.forEach((r, idx) => {
      if (r.net > rows[i].net) i = idx;
    });
    return i;
  }, [rows]);

  const bestRow = rows[bestIdx];

  return (
    <section className="mx-auto mt-16 max-w-4xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 md:p-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Calculateur d'économies
          </p>
          <h3 className="mt-2 font-display text-xl font-extrabold tracking-tight text-neutral-900">
            Quel plan est rentable pour toi ?
          </h3>
          <p className="mt-1 text-[13px] text-neutral-500">
            Décris ta commande typique. On te montre quel plan paye plus qu'il
            ne coûte.
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <SliderField
            label="Quantité par commande"
            value={quantity}
            min={50}
            max={5000}
            step={50}
            onChange={setQuantity}
            format={(v) => `${v.toLocaleString("fr-FR")} unités`}
          />
          <SliderField
            label="Prix unitaire usine moyen"
            value={unitPrice}
            min={0.5}
            max={30}
            step={0.5}
            onChange={setUnitPrice}
            format={(v) => `${v.toFixed(2)} €`}
          />
        </div>

        <div className="mt-5 flex items-baseline justify-between border-t border-neutral-100 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Montant mensuel de tes commandes
          </p>
          <p className="font-display text-xl font-extrabold tracking-tight text-neutral-900 tabular-nums">
            {formatEuro(monthlyOrder)}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-neutral-100">
          <table className="w-full text-sm">
            <thead className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              <tr className="border-b border-neutral-100">
                <th className="px-4 py-3 text-left font-bold">Plan</th>
                <th className="px-3 py-3 text-right font-bold">Abonnement</th>
                <th className="px-3 py-3 text-right font-bold">Économie brute</th>
                <th className="px-3 py-3 text-right font-bold">Net / mois</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((r, i) => {
                const isBest = i === bestIdx;
                return (
                  <motion.tr
                    key={r.plan.id}
                    layout
                    className={cn(
                      "transition-colors",
                      isBest ? "bg-primary-50/40" : ""
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-neutral-900">
                          {r.plan.name}
                        </span>
                        {r.plan.unitDiscount > 0 && (
                          <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-700">
                            −{Math.round(r.plan.unitDiscount * 100)} %
                          </span>
                        )}
                        {isBest && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                            Idéal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-neutral-700">
                      {r.plan.priceMonthly === 0
                        ? "—"
                        : `${r.plan.priceMonthly} €`}
                    </td>
                    <td className="px-3 py-3 text-right text-[13px] tabular-nums text-neutral-700">
                      {r.plan.unitDiscount === 0 ? (
                        <span className="text-neutral-400">
                          <Minus className="inline h-3 w-3" />
                        </span>
                      ) : (
                        `+${formatEuro(r.savings)}`
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-display text-[15px] font-extrabold tracking-tight tabular-nums">
                      <span
                        className={cn(
                          r.net > 0
                            ? "text-primary-700"
                            : r.net < 0
                              ? "text-neutral-500"
                              : "text-neutral-700"
                        )}
                      >
                        {r.net > 0 ? "+" : ""}
                        {formatEuro(r.net)}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-neutral-600">
            {bestRow.net > 0 ? (
              <>
                Avec{" "}
                <strong className="text-neutral-900">{bestRow.plan.name}</strong>,
                tu gagnes{" "}
                <strong className="text-primary-700">
                  {formatEuro(bestRow.net)}
                </strong>{" "}
                par mois net (soit {formatEuro(bestRow.net * 12)} / an).
              </>
            ) : (
              <>
                Pour ton volume,{" "}
                <strong className="text-neutral-900">Découverte</strong> suffit.
                Tu pourras upgrade quand ton volume montera.
              </>
            )}
          </p>
          <Button asChild variant="primary" size="md">
            <Link href={bestRow.plan.href}>
              Démarrer {bestRow.plan.name}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
          {label}
        </span>
        <span className="font-display text-[15px] font-extrabold tracking-tight text-neutral-900 tabular-nums">
          {format(value)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-primary-600"
        style={{
          background: `linear-gradient(to right, #2563EB 0%, #2563EB ${pct}%, #E2E8F0 ${pct}%, #E2E8F0 100%)`,
        }}
      />
      <div className="mt-1.5 flex justify-between text-[10px] text-neutral-400">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </label>
  );
}
