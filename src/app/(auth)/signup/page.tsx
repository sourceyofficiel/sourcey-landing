"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
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
      router.push("/app/inbox");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Title */}
      <h1 className="text-center font-display text-[26px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
        Lance ta marque DTC.
        <br />
        <span className="text-neutral-400">Crée ton compte Sourcey.</span>
      </h1>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        {/* Full name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-[13px] font-medium text-neutral-700"
          >
            Nom complet
          </label>
          <input
            id="fullName"
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Marie Dubois"
            autoComplete="name"
            className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

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
            required
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tapez votre email..."
            autoComplete="email"
            className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>

        {/* Password */}
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
              className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 pr-12 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex h-12 w-12 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-600 active:bg-neutral-100"
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

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13.5px] text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 text-[15px] font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création…
            </>
          ) : (
            <>Continuer</>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[12px] text-neutral-400">ou continuer avec</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Social login buttons */}
      <div className="grid grid-cols-3 gap-2">
        <SocialButton
          label="Google"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5">
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
          }
        />
        <SocialButton
          label="Apple"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-neutral-900"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          }
        />
        <SocialButton
          label="SSO"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-neutral-700"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
        />
      </div>

      {/* Login link */}
      <p className="mt-8 text-center text-[14px] text-neutral-500">
        Déjà inscrit&nbsp;?{" "}
        <Link
          href="/login"
          className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}

function SocialButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled
      className="flex h-16 flex-col items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white text-[12px] font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={`Continuer avec ${label}`}
      title={`${label} — bientôt disponible`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
