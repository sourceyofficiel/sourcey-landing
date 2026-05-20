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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Plan = "free" | "starter" | "pro";

interface PlanOption {
  value: Plan;
  label: string;
  sub: string;
  badge?: string;
}

const PLANS: PlanOption[] = [
  { value: "free", label: "Gratuit", sub: "0 €/mois · Découverte" },
  { value: "starter", label: "Starter", sub: "29 €/mois · 3 demandes" },
  {
    value: "pro",
    label: "Pro",
    sub: "79 €/mois · Agent dédié",
    badge: "★ Populaire",
  },
];

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<Plan>("free");

  // Read ?plan=… from URL on mount (client-side only — keeps the page statically renderable)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("plan") as Plan | null;
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
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
          Crée ton compte
        </h1>
        <p className="mt-2 text-[15px] text-neutral-600">
          Tu choisis le produit, on s'occupe du reste depuis la Chine.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Ton nom" icon={User}>
          <input
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Marie Dubois"
            className="input"
            autoComplete="name"
          />
        </Field>

        <Field label="Email" icon={Mail}>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="toi@email.fr"
            className="input"
            autoComplete="email"
          />
        </Field>

        <Field label="Mot de passe" icon={Lock}>
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 caractères"
            className="input"
            autoComplete="new-password"
          />
        </Field>

        <div className="space-y-1.5">
          <span className="block text-sm font-semibold text-neutral-700">
            Choisis ton plan
          </span>
          <div className="grid gap-2">
            {PLANS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlan(p.value)}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
                  plan === p.value
                    ? "border-primary-400 bg-primary-50/60 ring-2 ring-primary-100"
                    : "border-neutral-200 bg-white hover:border-neutral-300"
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                    plan === p.value
                      ? "border-primary-600 bg-primary-600"
                      : "border-neutral-300"
                  )}
                >
                  {plan === p.value && (
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-neutral-900">
                    {p.label}
                  </p>
                  <p className="text-xs text-neutral-500">{p.sub}</p>
                </div>
                {p.badge && (
                  <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Création du compte…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-center text-[11px] text-neutral-500">
          En t'inscrivant, tu acceptes les{" "}
          <Link href="/legal/terms" className="underline-offset-2 hover:underline">
            CGV
          </Link>{" "}
          et la{" "}
          <Link href="/legal/privacy" className="underline-offset-2 hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Déjà un compte ?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          Se connecter
        </Link>
      </p>

      <FormStyles />
    </motion.div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
        <Icon className="h-3.5 w-3.5 text-neutral-400" />
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function FormStyles() {
  return (
    <style jsx>{`
      :global(.input) {
        width: 100%;
        height: 44px;
        padding: 0 14px;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        font-size: 15px;
        color: #0f172a;
        transition: all 0.15s ease;
      }
      :global(.input::placeholder) {
        color: #94a3b8;
      }
      :global(.input:focus) {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
      }
    `}</style>
  );
}
