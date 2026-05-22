"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Copy, Check, Loader2 } from "lucide-react";

type ViewerState =
  | { kind: "anonymous" }
  | { kind: "free" }
  | { kind: "eligible_not_activated"; planSlug: string }
  | { kind: "activated"; planSlug: string; link: string; code: string };

/**
 * AffiliateCTAButton — bouton contextuel selon l'état de l'utilisateur.
 *
 *   anonymous              → "Connecte-toi pour commencer" → /auth/login
 *   free                   → "Passe sur un plan payant"    → /pricing
 *   eligible_not_activated → "Activer mon lien affilié"    → POST /api/affiliate/activate
 *   activated              → Affiche le lien + bouton Copier
 *
 * variant="dark" pour les sections sombres (CTA final).
 */
export function AffiliateCTAButton({
  viewerState,
  variant = "light",
}: {
  viewerState: ViewerState;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activatedLink, setActivatedLink] = useState<string | null>(null);

  const handleActivate = async () => {
    setActivating(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/activate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Erreur lors de l'activation");
        return;
      }
      setActivatedLink(data.link);
      router.refresh();
    } catch {
      setError("Erreur réseau");
    } finally {
      setActivating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencieux
    }
  };

  const baseBtn =
    "inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-[14.5px] font-bold transition-all";

  // === ANONYMOUS ===
  if (viewerState.kind === "anonymous") {
    return (
      <Link
        href="/auth/login?redirect=/affiliation"
        className={`${baseBtn} ${
          variant === "dark"
            ? "bg-white text-neutral-900 hover:bg-neutral-100"
            : "bg-primary-600 text-white hover:bg-primary-700"
        }`}
      >
        Connecte-toi pour activer ton lien
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  // === FREE ===
  if (viewerState.kind === "free") {
    return (
      <div className="flex flex-col items-center gap-2">
        <Link
          href="/pricing"
          className={`${baseBtn} ${
            variant === "dark"
              ? "bg-white text-neutral-900 hover:bg-neutral-100"
              : "bg-primary-600 text-white hover:bg-primary-700"
          }`}
        >
          Passe sur un plan payant
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p
          className={`text-[12px] ${variant === "dark" ? "text-white/60" : "text-neutral-500"}`}
        >
          Le programme d&apos;affiliation est réservé aux plans Essentiel, Pro
          et Premium.
        </p>
      </div>
    );
  }

  // === ACTIVATED ===
  // Si on vient de cliquer sur "Activer" et qu'on a un activatedLink → on bascule
  // sur l'affichage activated avec ce lien (sans nécessiter un refresh).
  const link =
    viewerState.kind === "activated" ? viewerState.link : activatedLink;

  if (link) {
    return (
      <div className="flex w-full max-w-[520px] flex-col items-center gap-3">
        <div
          className={`flex w-full items-center gap-2 rounded-2xl border p-1 pl-4 ${
            variant === "dark"
              ? "border-white/20 bg-white/10"
              : "border-neutral-200 bg-white"
          }`}
        >
          <span
            className={`flex-1 truncate text-left text-[13.5px] font-mono ${
              variant === "dark" ? "text-white" : "text-neutral-700"
            }`}
          >
            {link}
          </span>
          <button
            onClick={() => copyToClipboard(link)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-bold transition-colors ${
              variant === "dark"
                ? "bg-white text-neutral-900 hover:bg-neutral-100"
                : "bg-primary-600 text-white hover:bg-primary-700"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copié
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copier
              </>
            )}
          </button>
        </div>
        <Link
          href="/app/affiliation"
          className={`inline-flex items-center gap-1 text-[13px] font-medium ${
            variant === "dark"
              ? "text-white/80 hover:text-white"
              : "text-primary-600 hover:text-primary-700"
          }`}
        >
          Voir mon dashboard affiliation
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  // === ELIGIBLE NOT ACTIVATED ===
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleActivate}
        disabled={activating}
        className={`${baseBtn} disabled:opacity-60 ${
          variant === "dark"
            ? "bg-white text-neutral-900 hover:bg-neutral-100"
            : "bg-primary-600 text-white hover:bg-primary-700"
        }`}
      >
        {activating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Activation...
          </>
        ) : (
          <>
            Activer mon lien affilié <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {error && <p className="text-[12.5px] text-red-500">{error}</p>}
    </div>
  );
}
