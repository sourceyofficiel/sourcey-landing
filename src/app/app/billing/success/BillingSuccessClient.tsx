"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  free: "Découvrir",
  essential: "Essentiel",
  essential_annual: "Essentiel (annuel)",
  pro: "Pro",
  pro_annual: "Pro (annuel)",
  premium: "Premium",
  premium_annual: "Premium (annuel)",
};

/**
 * Confirme le paiement en force-sync côté serveur via /api/billing/sync.
 * Retry x3 en cas d'échec (au cas où Stripe n'a pas encore propagé la sub).
 */
export function BillingSuccessClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ok"; plan: string }
    | { status: "error"; message: string }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    const tryOnce = async (): Promise<void> => {
      attempts++;
      try {
        const res = await fetch("/api/billing/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.ok && data.plan) {
          setState({ status: "ok", plan: data.plan });
        } else if (attempts < MAX_ATTEMPTS) {
          // Retry after delay — Stripe peut ne pas avoir encore propagé la sub.
          setTimeout(tryOnce, 1500 * attempts);
        } else {
          setState({
            status: "error",
            message:
              data.error ??
              "Synchronisation en attente. Recharge la page dans quelques secondes.",
          });
        }
      } catch (e) {
        if (cancelled) return;
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(tryOnce, 1500 * attempts);
        } else {
          setState({ status: "error", message: "Erreur réseau" });
        }
      }
    };

    tryOnce();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      {state.status === "loading" && (
        <>
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Loader2 className="h-9 w-9 animate-spin" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-neutral-900">
            Activation en cours…
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
            On synchronise ton abonnement avec ton compte. Quelques secondes
            seulement.
          </p>
        </>
      )}

      {state.status === "ok" && (
        <>
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-neutral-900">
            Paiement réussi 🎉
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
            Ton plan{" "}
            <strong className="text-neutral-900">
              {PLAN_LABELS[state.plan] ?? state.plan}
            </strong>{" "}
            est maintenant actif. On te recontacte sur WhatsApp pour
            t&apos;aider à en profiter au max.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/app/new"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <MessageSquare className="h-4 w-4" />
              Soumettre un nouveau brief
            </Link>
            <Link
              href="/app"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-[14px] font-semibold text-neutral-900 transition-colors hover:border-neutral-300"
            >
              Retour au tableau de bord
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </>
      )}

      {state.status === "error" && (
        <>
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <AlertCircle className="h-9 w-9" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-neutral-900">
            Activation en attente
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
            {state.message} Ton paiement est bien passé — l&apos;abonnement
            sera actif dans quelques instants.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Réessayer
            </button>
            <Link
              href="/app"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-[14px] font-semibold text-neutral-900 transition-colors hover:border-neutral-300"
            >
              Retour au tableau de bord
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
