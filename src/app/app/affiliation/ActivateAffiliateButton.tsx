"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

/**
 * ActivateAffiliateButton — bouton 1-click pour activer le programme depuis
 * le dashboard. Appelle /api/affiliate/activate puis recharge la page (router.refresh)
 * pour basculer sur l'état "activé".
 */
export function ActivateAffiliateButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/activate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Erreur lors de l'activation");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={activate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Activation...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Activer mon programme
          </>
        )}
      </button>
      {error && <p className="text-[12.5px] text-red-500">{error}</p>}
    </div>
  );
}
