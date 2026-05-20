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
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-neutral-900">
          Bon retour 👋
        </h1>
        <p className="mt-2 text-[15px] text-neutral-600">
          Connecte-toi pour accéder à ta messagerie et tes demandes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input"
            autoComplete="current-password"
          />
        </Field>

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
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-200" />
          </div>
          <span className="relative bg-white px-3 text-xs uppercase tracking-wider text-neutral-400">
            ou
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled
        >
          <Sparkles className="h-4 w-4 text-primary-600" />
          Lien magique par email (bientôt)
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-600">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary-700 underline-offset-4 hover:underline"
        >
          Crée-en un gratuit
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
