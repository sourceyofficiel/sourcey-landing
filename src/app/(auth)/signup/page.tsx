"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Email requis");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email invalide");
      return;
    }
    setStep(2);
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Inscription impossible");
      // Compte créé → email de vérification envoyé. L'user doit cliquer sur
      // le lien dans son mail AVANT de pouvoir se connecter (flow sécurisé).
      router.push(`/auth/verify-pending?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-center font-display text-[26px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
        Le sourcing en Chine,
        <br />
        managé pour toi.
        <br />
        <span className="text-neutral-400">Crée ton compte Sourcey.</span>
      </h1>

      {/* === STEP 1 : EMAIL === */}
      {step === 1 && (
        <>
          {/* Social OAuth en premier */}
          <div className="mt-8 grid grid-cols-2 gap-2">
            <a
              href="/api/auth/oauth/google"
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-[13.5px] font-semibold text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
            >
              <GoogleIcon />
              Google
            </a>
            <a
              href="/api/auth/oauth/apple"
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-900 text-[13.5px] font-semibold text-white hover:bg-neutral-800"
            >
              <AppleIcon />
              Apple
            </a>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-[12px] text-neutral-400">
              ou avec un email
            </span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <form onSubmit={handleContinue} className="space-y-4">
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
                autoFocus
                type="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tapez votre adresse email…"
                autoComplete="email"
                className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 text-[15px] font-semibold text-white hover:bg-primary-700"
            >
              Continuer
            </button>
          </form>

          <p className="mt-8 text-center text-[14px] text-neutral-500">
            Déjà un compte&nbsp;?{" "}
            <Link
              href="/login"
              className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </>
      )}

      {/* === STEP 2 : NOM + PASSWORD === */}
      {step === 2 && (
        <form onSubmit={handleCreateAccount} className="mt-8 space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="truncate text-[13.5px] text-neutral-700">
                {email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="shrink-0 text-[12px] font-semibold text-primary-700 underline-offset-2 hover:underline"
            >
              Modifier
            </button>
          </div>

          <div>
            <label
              htmlFor="fullName"
              className="block text-[13px] font-medium text-neutral-700"
            >
              Ton nom complet
            </label>
            <input
              id="fullName"
              required
              autoFocus
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Marie Dubois"
              autoComplete="name"
              className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-neutral-700"
            >
              Mot de passe
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                required
                minLength={8}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
                autoComplete="new-password"
                className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 pr-12 text-[16px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex h-12 w-12 items-center justify-center text-neutral-400 hover:text-neutral-600"
                aria-label={showPassword ? "Cacher" : "Afficher"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
                <Loader2 className="h-4 w-4 animate-spin" /> Création…
              </>
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <ul className="grid gap-1.5 pt-3 text-[12px] text-neutral-500">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
              On t&apos;envoie un email de confirmation pour activer ton compte
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
              Annulable à tout moment, sans engagement
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
              Tes données restent en Europe (RGPD)
            </li>
          </ul>
        </form>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}
