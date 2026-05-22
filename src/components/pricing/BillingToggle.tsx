"use client";

import { cn } from "@/lib/utils";
import type { Period } from "@/lib/plans";

/**
 * Toggle mensuel / annuel pour la grille de pricing.
 * État partagé géré par le parent (page.tsx).
 */
export function BillingToggle({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
          period === "monthly"
            ? "bg-neutral-900 text-white"
            : "text-neutral-600 hover:text-neutral-900"
        )}
      >
        Mensuel
      </button>
      <button
        type="button"
        onClick={() => onChange("yearly")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors",
          period === "yearly"
            ? "bg-neutral-900 text-white"
            : "text-neutral-600 hover:text-neutral-900"
        )}
      >
        Annuel
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            period === "yearly"
              ? "bg-green-500 text-white"
              : "bg-green-100 text-green-700"
          )}
        >
          −20%
        </span>
      </button>
    </div>
  );
}
