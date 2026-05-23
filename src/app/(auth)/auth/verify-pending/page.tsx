"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function VerifyPendingPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPending />
    </Suspense>
  );
}

/**
 * Page d'attente affichée après inscription :
 * "On t'a envoyé un mail, va le checker pour activer ton compte."
 */
function VerifyPending() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function resend() {
    if (resending || !email) return;
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="text-center">
      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="mt-5 font-display text-[24px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
        Check ta boîte mail
      </h1>
      <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-500">
        On t&apos;a envoyé un lien de confirmation à{" "}
        <strong className="text-neutral-900">{email || "ton adresse"}</strong>.
        Clique dessus pour activer ton compte. Tant que tu n&apos;as pas
        confirmé, tu ne peux pas te connecter.
      </p>

      <p className="mt-1.5 text-[12.5px] text-neutral-400">
        Le lien expire dans 24 heures.
      </p>

      <button
        type="button"
        onClick={resend}
        disabled={resending || resent}
        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 text-[13.5px] font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
      >
        {resending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
          </>
        ) : resent ? (
          <>
            <CheckCircle2 className="h-4 w-4 text-green-600" /> Email renvoyé
          </>
        ) : (
          "Renvoyer l'email"
        )}
      </button>

      <p className="mt-8 text-[13px] text-neutral-500">
        Mauvais email ?{" "}
        <Link
          href="/signup"
          className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
        >
          Refais une inscription
        </Link>
      </p>
    </div>
  );
}
