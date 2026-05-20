"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Identifiants invalides");
      router.push("/app/inbox");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Title */}
      <div>
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[36px]">
          Bon retour.
        </h1>
        <p className="mt-2 text-[15px] text-neutral-500">
          Connecte-toi pour accéder à ta messagerie agents et tes commandes.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <FormField
          label="Email professionnel"
          icon={Mail}
          required
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="ton@email.fr"
          autoComplete="email"
        />

        <div>
          <FormField
            label="Mot de passe"
            icon={Lock}
            required
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
                className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                aria-label={showPassword ? "Cacher" : "Afficher"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />
          <div className="mt-2 flex justify-end">
            <Link
              href="#"
              className="text-[12.5px] font-medium text-primary-700 transition-colors hover:text-primary-900"
            >
              Mot de passe oublié&nbsp;?
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-primary-500 to-primary-700 text-[14.5px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "inset 0 -2px 0 rgba(15,40,100,0.35)",
              "0 14px 30px -8px rgba(37,99,235,0.5)",
              "0 4px 8px -2px rgba(15,23,42,0.18)",
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/25 to-transparent"
          />
          {loading ? (
            <>
              <Loader2 className="relative h-4 w-4 animate-spin" />
              <span className="relative">Connexion…</span>
            </>
          ) : (
            <>
              <span className="relative">Se connecter</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[11.5px] font-medium uppercase tracking-wider text-neutral-400">
          ou
        </span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Sign up CTA */}
      <p className="text-center text-[14px] text-neutral-600">
        Pas encore de compte&nbsp;?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          Crée-en un gratuit
        </Link>
      </p>
    </motion.div>
  );
}

/* ============================================================
   Reusable form field
   ============================================================ */

function FormField({
  label,
  icon: Icon,
  required,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  rightSlot,
  minLength,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  required?: boolean;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-semibold text-neutral-700">
        {label}
      </span>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-neutral-400">
          <Icon className="h-4 w-4" />
        </span>
        <input
          required={required}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          className="block h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-3 text-[14.5px] text-neutral-900 shadow-sm transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100"
          style={rightSlot ? { paddingRight: "44px" } : undefined}
        />
        {rightSlot && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-1.5">
            {rightSlot}
          </span>
        )}
      </div>
    </label>
  );
}
