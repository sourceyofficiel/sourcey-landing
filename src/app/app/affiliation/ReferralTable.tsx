"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldOff } from "lucide-react";

interface Referral {
  anonId: string;
  joinedAt: string;
  currentPlan: string;
  onetimeAmount: number;
  onetimeStatus: string;
  onetimeFlaggedReason: string | null;
  monthlyAmount: number;
  totalEarned: number;
  status: "active" | "inactive";
}

const FLAGGED_REASON_LABELS: Record<string, string> = {
  self_referral:
    "Tu ne peux pas être ton propre filleul — commission annulée.",
  same_ip_signup:
    "Inscription depuis la même IP qu'un de tes clics (probable test perso). Désactivable via SOURCEY_AFFILIATE_DISABLE_IP_CHECK=1.",
  affiliate_inactive: "Ton programme n'était pas actif à ce moment-là.",
  manual_review: "Commission marquée pour revue manuelle par l'équipe.",
};

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
 *
 * Si `isAdmin=true`, ajoute un bouton "Forcer le paiement" sur les commissions
 * cancelled (utile pour débloquer un faux positif anti-fraude).
 */
export function ReferralTable({ isAdmin = false }: { isAdmin?: boolean } = {}) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [unflagging, setUnflagging] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    fetch("/api/affiliate/stats")
      .then((r) => r.json())
      .then((d) => {
        setReferrals(d.referrals ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unflagAll = async () => {
    setUnflagging("all");
    try {
      const res = await fetch("/api/affiliate/admin/unflag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Erreur");
      } else {
        alert(
          `${data.processed} commission(s) débloquée(s). Virements en cours.`
        );
        fetchData();
      }
    } catch (e) {
      alert("Erreur réseau");
    } finally {
      setUnflagging(null);
    }
  };

  const rebuild = async () => {
    setUnflagging("rebuild");
    try {
      const res = await fetch("/api/affiliate/admin/rebuild", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Erreur");
      } else {
        alert(
          `Reconstruit : ${data.created} créée(s), ${data.skipped} déjà OK.`
        );
        fetchData();
      }
    } catch (e) {
      alert("Erreur réseau");
    } finally {
      setUnflagging(null);
    }
  };

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

  const hasCancelled = referrals.some(
    (r) => r.onetimeStatus === "cancelled"
  );
  // Filleul présent sans commission créée (onetimeAmount=0 et status défaut)
  // → indique que le webhook checkout.session.completed n'a pas tourné.
  const hasMissingCommissions = referrals.some(
    (r) => r.onetimeAmount === 0 && r.onetimeStatus !== "cancelled"
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {/* Bandeau admin */}
      {isAdmin && (hasCancelled || hasMissingCommissions) && (
        <div className="flex flex-col items-start gap-3 border-b border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2 text-[12.5px] text-amber-900">
            <ShieldOff className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <strong>Mode admin</strong> — Actions disponibles pour débloquer
              les commissions :
              <ul className="ml-4 mt-1 list-disc space-y-0.5">
                {hasMissingCommissions && (
                  <li>
                    Des filleuls n&apos;ont pas de commission créée (webhook
                    raté). Utilise <strong>Reconstruire</strong>.
                  </li>
                )}
                {hasCancelled && (
                  <li>
                    Des commissions ont été annulées par l&apos;anti-fraude.
                    Utilise <strong>Forcer les annulées</strong> si tu
                    confirmes qu&apos;elles sont légitimes.
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasMissingCommissions && (
              <button
                onClick={rebuild}
                disabled={unflagging === "rebuild"}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {unflagging === "rebuild" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reconstruction…
                  </>
                ) : (
                  "Reconstruire les commissions manquantes"
                )}
              </button>
            )}
            {hasCancelled && (
              <button
                onClick={unflagAll}
                disabled={unflagging === "all"}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-[12.5px] font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
              >
                {unflagging === "all" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Traitement…
                  </>
                ) : (
                  "Forcer toutes les annulées"
                )}
              </button>
            )}
          </div>
        </div>
      )}
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
                <td className="px-4 py-3">
                  {r.onetimeStatus === "cancelled" ? (
                    <div
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-[11.5px] font-bold text-red-700"
                      title={
                        FLAGGED_REASON_LABELS[r.onetimeFlaggedReason ?? ""] ??
                        "Commission annulée"
                      }
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {formatEuros(r.onetimeAmount)} annulée
                    </div>
                  ) : (
                    <span className="font-medium text-neutral-700">
                      {formatEuros(r.onetimeAmount)}
                      {r.onetimeStatus === "pending" && (
                        <span className="ml-1 text-[11px] text-amber-600">
                          (en attente)
                        </span>
                      )}
                    </span>
                  )}
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
