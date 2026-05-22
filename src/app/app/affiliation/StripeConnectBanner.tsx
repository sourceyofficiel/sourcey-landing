"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

/**
 * Bannière d'alerte affichée tant que l'affilié n'a pas terminé son onboarding
 * Stripe Connect (renseigner IBAN). Sans ça, on ne peut pas le virer.
 */
export function StripeConnectBanner() {
  const [loading, setLoading] = useState(false);

  const startOnboarding = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/stripe-connect/onboard", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 md:flex-row md:items-center md:p-6">
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
  );
}
