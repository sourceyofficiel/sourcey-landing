"use client";

import { useEffect, useState } from "react";
import { MousePointerClick, Users, Clock, Wallet } from "lucide-react";

/**
 * AffiliateStats — 4 métriques en cartes :
 *   - clics totaux
 *   - filleuls actifs
 *   - commissions en attente (pending + confirmed non payées)
 *   - total gagné à vie (confirmed + paid)
 *
 * Fetch /api/affiliate/stats au mount, pas de polling (les données changent
 * peu et l'utilisateur peut refresh la page manuellement).
 */
interface StatsData {
  metrics: {
    totalClicks: number;
    activeReferrals: number;
    totalReferrals: number;
    unpaidAmount: number;
    lifetimeEarned: number;
  };
}

export function AffiliateStats() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/affiliate/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.activated) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[120px] animate-pulse rounded-2xl border border-neutral-200 bg-neutral-50"
          />
        ))}
      </div>
    );
  }

  if (!data) return null;
  const m = data.metrics;

  const cards = [
    {
      label: "Clics totaux",
      value: m.totalClicks.toLocaleString("fr-FR"),
      icon: MousePointerClick,
      color: "neutral",
    },
    {
      label: "Filleuls actifs",
      value: `${m.activeReferrals} / ${m.totalReferrals}`,
      icon: Users,
      color: "primary",
    },
    {
      label: "Commissions en attente",
      value: formatEuros(m.unpaidAmount),
      icon: Clock,
      color: "amber",
    },
    {
      label: "Total gagné à vie",
      value: formatEuros(m.lifetimeEarned),
      icon: Wallet,
      color: "green",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-2xl border border-neutral-200 bg-white p-5"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${ICON_COLORS[c.color]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 font-display text-[24px] font-extrabold leading-none text-neutral-900">
              {c.value}
            </div>
            <div className="mt-1.5 text-[12.5px] text-neutral-500">
              {c.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ICON_COLORS = {
  neutral: "bg-neutral-100 text-neutral-700",
  primary: "bg-primary-50 text-primary-600",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-green-50 text-green-600",
} as const;

function formatEuros(n: number): string {
  return n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
