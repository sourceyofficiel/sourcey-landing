"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";

/**
 * Form d'acceptation d'invitation : crée le compte auth + active l'invitation.
 * On utilise signUp puisque l'email était bloqué côté login (shouldCreateUser: false).
 * Une fois l'auth user créé, on appelle une API qui marque l'invitation acceptée
 * et set le role sur profiles.
 */
export function AcceptInviteForm({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      // signUp avec email + password
      const { error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() || null },
        },
      });
      if (signUpErr) {
        // Si l'utilisateur existe déjà, on essaie de le connecter
        if (signUpErr.message.toLowerCase().includes("already registered")) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInErr) {
            setError(
              "Cet email existe déjà avec un mot de passe différent. Connecte-toi via /login avec ton magic link."
            );
            return;
          }
        } else {
          setError(signUpErr.message);
          return;
        }
      }

      // Marque l'invitation comme acceptée + applique le rôle
      const res = await fetch(`/api/invitations/accept/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'acceptation");
        return;
      }

      router.push("/app");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <div>
        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-500"
        />
      </div>
      <div>
        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
          Ton nom complet
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Alex Martin"
          className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-violet-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
          Mot de passe (8 caractères min)
        </label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-violet-500 focus:outline-none"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-[12px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || password.length < 8}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13.5px] font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Création du compte…
          </>
        ) : (
          <>
            Rejoindre l&apos;équipe
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
