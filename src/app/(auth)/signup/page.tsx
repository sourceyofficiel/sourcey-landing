"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

/**
 * Signup form style Mailjet — tous les champs visibles en une étape.
 * Le layout 2 colonnes (marketing à gauche + form à droite) est dans
 * (auth)/layout.tsx — cette page ne rend que le form.
 */
export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password strength check (mêmes critères que Mailjet : 8+ chars, lettre, chiffre, spécial)
  const passwordChecks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const canSubmit = fullName.trim().length >= 2 && email.includes("@") && passwordValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !canSubmit) return;
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

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      router.push(next ?? "/autosav/onboarding");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-[28px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[32px]">
        Crée ton compte gratuitement
      </h1>
      <p className="mt-2 text-[14.5px] text-neutral-500">
        Sans engagement. Sans carte bancaire.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {/* Nom complet */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-[13px] font-medium text-neutral-700"
          >
            Nom complet
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Marie Dubois"
            autoComplete="name"
            className="mt-1.5 block h-12 w-full rounded-xl border border-neutral-200 bg-white px-3.5 text-[15px] text-neutral-900 placeholder:text-neutral-400 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-100"
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
          <label
            htmlFor="password"
            className="block text-[13px] font-medium text-neutral-700"
          >
            Mot de passe
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              autoComplete="new-password"
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
          {/* Hint */}
          {password.length === 0 ? (
            <p className="mt-1.5 text-[11.5px] text-neutral-500">
              Min. 8 caractères, 1 lettre, 1 chiffre et 1 caractère spécial
            </p>
          ) : (
            <ul className="mt-2 grid grid-cols-2 gap-1 text-[11.5px]">
              <PasswordCheck ok={passwordChecks.length} label="8 caractères" />
              <PasswordCheck ok={passwordChecks.letter} label="1 lettre" />
              <PasswordCheck ok={passwordChecks.digit} label="1 chiffre" />
              <PasswordCheck ok={passwordChecks.special} label="1 spécial" />
            </ul>
          )}
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
          disabled={loading || !canSubmit}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 text-[14.5px] font-bold text-white shadow-[0_8px_24px_-4px_rgba(6,95,70,0.4),inset_0_-3px_10px_-2px_rgba(0,0,0,0.2)] transition-all hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Création…
            </>
          ) : (
            "Créer mon compte"
          )}
        </button>

        {/* Legal */}
        <p className="text-[11.5px] leading-relaxed text-neutral-500">
          En cliquant sur &quot;Créer mon compte&quot;, j&apos;accepte
          expressément les{" "}
          <Link
            href="#"
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Conditions générales d&apos;utilisation
          </Link>{" "}
          d&apos;AutoSAV et je comprends que les informations de mon compte
          seront utilisées conformément à la{" "}
          <Link
            href="#"
            className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            Politique de confidentialité
          </Link>
          .
        </p>

        {/* Login link */}
        <p className="border-t border-neutral-100 pt-5 text-[13.5px] text-neutral-500">
          Tu as déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-bold text-emerald-700 hover:text-emerald-800"
          >
            Connecte-toi
          </Link>
        </p>
      </form>
    </div>
  );
}

function PasswordCheck({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li
      className={`flex items-center gap-1.5 ${
        ok ? "text-emerald-700" : "text-neutral-400"
      }`}
    >
      <span
        className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
          ok ? "bg-emerald-700 text-white" : "bg-neutral-200 text-neutral-400"
        }`}
      >
        {ok ? "✓" : "·"}
      </span>
      {label}
    </li>
  );
}
