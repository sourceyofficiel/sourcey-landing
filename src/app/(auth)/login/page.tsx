"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

/**
 * URL-driven error messages affichés au mount.
 * Utilisé par les redirects depuis verify-email, OAuth callbacks, etc.
 */
const URL_ERRORS: Record<string, string> = {
  verify_invalid: "Ce lien de vérification est invalide.",
  verify_expired: "Ce lien de vérification a expiré. Demande-en un nouveau.",
  verify_used: "Ce lien a déjà été utilisé. Connecte-toi normalement.",
  verify_missing: "Lien de vérification manquant.",
  oauth_denied: "Tu as annulé la connexion.",
  oauth_missing: "Réponse OAuth incomplète. Réessaie.",
  oauth_state: "Erreur de sécurité OAuth (state). Réessaie.",
  oauth_email_unverified:
    "Ton email n'est pas vérifié chez le provider. Vérifie-le et réessaie.",
  oauth_failed: "Connexion OAuth échouée. Réessaie.",
  account_disabled: "Ce compte a été désactivé. Contacte-nous à hello@sourcey.fr.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);

  useEffect(() => {
    if (urlError && URL_ERRORS[urlError]) {
      setError(URL_ERRORS[urlError]);
    }
  }, [urlError]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    setNeedsEmailVerification(false);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "EMAIL_NOT_VERIFIED") {
          setNeedsEmailVerification(true);
        }
        throw new Error(data?.error ?? "Identifiants invalides");
      }

      // Mode simple : login direct (plus de 2FA email).
      // Si une route a besoin d'un next= (ex: /autosav/onboarding), on la respecte.
      router.push(next ?? "/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  async function resendVerification() {
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setError("Email de vérification renvoyé. Va checker ta boîte mail.");
      setNeedsEmailVerification(false);
    } catch {
      // silent
    }
  }

  return (
    <div>
      <h1 className="text-center font-display text-[26px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
        Le sourcing en Chine, simplifié.
        <br />
        <span className="text-neutral-400">Connectez-vous à Sourcey.</span>
      </h1>

      {/* Social login buttons — en haut */}
      <div className="mt-8 grid grid-cols-2 gap-2">
        <a
          href="/api/auth/oauth/google"
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-[13.5px] font-semibold text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
        >
          <GoogleIcon />
          Google
        </a>
        <a
          href="/api/auth/oauth/apple"
          className="flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-neutral-900 text-[13.5px] font-semibold text-white transition-colors hover:bg-neutral-800"
        >
          <AppleIcon />
          Apple
        </a>
      </div>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[12px] text-neutral-400">ou avec un email</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
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
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tapez votre email..."
            autoComplete="email"
            className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 pr-12 text-[16px] text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
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
          <div className="mt-1.5 flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="py-1 text-[12.5px] text-neutral-500 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              Mot de passe oublié&nbsp;?
            </Link>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13.5px] text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <span>{error}</span>
              {needsEmailVerification && (
                <button
                  type="button"
                  onClick={resendVerification}
                  className="ml-1 font-semibold underline underline-offset-2"
                >
                  Renvoyer l&apos;email
                </button>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 text-[15px] font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
            </>
          ) : (
            "Continuer"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-[14px] text-neutral-500">
        Nouveau sur Sourcey&nbsp;?{" "}
        <Link
          href="/signup"
          className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
        >
          Créer un compte
        </Link>
      </p>
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
