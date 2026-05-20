"use client";

import { useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";

/**
 * Boutons d'actions pour le plan actuel :
 *  - Si user a un abo Stripe → bouton "Gérer mon abonnement" (Customer Portal)
 *  - Sinon → rien (les CTAs d'upgrade sont en dessous)
 */
export function BillingActions({
  hasSubscription,
  currentPlan,
}: {
  hasSubscription: boolean;
  currentPlan: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Erreur");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  if (!hasSubscription || currentPlan === "free") {
    return null;
  }

  return (
    <div>
      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-[13.5px] font-semibold text-neutral-900 transition-colors hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <ExternalLink className="h-3.5 w-3.5" />
            Gérer mon abonnement
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-[12px] text-rose-600">{error}</p>
      )}
    </div>
  );
}
