"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowRight,
  Loader2,
  Mail,
  Lock,
  User,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

type Plan = "free" | "starter" | "pro";

interface PlanOption {
  value: Plan;
  label: string;
  price: string;
  sub: string;
  badge?: string;
}

const PLANS: PlanOption[] = [
  {
    value: "free",
    label: "Gratuit",
    price: "0 €",
    sub: "Découverte · 1 demande/mois",
  },
  {
    value: "starter",
    label: "Starter",
    price: "29 €",
    sub: "3 demandes · Vidéo QC",
  },
  {
    value: "pro",
    label: "Pro",
    price: "79 €",
    sub: "Illimité · Agent dédié",
    badge: "Plus populaire",
  },
];

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [plan, setPlan] = useState<Plan>("free");

  // Read ?plan=… from URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("plan") as
      | Plan
      | null;
    if (p === "free" || p === "starter" || p === "pro") {
      setPlan(p);
    }
  }, []);

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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Title */}
      <div>
        <h1 className="font-display text-[32px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[36px]">
          Crée ton compte.
        </h1>
        <p className="mt-2 text-[15px] text-neutral-500">
          Décris ton premier produit, reçois ton devis sous 24h.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <FormField
          label="Ton nom complet"
          icon={User}
          required
          type="text"
          value={fullName}
          onChange={setFullName}
          placeholder="Marie Dubois"
          autoComplete="name"
        />

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

        <FormField
          label="Mot de passe"
          icon={Lock}
          required
          minLength={8}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          placeholder="Minimum 8 caractères"
          autoComplete="new-password"
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

        {/* Plan picker */}
        <div>
          <span className="block text-[12.5px] font-semibold text-neutral-700">
            Choisis ton plan
          </span>
          <div className="mt-2 grid gap-2">
            {PLANS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlan(p.value)}
                className={`relative flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-all ${
                  plan === p.value
                    ? "border-primary-500 ring-4 ring-primary-100"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                    plan === p.value
                      ? "border-primary-600 bg-primary-600"
                      : "border-neutral-300"
                  }`}
                >
                  {plan === p.value && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-[14px] font-bold text-neutral-900">
                      {p.label}
                    </p>
                    <p className="font-mono text-[12.5px] font-semibold text-neutral-700">
                      {p.price}
                      <span className="text-[11px] font-normal text-neutral-400">
                        /mois
                      </span>
                    </p>
                  </div>
                  <p className="text-[12px] text-neutral-500">{p.sub}</p>
                </div>
                {p.badge && (
                  <span className="rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
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
              <span className="relative">Création en cours…</span>
            </>
          ) : (
            <>
              <span className="relative">Créer mon compte</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <p className="text-center text-[11.5px] leading-relaxed text-neutral-500">
          En créant un compte, tu acceptes nos{" "}
          <Link href="#" className="underline-offset-2 hover:underline">
            CGV
          </Link>{" "}
          et notre{" "}
          <Link href="#" className="underline-offset-2 hover:underline">
            Politique de confidentialité
          </Link>
          .
        </p>
      </form>

      {/* Divider */}
      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-[11.5px] font-medium uppercase tracking-wider text-neutral-400">
          ou
        </span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      {/* Log in CTA */}
      <p className="text-center text-[14px] text-neutral-600">
        Déjà un compte&nbsp;?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          Connecte-toi
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
