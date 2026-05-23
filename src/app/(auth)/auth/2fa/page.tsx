"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, ArrowLeft, RotateCw } from "lucide-react";

export default function TwoFAPage() {
  return (
    <Suspense fallback={null}>
      <TwoFAForm />
    </Suspense>
  );
}

/**
 * Page de saisie du code 2FA email à 6 chiffres.
 *
 * Features :
 *   - 6 inputs auto-focus séparés (UX iOS code-style)
 *   - Auto-submit dès que le 6e chiffre est saisi
 *   - Countdown 10:00 → 0:00 + bouton "Renvoyer le code"
 *   - Affiche un message d'erreur si code invalide
 */
function TwoFAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const next = searchParams.get("next");

  // Si l'user arrive ici sans email → retour login (le flow normal pose l'email)
  useEffect(() => {
    if (!email) router.replace("/login");
  }, [email, router]);

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 min
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Countdown
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  // Auto-submit dès qu'on a 6 chiffres
  useEffect(() => {
    if (digits.every((d) => d) && !loading) {
      submit(digits.join(""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  function setDigitAt(i: number, value: string) {
    const cleaned = value.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = cleaned;
      return next;
    });
    // Auto-focus next
    if (cleaned && i < 5) inputsRef.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      setDigits(text.split(""));
      inputsRef.current[5]?.focus();
    }
  }

  async function submit(code: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDigits(Array(6).fill(""));
        inputsRef.current[0]?.focus();
        throw new Error(data?.error ?? "Code invalide");
      }
      router.push(next ?? "/app");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  async function resend() {
    if (resending) return;
    setResending(true);
    setError(null);
    try {
      await fetch("/api/auth/2fa/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSecondsLeft(600);
      setDigits(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } catch {
      setError("Erreur lors du renvoi. Réessaie dans 30 secondes.");
    } finally {
      setResending(false);
    }
  }

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const expired = secondsLeft <= 0;

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour
      </Link>

      <h1 className="font-display text-[24px] font-extrabold leading-[1.2] tracking-tight text-neutral-900 sm:text-[28px]">
        Vérifie ton email
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
        Pour finaliser ta connexion, on t&apos;a envoyé un code à 6 chiffres à{" "}
        <strong className="text-neutral-900">{email || "ton adresse"}</strong>.
        Saisis-le ci-dessous.
      </p>

      <div className="mt-7 grid grid-cols-6 gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            value={d}
            onChange={(e) => setDigitAt(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={onPaste}
            maxLength={1}
            disabled={loading || expired}
            className="block h-14 w-full rounded-lg border border-neutral-200 bg-white text-center font-mono text-[22px] font-bold text-neutral-900 transition-all hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-50"
          />
        ))}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between text-[12.5px]">
        <span className="text-neutral-500">
          {expired ? (
            <span className="text-rose-600">Code expiré</span>
          ) : (
            <>
              Code valable encore{" "}
              <span className="font-mono font-semibold text-neutral-900">
                {mm}:{ss.toString().padStart(2, "0")}
              </span>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={resend}
          disabled={resending}
          className="inline-flex items-center gap-1.5 font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-60"
        >
          {resending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RotateCw className="h-3 w-3" />
          )}
          Renvoyer le code
        </button>
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-[13px] text-neutral-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Vérification…
        </div>
      )}
    </div>
  );
}
