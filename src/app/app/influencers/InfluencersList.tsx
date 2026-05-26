"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users as UsersIcon,
  X,
  ChevronDown,
} from "lucide-react";
import {
  SIZE_TIER_LABEL,
  SIZE_TIER_RANGE,
  GLOBAL_STATUS_LABEL,
  formatCompactNumber,
  formatPercent,
  formatTimeAgo,
  getAvatarGradient,
  getInitials,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface Influencer {
  id: string;
  display_name: string;
  handle_tiktok: string | null;
  handle_instagram: string | null;
  handle_youtube: string | null;
  profile_url: string | null;
  followers_count: number;
  size_tier: string;
  niche: string | null;
  country: string | null;
  language: string;
  contact_email: string | null;
  engagement_rate: number | null;
  global_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

const TIERS = ["nano", "micro", "mid", "macro", "mega"] as const;
const STATUSES = [
  "lead",
  "contacted",
  "negotiating",
  "accepted",
  "refused",
  "blacklist",
] as const;

export function InfluencersList({
  initialInfluencers,
}: {
  initialInfluencers: Influencer[];
  brands?: Brand[];
}) {
  const [influencers] = useState<Influencer[]>(initialInfluencers);
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const i of influencers) if (i.country) set.add(i.country);
    return Array.from(set).sort();
  }, [influencers]);

  const filtered = useMemo(() => {
    const qLower = q.toLowerCase().trim();
    return influencers.filter((i) => {
      if (tierFilter && i.size_tier !== tierFilter) return false;
      if (statusFilter && i.global_status !== statusFilter) return false;
      if (countryFilter && i.country !== countryFilter) return false;
      if (!qLower) return true;
      return (
        i.display_name.toLowerCase().includes(qLower) ||
        i.handle_tiktok?.toLowerCase().includes(qLower) ||
        i.handle_instagram?.toLowerCase().includes(qLower) ||
        i.niche?.toLowerCase().includes(qLower) ||
        i.notes?.toLowerCase().includes(qLower)
      );
    });
  }, [influencers, q, tierFilter, statusFilter, countryFilter]);

  const activeFilters =
    [tierFilter, statusFilter, countryFilter].filter(Boolean).length;

  function clearFilters() {
    setTierFilter(null);
    setStatusFilter(null);
    setCountryFilter(null);
    setQ("");
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="shrink-0 border-b border-neutral-900 bg-neutral-950 px-5 py-3 lg:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (nom, handle, niche…)"
              className="h-9 w-full rounded-lg border border-neutral-800 bg-neutral-900 pl-9 pr-3 text-[13px] text-neutral-100 placeholder:text-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
            />
          </div>

          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12.5px] font-bold transition-colors",
              showFilters || activeFilters > 0
                ? "border-violet-500/40 bg-violet-500/10 text-violet-200"
                : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filtres
            {activeFilters > 0 && (
              <span className="rounded-md bg-violet-500/20 px-1.5 text-[10.5px]">
                {activeFilters}
              </span>
            )}
          </button>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 text-[12.5px] text-neutral-400 hover:text-neutral-100"
            >
              <X className="h-3.5 w-3.5" />
              Reset
            </button>
          )}

          <div className="flex-1" />

          <Link
            href="/app/influencers/new"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 px-3.5 text-[12.5px] font-bold text-white shadow-md shadow-violet-500/20 hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </Link>
        </div>

        {showFilters && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <FilterSelect
              label="Taille"
              value={tierFilter}
              onChange={setTierFilter}
              options={TIERS.map((t) => ({
                value: t,
                label: `${SIZE_TIER_LABEL[t]} (${SIZE_TIER_RANGE[t]})`,
              }))}
            />
            <FilterSelect
              label="Statut global"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUSES.map((s) => ({
                value: s,
                label: GLOBAL_STATUS_LABEL[s],
              }))}
            />
            <FilterSelect
              label="Pays"
              value={countryFilter}
              onChange={setCountryFilter}
              options={countries.map((c) => ({ value: c, label: c }))}
            />
          </div>
        )}

        <div className="mt-2 text-[11.5px] text-neutral-500">
          {filtered.length} influenceur{filtered.length > 1 ? "s" : ""}
          {influencers.length !== filtered.length && (
            <> sur {influencers.length}</>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-5 lg:p-8">
        {filtered.length === 0 ? (
          <EmptyState hasFilters={activeFilters > 0 || q.length > 0} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((inf) => (
              <InfluencerCard key={inf.id} influencer={inf} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   INFLUENCER CARD
   ============================================================ */

function InfluencerCard({ influencer }: { influencer: Influencer }) {
  const handle =
    influencer.handle_tiktok ?? influencer.handle_instagram ?? influencer.handle_youtube;
  const platform = influencer.handle_tiktok
    ? "TikTok"
    : influencer.handle_instagram
      ? "Instagram"
      : "YouTube";

  const gradient = getAvatarGradient(influencer.id);
  const initials = getInitials(influencer.display_name, influencer.display_name);

  return (
    <Link
      href={`/app/influencers/${influencer.id}`}
      className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 transition-all hover:border-violet-500/40 hover:bg-neutral-900"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold text-white",
            gradient
          )}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-[14px] font-bold text-white">
              {influencer.display_name}
            </h3>
          </div>
          <div className="mt-0.5 truncate text-[11.5px] text-neutral-400">
            {platform} · @{handle}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ring-1 ring-inset",
            tierClass(influencer.size_tier)
          )}
        >
          {SIZE_TIER_LABEL[influencer.size_tier]}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11.5px]">
        <div className="rounded-lg bg-neutral-950/60 p-2">
          <div className="flex items-center gap-1 text-neutral-500">
            <UsersIcon className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-wider">Followers</span>
          </div>
          <div className="mt-0.5 font-display text-[14px] font-extrabold text-white">
            {formatCompactNumber(influencer.followers_count)}
          </div>
        </div>
        <div className="rounded-lg bg-neutral-950/60 p-2">
          <div className="flex items-center gap-1 text-neutral-500">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] uppercase tracking-wider">Engagement</span>
          </div>
          <div className="mt-0.5 font-display text-[14px] font-extrabold text-white">
            {influencer.engagement_rate != null
              ? formatPercent(Number(influencer.engagement_rate))
              : "—"}
          </div>
        </div>
      </div>

      {(influencer.niche || influencer.country) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {influencer.niche && (
            <span className="rounded-md bg-neutral-800/80 px-1.5 py-0.5 text-[10.5px] font-medium text-neutral-300">
              {influencer.niche}
            </span>
          )}
          {influencer.country && (
            <span className="rounded-md bg-neutral-800/80 px-1.5 py-0.5 text-[10.5px] font-medium text-neutral-300">
              📍 {influencer.country}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-neutral-800 pt-3 text-[10.5px] text-neutral-500">
        <span>Ajouté {formatTimeAgo(influencer.created_at)}</span>
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 font-bold ring-1 ring-inset",
            statusClass(influencer.global_status)
          )}
        >
          {GLOBAL_STATUS_LABEL[influencer.global_status]}
        </span>
      </div>
    </Link>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </label>
      <div className="relative mt-1">
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="h-9 w-full appearance-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 pr-8 text-[12.5px] text-neutral-100 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        >
          <option value="">Tous</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 ring-1 ring-inset ring-violet-500/20">
        <UsersIcon className="h-6 w-6 text-violet-300" />
      </div>
      <h3 className="mt-4 font-display text-[16px] font-bold text-white">
        {hasFilters ? "Aucun résultat" : "Pas encore d'influenceur"}
      </h3>
      <p className="mt-1 max-w-xs text-[12.5px] text-neutral-400">
        {hasFilters
          ? "Aucun influenceur ne correspond à tes filtres. Essaie de les élargir ou reset."
          : "Commence par coller une URL TikTok ou Instagram, l'IA analysera le profil pour toi."}
      </p>
      {!hasFilters && (
        <Link
          href="/app/influencers/new"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[13px] font-bold text-white shadow-md shadow-violet-500/20 hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Ajouter un influenceur
        </Link>
      )}
    </div>
  );
}

function tierClass(tier: string): string {
  return (
    {
      nano: "bg-neutral-800/80 text-neutral-300 ring-neutral-700/50",
      micro: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/20",
      mid: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
      macro: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
      mega: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
    }[tier] ?? "bg-neutral-800 text-neutral-300 ring-neutral-700/50"
  );
}

function statusClass(status: string): string {
  return (
    {
      lead: "bg-neutral-800/80 text-neutral-300 ring-neutral-700/50",
      contacted: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
      negotiating: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
      accepted: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
      refused: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
      blacklist: "bg-red-500/10 text-red-300 ring-red-500/20",
    }[status] ?? "bg-neutral-800/80 text-neutral-300 ring-neutral-700/50"
  );
}
