import { TrendingDown, Sparkle } from "lucide-react";
import type { PriceTier } from "@/lib/types/products";

interface Props {
  tiers: PriceTier[];
  samplePrice: number | null;
}

export function PriceTable({ tiers, samplePrice }: Props) {
  if (tiers.length === 0) return null;

  const cheapest = Math.min(...tiers.map((t) => t.unitPrice));
  const reference = tiers[0]?.unitPrice ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200">
      <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-4 py-3">
        <h3 className="text-sm font-bold text-neutral-900">
          Prix unitaire selon volume
        </h3>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          FOB · HT
        </span>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-neutral-50/50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          <tr>
            <th className="px-4 py-2 text-left">Quantité</th>
            <th className="px-4 py-2 text-right">Prix unitaire</th>
            <th className="px-4 py-2 text-right">Économie</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {tiers.map((tier, i) => {
            const isCheapest = tier.unitPrice === cheapest;
            const savings = Math.round(
              ((reference - tier.unitPrice) / reference) * 100
            );
            return (
              <tr
                key={tier.minQty}
                className={
                  isCheapest ? "bg-primary-50/40" : "transition-colors hover:bg-neutral-50/50"
                }
              >
                <td className="px-4 py-3 text-[13.5px] font-semibold text-neutral-900">
                  {tier.minQty}+
                  {isCheapest && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                      <Sparkle className="h-2 w-2" />
                      Best
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-display text-base font-extrabold tracking-tight text-neutral-900">
                  {tier.unitPrice.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </td>
                <td className="px-4 py-3 text-right">
                  {i === 0 ? (
                    <span className="text-xs text-neutral-400">—</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <TrendingDown className="h-3 w-3" />-{savings}%
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {samplePrice !== null && (
        <div className="border-t border-neutral-100 bg-amber-50/40 px-4 py-3">
          <p className="text-[13px] text-neutral-700">
            <strong className="font-bold text-amber-700">Sample</strong> · 1
            unité expédiée chez toi :{" "}
            <strong className="text-neutral-900">
              {samplePrice.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
