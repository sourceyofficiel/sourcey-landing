"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Mail, ArrowRight, Check, AlertCircle } from "lucide-react";

/**
 * Formulaire magic-link. L'user entre son email → Supabase lui envoie
 * un lien qui le ramène sur /auth/callback?code=... → session créée.
 */
export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(
    initialError === "invalid_code"
      ? "Lien invalide ou expiré. Réessaie."
      : null
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          shouldCreateUser: false, // Invite-only : refuse les emails inconnus
        },
      });
      if (err) {
        if (err.message.toLowerCase().includes("signups not allowed")) {
          setError("Cet email n'est pas autorisé. Demande une invitation.");
        } else {
          setError(err.message);
        }
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <div className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <div>
            <div className="text-[13px] font-bold text-emerald-300">
              Lien envoyé
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-emerald-100/80">
              Vérifie <strong>{email}</strong> — clique sur le lien dans
              l&apos;email pour te connecter. Il expire dans 60 minutes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6">
      <label className="block">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          Email
        </span>
        <div className="relative mt-1.5">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@creator-agency.com"
            className="block h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-10 pr-3 text-[13.5px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </label>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] text-rose-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || !email.includes("@")}
        className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13.5px] font-bold text-white shadow-lg shadow-violet-500/20 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Envoi…
          </>
        ) : (
          <>
            Recevoir le lien
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
