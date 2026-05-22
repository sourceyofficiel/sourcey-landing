"use client";

import { useEffect, useState } from "react";

interface Payout {
  id: string;
  amount: number;
  status: "pending" | "processing" | "paid" | "failed";
  createdAt: string;
  paidAt: string | null;
  periodStart: string;
  periodEnd: string;
}

const STATUS_LABEL: Record<Payout["status"], { label: string; cls: string }> = {
  pending: {
    label: "En attente",
    cls: "bg-amber-50 text-amber-700",
  },
  processing: {
    label: "En cours",
    cls: "bg-blue-50 text-blue-700",
  },
  paid: {
    label: "Payé",
    cls: "bg-green-50 text-green-700",
  },
  failed: {
    label: "Échec",
    cls: "bg-red-50 text-red-700",
  },
};

/**
 * PayoutHistory — historique des virements mensuels reçus.
 */
export function PayoutHistory() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/affiliate/stats")
      .then((r) => r.json())
      .then((d) => {
        setPayouts(d.payouts ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-[160px] animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50" />
    );
  }

  if (payouts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center">
        <p className="text-[14px] font-medium text-neutral-700">
          Aucun virement pour l&apos;instant
        </p>
        <p className="mt-1 text-[13px] text-neutral-500">
          Les virements sont effectués automatiquement le 1er de chaque mois.
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
                Date
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Période
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Montant
              </th>
              <th className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Statut
              </th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr
                key={p.id}
                className="border-b border-neutral-100 text-[13.5px] last:border-b-0"
              >
                <td className="px-4 py-3 text-neutral-700">
                  {new Date(p.paidAt ?? p.createdAt).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </td>
                <td className="px-4 py-3 text-[12.5px] text-neutral-500">
                  {new Date(p.periodStart).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  →{" "}
                  {new Date(p.periodEnd).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </td>
                <td className="px-4 py-3 font-bold text-neutral-900">
                  {p.amount.toLocaleString("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_LABEL[p.status].cls}`}
                  >
                    {STATUS_LABEL[p.status].label}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
