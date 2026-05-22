"use client";

import { useEffect, useState } from "react";

interface Referral {
  anonId: string;
  joinedAt: string;
  currentPlan: string;
  onetimeAmount: number;
  onetimeStatus: string;
  monthlyAmount: number;
  totalEarned: number;
  status: "active" | "inactive";
}

const PLAN_LABELS: Record<string, string> = {
  essential: "Essentiel",
  pro: "Pro",
  premium: "Premium",
  free: "Découvrir",
};

/**
 * ReferralTable — liste anonymisée des filleuls de l'affilié.
 *
 * Pas de nom/email pour préserver la confidentialité (RGPD). Chaque filleul
 * est identifié par un hash court ("F-AB12CD34") stable mais opaque.
 */
export function ReferralTable() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/affiliate/stats")
      .then((r) => r.json())
      .then((d) => {
        setReferrals(d.referrals ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[200px] animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50" />
    );
  }

  if (referrals.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-10 text-center">
        <p className="text-[14px] font-medium text-neutral-700">
          Pas encore de filleul
        </p>
        <p className="mt-1 text-[13px] text-neutral-500">
          Partage ton lien pour commencer à toucher des commissions.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Filleul
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Inscrit le
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Plan
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                1er mois
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Récurrent
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Total
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {referrals.map((r) => (
              <tr
                key={r.anonId}
                className="border-b border-neutral-100 text-[13.5px] last:border-b-0"
              >
                <td className="px-4 py-3 font-mono text-neutral-700">
                  {r.anonId}
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(r.joinedAt).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11.5px] font-bold text-neutral-700">
                    {PLAN_LABELS[r.currentPlan] ?? r.currentPlan}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-neutral-700">
                  {formatEuros(r.onetimeAmount)}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-700">
                  {r.monthlyAmount > 0
                    ? `${formatEuros(r.monthlyAmount)}/mois`
                    : "—"}
                </td>
                <td className="px-4 py-3 font-bold text-neutral-900">
                  {formatEuros(r.totalEarned)}
                </td>
                <td className="px-4 py-3">
                  {r.status === "active" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                      Inactif
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatEuros(n: number): string {
  if (n === 0) return "—";
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
