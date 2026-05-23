"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

/**
 * Page de réinitialisation : l'user arrive depuis le lien email.
 *
 * Au mount on appelle GET /api/auth/reset-password?token=... pour vérifier
 * la validité du token AVANT d'afficher le form. Si invalide/expiré, on
 * affiche un message + lien "Demander un nouveau lien".
 */
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<
    "checking" | "valid" | "invalid" | "expired" | "used"
  >("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Vérifie le token au mount
  useEffect(() => {
    if (!token) {
      setTokenState("invalid");
      return;
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setTokenState("valid");
        else
          setTokenState(
            d.reason === "expired"
              ? "expired"
              : d.reason === "already_used"
                ? "used"
                : "invalid"
          );
      })
      .catch(() => setTokenState("invalid"));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    if (password.length < 8) {
      setError("Le mot de passe doit faire au moins 8 caractères");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  if (tokenState === "checking") {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (tokenState !== "valid") {
    const messages = {
      invalid: "Ce lien est invalide.",
      expired: "Ce lien a expiré.",
      used: "Ce lien a déjà été utilisé.",
    } as const;
    return (
      <div className="text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-[24px] font-extrabold leading-[1.2] tracking-tight text-neutral-900">
          Lien invalide
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-500">
          {messages[tokenState]} Demande un nouveau lien de réinitialisation.
        </p>
        <Link
          href="/auth/forgot-password"
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-[13.5px] font-semibold text-white hover:bg-primary-700"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-[24px] font-extrabold leading-[1.2] tracking-tight text-neutral-900">
          Mot de passe modifié
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-neutral-500">
          Redirection vers la connexion…
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-[24px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
        Choisis un nouveau mot de passe
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
        8 caractères minimum. Évite les mots de passe que tu utilises ailleurs.
      </p>

      <form onSubmit={onSubmit} className="mt-7 space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-neutral-700"
          >
            Nouveau mot de passe
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              required
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 caractères"
              autoComplete="new-password"
              className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 pr-12 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex h-12 w-12 items-center justify-center text-neutral-400 hover:text-neutral-600"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="confirm"
            className="block text-[13px] font-medium text-neutral-700"
          >
            Confirme le nouveau mot de passe
          </label>
          <input
            id="confirm"
            required
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Retape le mot de passe"
            autoComplete="new-password"
            className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13.5px] text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 text-[15px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
            </>
          ) : (
            "Modifier mon mot de passe"
          )}
        </button>
      </form>
    </div>
  );
}
