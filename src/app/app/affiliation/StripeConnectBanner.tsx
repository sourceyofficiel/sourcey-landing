"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, Loader2, X } from "lucide-react";

/**
 * Bannière d'alerte affichée tant que l'affilié n'a pas terminé son onboarding
 * Stripe Connect (renseigner IBAN). Sans ça, on ne peut pas le virer.
 */
export function StripeConnectBanner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startOnboarding = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/stripe-connect/onboard", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(
          data.message ?? data.error ?? "Erreur inconnue côté Stripe."
        );
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      setError(
        e instanceof Error
          ? `Erreur réseau : ${e.message}`
          : "Erreur réseau inconnue"
      );
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:flex-row md:items-center md:p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-[14px] font-bold text-amber-900">
              Renseigne tes coordonnées bancaires
            </h3>
            <p className="mt-1 text-[13px] text-amber-800">
              Pour recevoir tes virements mensuels, complète l&apos;onboarding
              Stripe Connect (IBAN + identité). Sans ça, tes commissions
              s&apos;accumulent mais ne sont pas versées.
            </p>
          </div>
        </div>
        <button
          onClick={startOnboarding}
          disabled={loading}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement...
            </>
          ) : (
            <>
              Compléter mon profil <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Erreur si l'API a renvoyé un message */}
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <h4 className="text-[13px] font-bold text-red-900">
                Impossible de lancer l&apos;onboarding
              </h4>
              <p className="mt-1 whitespace-pre-line text-[12.5px] leading-relaxed text-red-700">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            aria-label="Fermer"
            className="shrink-0 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
