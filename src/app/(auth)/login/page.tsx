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
 * Login form style Mailjet — même layout 2 colonnes que signup (géré par
 * (auth)/layout.tsx). Cette page ne rend que le form.
 */
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

  useEffect(() => {
    if (urlError) {
      const map: Record<string, string> = {
        oauth_denied: "Connexion annulée.",
        oauth_failed: "OAuth a échoué. Réessaie.",
        account_disabled: "Compte désactivé. Contacte hello@autosav.io.",
      };
      setError(map[urlError] ?? "Une erreur est survenue.");
    }
  }, [urlError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Identifiants invalides");
      router.push(next ?? "/autosav/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[32px]">
        Bon retour parmi nous
      </h1>
      <p className="mt-2 text-[14.5px] text-neutral-500">
        Connecte-toi pour accéder à ton dashboard AutoSAV.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-[13px] font-medium text-neutral-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: prénom@exemple.com"
            autoComplete="email"
            inputMode="email"
            className="mt-1.5 block h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-neutral-700"
            >
              Mot de passe
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-[12px] font-medium text-emerald-700 hover:text-emerald-800"
            >
              Oublié ?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              autoComplete="current-password"
              className="block h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 pr-12 text-[15px] text-neutral-900 placeholder:text-neutral-400 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              aria-label={showPassword ? "Cacher" : "Afficher"}
              className="absolute inset-y-0 right-0 flex h-12 w-12 items-center justify-center text-neutral-400 hover:text-neutral-700"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 text-[14.5px] font-bold text-white shadow-[0_8px_24px_-4px_rgba(6,95,70,0.4),inset_0_-3px_10px_-2px_rgba(0,0,0,0.2)] transition-all hover:bg-emerald-900 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>

        {/* Signup link */}
        <p className="border-t border-neutral-100 pt-5 text-[13.5px] text-neutral-500">
          Nouveau sur AutoSAV ?{" "}
          <Link
            href="/signup"
            className="font-bold text-emerald-700 hover:text-emerald-800"
          >
            Crée ton compte
          </Link>
        </p>
      </form>
    </div>
  );
}
