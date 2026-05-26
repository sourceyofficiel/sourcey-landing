"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  KanbanSquare,
  Loader2,
} from "lucide-react";
import {
  formatCompactNumber,
  formatTimeAgo,
  PROSPECTION_STATUS_LABEL,
  SIZE_TIER_LABEL,
  getAvatarGradient,
  getInitials,
} from "@/lib/format";
import { cn } from "@/lib/utils";

type Status =
  | "to_contact"
  | "contacted"
  | "awaiting_reply"
  | "negotiating"
  | "accepted"
  | "refused"
  | "ghosted";

interface Prospection {
  id: string;
  status: Status;
  channel: string | null;
  first_contacted_at: string | null;
  last_interaction_at: string | null;
  created_at: string;
  updated_at: string;
  agreed_price_cents: number | null;
  influencer: {
    id: string;
    display_name: string;
    followers_count: number;
    size_tier: string;
    handle_tiktok: string | null;
    handle_instagram: string | null;
  } | null;
  campaign: {
    id: string;
    name: string;
    brand_id: string;
    brand: { id: string; name: string } | null;
  } | null;
  assignee: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

const COLUMNS: Array<{ status: Status; tone: string }> = [
  { status: "to_contact", tone: "neutral" },
  { status: "contacted", tone: "blue" },
  { status: "awaiting_reply", tone: "amber" },
  { status: "negotiating", tone: "violet" },
  { status: "accepted", tone: "emerald" },
  { status: "refused", tone: "rose" },
  { status: "ghosted", tone: "neutral-dim" },
];

const COLUMN_TONE: Record<string, string> = {
  neutral: "border-neutral-200 bg-white",
  blue: "border-blue-500/20 bg-blue-500/5",
  amber: "border-amber-200 bg-amber-50/60",
  violet: "border-violet-200 bg-violet-50/60",
  emerald: "border-emerald-200 bg-emerald-50/60",
  rose: "border-rose-200 bg-rose-50/60",
  "neutral-dim": "border-neutral-200 bg-neutral-50/40 opacity-70",
};

export function PipelineKanban({
  initialProspections,
}: {
  initialProspections: Prospection[];
}) {
  const [prospections, setProspections] =
    useState<Prospection[]>(initialProspections);
  const [movingId, setMovingId] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const g: Record<Status, Prospection[]> = {
      to_contact: [],
      contacted: [],
      awaiting_reply: [],
      negotiating: [],
      accepted: [],
      refused: [],
      ghosted: [],
    };
    for (const p of prospections) g[p.status]?.push(p);
    return g;
  }, [prospections]);

  async function moveTo(p: Prospection, newStatus: Status) {
    setMovingId(p.id);
    // Optimistic update
    setProspections((prev) =>
      prev.map((x) =>
        x.id === p.id ? { ...x, status: newStatus, updated_at: new Date().toISOString() } : x
      )
    );
    try {
      await fetch(`/api/prospections/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-5 py-3 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet-700">
              <KanbanSquare className="h-3.5 w-3.5" />
              Pipeline
            </div>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              {prospections.length} prospection{prospections.length > 1 ? "s" : ""}.
              Clique sur → pour faire avancer le statut.
            </p>
          </div>
          <Link
            href="/app/influencers"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-[12.5px] font-bold text-neutral-800 hover:bg-neutral-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Nouvelle prospection
          </Link>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full min-w-max gap-3 p-5 lg:p-6">
          {COLUMNS.map((col) => {
            const list = grouped[col.status];
            return (
              <div
                key={col.status}
                className={cn(
                  "flex w-[300px] shrink-0 flex-col rounded-2xl border",
                  COLUMN_TONE[col.tone]
                )}
              >
                <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-[13px] font-bold text-neutral-900">
                      {PROSPECTION_STATUS_LABEL[col.status]}
                    </h3>
                    <span className="rounded-md bg-black/40 px-1.5 py-0.5 text-[10.5px] font-bold text-neutral-700">
                      {list.length}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {list.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/5 p-6 text-center text-[11px] italic text-neutral-600">
                      Vide
                    </div>
                  ) : (
                    list.map((p) => (
                      <ProspectionCard
                        key={p.id}
                        prospection={p}
                        onMove={(s) => moveTo(p, s)}
                        moving={movingId === p.id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProspectionCard({
  prospection: p,
  onMove,
  moving,
}: {
  prospection: Prospection;
  onMove: (newStatus: Status) => void;
  moving: boolean;
}) {
  const inf = p.influencer;
  if (!inf) return null;
  const handle = inf.handle_tiktok ?? inf.handle_instagram;
  const gradient = getAvatarGradient(inf.id);
  const initials = getInitials(inf.display_name, inf.display_name);

  const idx = COLUMNS.findIndex((c) => c.status === p.status);
  const nextStatus = COLUMNS[idx + 1]?.status;

  return (
    <div className="rounded-xl border border-white/5 bg-neutral-50/80 p-3">
      <Link href={`/app/influencers/${inf.id}`} className="block group">
        <div className="flex items-start gap-2">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10.5px] font-bold text-white",
              gradient
            )}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12.5px] font-bold text-neutral-900 group-hover:text-violet-700">
              {inf.display_name}
            </div>
            <div className="truncate text-[10.5px] text-neutral-500">
              {handle ? `@${handle}` : ""} ·{" "}
              {formatCompactNumber(inf.followers_count)} ·{" "}
              {SIZE_TIER_LABEL[inf.size_tier]}
            </div>
          </div>
        </div>
      </Link>

      {p.campaign?.brand && (
        <div className="mt-2 text-[10.5px] text-neutral-500">
          → {p.campaign.brand.name} · {p.campaign.name}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-2 text-[10.5px]">
        <span className="text-neutral-600">
          {p.last_interaction_at
            ? formatTimeAgo(p.last_interaction_at)
            : formatTimeAgo(p.created_at)}
        </span>
        {nextStatus && (
          <button
            onClick={() => onMove(nextStatus)}
            disabled={moving}
            className="inline-flex h-6 items-center gap-1 rounded-md bg-violet-50 px-1.5 text-[10px] font-bold text-violet-700 ring-1 ring-inset ring-violet-200 hover:bg-violet-100 disabled:opacity-50"
            title={`Passer à : ${PROSPECTION_STATUS_LABEL[nextStatus]}`}
          >
            {moving ? (
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            ) : (
              <>
                {PROSPECTION_STATUS_LABEL[nextStatus]}
                <ChevronRight className="h-2.5 w-2.5" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Status quick-select (toutes les options) */}
      <details className="mt-2 group">
        <summary className="cursor-pointer text-[10px] text-neutral-600 hover:text-neutral-500">
          autres statuts ↓
        </summary>
        <div className="mt-1 flex flex-wrap gap-1">
          {COLUMNS.filter((c) => c.status !== p.status).map((c) => (
            <button
              key={c.status}
              onClick={() => onMove(c.status)}
              className="rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-bold text-neutral-700 ring-1 ring-inset ring-neutral-200 hover:bg-neutral-100"
            >
              {PROSPECTION_STATUS_LABEL[c.status]}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
