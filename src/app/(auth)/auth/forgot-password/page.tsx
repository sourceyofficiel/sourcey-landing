"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

/**
 * Mot de passe oublié — étape 1 : saisie de l'email.
 *
 * Pour des raisons anti-énumération, la réponse est TOUJOURS "ok, on a envoyé
 * un email" même si l'email n'existe pas en base. On ne dévoile JAMAIS aux
 * attaquants quels comptes existent.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-[24px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
          Si ce compte existe…
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-500">
          On vient d&apos;envoyer un lien de réinitialisation à{" "}
          <strong className="text-neutral-900">{email}</strong>. Clique dessus
          pour choisir un nouveau mot de passe.
        </p>
        <p className="mt-1.5 text-[12.5px] text-neutral-400">
          Le lien expire dans 1 heure.
        </p>
        <p className="mt-7 text-[13px] text-neutral-500">
          <Link
            href="/login"
            className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
          >
            Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <h1 className="font-display text-[24px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
        Mot de passe oublié&nbsp;?
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
        Indique l&apos;email de ton compte, on t&apos;envoie un lien pour
        choisir un nouveau mot de passe.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-neutral-700"
          >
            Email
          </label>
          <input
            id="email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ton@email.com"
            autoComplete="email"
            className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 text-[15px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
            </>
          ) : (
            "Envoyer le lien de réinitialisation"
          )}
        </button>
      </form>
    </div>
  );
}
