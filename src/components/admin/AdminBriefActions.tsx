"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Check } from "lucide-react";
import { BRIEF_STATUSES } from "@/components/admin/AdminStatusBadge";

export function AdminBriefActions({
  briefId,
  currentStatus,
  currentNotes,
}: {
  briefId: string;
  currentStatus: string;
  currentNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty = status !== currentStatus || notes !== currentNotes;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/briefs/${briefId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, internalNotes: notes }),
      });
      if (!res.ok) throw new Error("save failed");
      setSavedAt(Date.now());
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6"
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Actions
      </h2>

      {/* Status select */}
      <div className="mt-3">
        <label
          htmlFor="status"
          className="block text-[12.5px] font-semibold text-neutral-700"
        >
          Statut
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1.5 block h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] text-neutral-900 transition-colors hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          {BRIEF_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Internal notes */}
      <div className="mt-4">
        <label
          htmlFor="notes"
          className="block text-[12.5px] font-semibold text-neutral-700"
        >
          Notes internes
          <span className="ml-2 text-[11px] font-normal text-neutral-400">
            (jamais visibles côté client)
          </span>
        </label>
        <textarea
          id="notes"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex : appelé Wang chez Yiwu Textile, attend retour échantillon mardi…"
          className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-neutral-900 transition-colors hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>

      {/* Save */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <div>
          {savedAt && !dirty && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-green-700">
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
              Sauvegardé
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          Enregistrer
        </button>
      </div>
    </form>
  );
}
