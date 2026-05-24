"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

export function AcceptInviteButton({
  token,
  workspaceSlug,
}: {
  token: string;
  workspaceSlug: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/autosav/invite/${token}/accept`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'acceptation");
        return;
      }
      router.push(`/autosav/w/${workspaceSlug}`);
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={accept}
        disabled={busy}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 text-[14px] font-bold text-amber-200 shadow-sm transition-all hover:bg-emerald-900 active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Acceptation…
          </>
        ) : (
          <>
            Accepter l'invitation
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-[12px] text-rose-800 ring-1 ring-inset ring-rose-200/60">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </>
  );
}
