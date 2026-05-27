"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Sparkles,
  Wallet,
  Activity,
  Trophy,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Search,
  Link as LinkIcon,
  ExternalLink,
  CheckCircle2,
  Zap,
  Plus,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  formatCompactNumber,
  formatMoneyCents,
  formatTimeAgo,
  SIZE_TIER_LABEL,
  GLOBAL_STATUS_LABEL,
} from "@/lib/format";
import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/utils";
import type {
  DashboardLead,
  DashboardActivity,
} from "./dashboard-types";

interface Kpis {
  totalInfluencers: number;
  leadsToday: number;
  leadsWeek: number;
  acceptedTotal: number;
  totalFollowers: number;
  totalBudgetCents: number;
}

interface TopProspector {
  userId: string;
  name: string;
  count: number;
}

interface PreviewData {
  handle: string;
  url: string;
  avatarUrl: string | null;
  followersCount: number | null;
  displayName: string | null;
  bio: string | null;
  alreadyInDb: {
    id: string;
    display_name: string;
    global_status: string;
    created_at: string;
  } | null;
}

export function DashboardView({
  user,
  kpis,
  recentLeads,
  tierCounts,
  recentActivity,
  topProspectors,
  isAdmin,
}: {
  user: { firstName: string | null; role: string };
  kpis: Kpis;
  recentLeads: DashboardLead[];
  tierCounts: Record<string, number>;
  recentActivity: DashboardActivity[];
  topProspectors: TopProspector[];
  isAdmin: boolean;
}) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return "Bonsoir";
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  })();

  const totalTierLeads = Object.values(tierCounts).reduce((s, n) => s + n, 0);

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8 lg:py-8">
      {/* Hero */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-black">
            Bienvenue
          </div>
          <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-tight text-neutral-900">
            {greeting}
            {user.firstName ? `, ${user.firstName}` : ""} 👋
          </h1>
          <p className="mt-1 text-[13.5px] text-neutral-500">
            {isAdmin
              ? "Vue d'ensemble de toutes les opérations."
              : "Tes leads et stats du jour."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/app/influencers/new"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFFF00] px-4 text-[13px] font-bold text-black shadow-md shadow-black/10 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Nouvelle lead
          </Link>
          <Link
            href="/app/influencers"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-[12.5px] font-bold text-neutral-700 hover:bg-neutral-50"
          >
            Voir tout
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Leads aujourd'hui"
          value={kpis.leadsToday}
          icon={Zap}
          tone="violet"
          hint={kpis.leadsToday === 0 ? "Allez go." : "Garde le rythme 🔥"}
        />
        <KpiCard
          label="Cette semaine"
          value={kpis.leadsWeek}
          icon={Calendar}
          tone="emerald"
          hint={`${Math.round(kpis.leadsWeek / 7)} / jour en moyenne`}
        />
        <KpiCard
          label="Influenceurs en base"
          value={kpis.totalInfluencers}
          icon={Users}
          tone="blue"
          hint={`${kpis.acceptedTotal} acceptés`}
        />
        <KpiCard
          label="Followers cumulés"
          value={formatCompactNumber(kpis.totalFollowers)}
          icon={TrendingUp}
          tone="amber"
          hint={
            kpis.totalBudgetCents > 0
              ? `Budget : ${formatMoneyCents(kpis.totalBudgetCents)}`
              : "Reach total"
          }
        />
      </div>

      {/* Analyseur rapide de profil — la fonctionnalité magique */}
      <ProfileAnalyzer />

      {/* 2 colonnes : Recent leads + side panel */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recent leads (2/3) */}
        <div className="lg:col-span-2">
          <SectionTitle icon={Activity} label="Leads récentes" />
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            {recentLeads.length === 0 ? (
              <EmptyBlock
                icon={Users}
                message="Aucune lead pour l'instant."
                cta={
                  <Link
                    href="/app/influencers/new"
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#FFFF00] px-3 text-[12.5px] font-bold text-black hover:brightness-110"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter la première
                  </Link>
                }
              />
            ) : (
              recentLeads.map((lead, idx) => (
                <RecentLeadRow key={lead.id} lead={lead} first={idx === 0} />
              ))
            )}
          </div>
        </div>

        {/* Side panel : tier distribution + (admin) top prospectors */}
        <div className="space-y-4">
          <div>
            <SectionTitle icon={BarChart3} label="Par taille (acceptés)" />
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              {totalTierLeads === 0 ? (
                <p className="text-center text-[12px] italic text-neutral-500">
                  Pas encore de leads acceptées.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {(["mega", "macro", "mid", "micro", "nano"] as const).map(
                    (tier) => (
                      <TierBar
                        key={tier}
                        tier={tier}
                        count={tierCounts[tier]}
                        total={totalTierLeads}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {isAdmin && topProspectors.length > 0 && (
            <div>
              <SectionTitle icon={Trophy} label="Top prospecteurs (aujourd'hui)" />
              <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                {topProspectors.map((p, idx) => (
                  <div
                    key={p.userId}
                    className={cn(
                      "flex items-center gap-3 p-3",
                      idx > 0 && "border-t border-neutral-100"
                    )}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFFF00] text-[11px] font-bold text-black">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-bold text-neutral-900">
                        {p.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-[16px] font-extrabold text-neutral-900">
                        {p.count}
                      </div>
                      <div className="text-[9.5px] uppercase tracking-wider text-neutral-500">
                        leads
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activité récente — full width */}
      {recentActivity.length > 0 && (
        <div className="mt-6">
          <SectionTitle icon={Clock} label="Activité récente" />
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <ul className="space-y-2.5">
              {recentActivity.slice(0, 10).map((a) => (
                <ActivityRow key={a.id} activity={a} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   KPI CARD
   ============================================================ */

function KpiCard({
  label,
  value,
  icon: Icon,
  tone,
  hint,
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
  tone: "violet" | "emerald" | "blue" | "amber" | "rose";
  hint?: string;
}) {
  const tones = {
    violet: "bg-[#FFFF00]/20 text-black ring-black/15",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
  }[tone];
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-inset",
            tones
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-[28px] font-extrabold tracking-tight text-neutral-900">
        {value}
      </div>
      <div className="mt-0.5 text-[11.5px] text-neutral-500">{label}</div>
      {hint && (
        <div className="mt-1.5 text-[10.5px] text-neutral-400">{hint}</div>
      )}
    </div>
  );
}

/* ============================================================
   PROFILE ANALYZER — la fonctionnalité phare
   ============================================================ */

function ProfileAnalyzer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PreviewData | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSavedId(null);
    setLoading(true);
    try {
      const res = await fetch("/api/profile/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setResult(data as PreviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function quickSave(bucket: "small" | "medium" | "large") {
    if (!result) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/influencers/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "tiktok",
          url: result.url,
          followers_bucket: bucket,
          whatsapp: "à compléter",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.existingId) {
          setSavedId(data.existingId);
        } else {
          setError(data.error ?? "Erreur");
        }
        return;
      }
      setSavedId(data.influencer.id);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-black/20 bg-gradient-to-br from-violet-50/60 to-fuchsia-50/40 p-5">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black">
        <Sparkles className="h-3.5 w-3.5" />
        Analyse rapide d&apos;un profil
      </div>
      <p className="mt-1 text-[12.5px] text-neutral-600">
        Colle un lien TikTok — on récupère la photo, le vrai nombre de followers,
        le nom et la bio. Sans rien sauvegarder. Idéal pour décider si tu DM ou pas.
      </p>

      <form onSubmit={analyze} className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@charlidamelio"
            className="block h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-[13.5px] text-neutral-900 placeholder:text-neutral-500 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/15"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#FFFF00] px-4 text-[13px] font-bold text-black shadow-md shadow-black/10 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Analyser
        </button>
      </form>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {result && !error && (
        <div className="mt-3 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-start gap-4">
            <Avatar
              id={result.handle}
              name={result.displayName ?? result.handle}
              url={result.avatarUrl}
              size={56}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-[16px] font-bold text-neutral-900">
                  {result.displayName ?? `@${result.handle}`}
                </h3>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11.5px] text-black hover:text-black"
                >
                  @{result.handle}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {result.bio && (
                <p className="mt-1 line-clamp-2 text-[12.5px] text-neutral-600">
                  {result.bio}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px]">
                {result.followersCount != null ? (
                  <>
                    <span className="text-neutral-500">
                      <strong className="font-display text-[15px] font-extrabold text-neutral-900">
                        {formatCompactNumber(result.followersCount)}
                      </strong>{" "}
                      followers
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
                        tierClassFromCount(result.followersCount)
                      )}
                    >
                      {SIZE_TIER_LABEL[tierFromCount(result.followersCount)]}
                    </span>
                  </>
                ) : (
                  <span className="text-[11.5px] italic text-rose-600">
                    ⚠️ TikTok n&apos;a pas répondu (captcha possible) — réessaie ou
                    saisis manuellement
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Already in DB ? */}
          {result.alreadyInDb && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <div className="flex items-center gap-2 text-[12px] text-amber-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>
                  Déjà en base ({GLOBAL_STATUS_LABEL[result.alreadyInDb.global_status]} ·{" "}
                  {formatTimeAgo(result.alreadyInDb.created_at)})
                </span>
              </div>
              <Link
                href={`/app/influencers/${result.alreadyInDb.id}`}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-amber-100 px-2 text-[11px] font-bold text-amber-800 hover:bg-amber-200"
              >
                Voir la fiche
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {/* Save options if not in db */}
          {!result.alreadyInDb && !savedId && (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
              <span className="self-center text-[11.5px] text-neutral-500">
                Sauvegarder comme lead :
              </span>
              <button
                onClick={() => quickSave("small")}
                disabled={loading}
                className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-white px-3 text-[11.5px] font-bold text-neutral-700 hover:border-black/35 disabled:opacity-50"
              >
                Petit
              </button>
              <button
                onClick={() => quickSave("medium")}
                disabled={loading}
                className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-white px-3 text-[11.5px] font-bold text-neutral-700 hover:border-black/35 disabled:opacity-50"
              >
                Moyen
              </button>
              <button
                onClick={() => quickSave("large")}
                disabled={loading}
                className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-white px-3 text-[11.5px] font-bold text-neutral-700 hover:border-black/35 disabled:opacity-50"
              >
                Grand
              </button>
              <Link
                href={`/app/influencers/new?url=${encodeURIComponent(result.url)}`}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#FFFF00] px-3 text-[11.5px] font-bold text-black hover:brightness-110"
              >
                Avec contact <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {savedId && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
              <div className="flex items-center gap-2 text-[12px] text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Lead sauvegardée !
              </div>
              <button
                onClick={() => router.push(`/app/influencers/${savedId}`)}
                className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-100 px-2 text-[11px] font-bold text-emerald-800 hover:bg-emerald-200"
              >
                Voir la fiche
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   RECENT LEAD ROW
   ============================================================ */

function RecentLeadRow({
  lead,
  first,
}: {
  lead: DashboardLead;
  first: boolean;
}) {
  const handle = lead.handle_tiktok ?? lead.handle_instagram;
  const platform = lead.handle_tiktok
    ? "TikTok"
    : lead.handle_instagram
      ? "Instagram"
      : "—";
  return (
    <Link
      href={`/app/influencers/${lead.id}`}
      className={cn(
        "flex items-center gap-3 p-3 transition-colors hover:bg-[#FFFF00]/10",
        !first && "border-t border-neutral-100"
      )}
    >
      <Avatar
        id={lead.id}
        name={lead.display_name}
        url={lead.avatar_url}
        size={36}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-[13px] font-bold text-neutral-900">
            {lead.display_name}
          </span>
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ring-1 ring-inset",
              tierClass(lead.size_tier)
            )}
          >
            {SIZE_TIER_LABEL[lead.size_tier]}
          </span>
        </div>
        <div className="mt-0.5 truncate text-[11px] text-neutral-500">
          {platform} {handle ? `· @${handle}` : ""} ·{" "}
          {formatCompactNumber(lead.followers_count)} followers
        </div>
      </div>
      <div className="text-right">
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[10.5px] font-bold ring-1 ring-inset",
            statusClass(lead.global_status)
          )}
        >
          {GLOBAL_STATUS_LABEL[lead.global_status]}
        </span>
        <div className="mt-1 text-[10px] text-neutral-500">
          {formatTimeAgo(lead.created_at)}
        </div>
      </div>
    </Link>
  );
}

/* ============================================================
   TIER BAR
   ============================================================ */

function TierBar({
  tier,
  count,
  total,
}: {
  tier: string;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const colors: Record<string, string> = {
    mega: "bg-amber-500",
    macro: "bg-violet-500",
    mid: "bg-blue-500",
    micro: "bg-cyan-500",
    nano: "bg-neutral-400",
  };
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold text-neutral-700">
          {SIZE_TIER_LABEL[tier]}
        </span>
        <span className="text-neutral-500">
          {count} <span className="text-neutral-400">· {pct}%</span>
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn("h-full rounded-full transition-all", colors[tier])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ============================================================
   ACTIVITY ROW
   ============================================================ */

function ActivityRow({ activity }: { activity: DashboardActivity }) {
  const verb = activityVerb(activity.action);
  const author =
    activity.profiles?.full_name ?? activity.profiles?.email ?? "—";
  return (
    <li className="flex items-center gap-2 text-[12px]">
      <span className="text-[14px]">{verb.emoji}</span>
      <span className="flex-1 text-neutral-700">
        <strong>{author}</strong> {verb.label}
      </span>
      <span className="text-[10.5px] text-neutral-400">
        {formatTimeAgo(activity.created_at)}
      </span>
    </li>
  );
}

function activityVerb(action: string): { emoji: string; label: string } {
  return (
    {
      "influencer.add": { emoji: "➕", label: "a ajouté un influenceur" },
      "influencer.analyze": {
        emoji: "🔍",
        label: "a lancé une analyse IA",
      },
      "prospection.create": {
        emoji: "📝",
        label: "a créé une prospection",
      },
      "prospection.contact": {
        emoji: "📩",
        label: "a contacté un influenceur",
      },
      "prospection.accept": {
        emoji: "✅",
        label: "a converti une lead",
      },
      "prospection.refuse": { emoji: "❌", label: "a essuyé un refus" },
    }[action] ?? { emoji: "•", label: action }
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: typeof Activity;
  label: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

function EmptyBlock({
  icon: Icon,
  message,
  cta,
}: {
  icon: typeof Users;
  message: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-[12.5px] text-neutral-500">{message}</p>
      {cta && <div className="mt-3">{cta}</div>}
    </div>
  );
}

function tierFromCount(n: number): string {
  if (n >= 1_000_000) return "mega";
  if (n >= 500_000) return "macro";
  if (n >= 100_000) return "mid";
  if (n >= 10_000) return "micro";
  return "nano";
}

function tierClassFromCount(n: number): string {
  return tierClass(tierFromCount(n));
}

function tierClass(tier: string): string {
  return (
    {
      nano: "bg-neutral-100 text-neutral-700 ring-neutral-300/50",
      micro: "bg-cyan-50 text-cyan-700 ring-cyan-200",
      mid: "bg-blue-50 text-blue-700 ring-blue-200",
      macro: "bg-[#FFFF00]/20 text-black ring-black/15",
      mega: "bg-amber-50 text-amber-700 ring-amber-200",
    }[tier] ?? "bg-neutral-100 text-neutral-700 ring-neutral-300/50"
  );
}

function statusClass(status: string): string {
  return (
    {
      lead: "bg-neutral-100 text-neutral-700 ring-neutral-300/50",
      contacted: "bg-blue-50 text-blue-700 ring-blue-200",
      negotiating: "bg-[#FFFF00]/20 text-black ring-black/15",
      accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      refused: "bg-rose-50 text-rose-700 ring-rose-200",
      blacklist: "bg-red-50 text-red-700 ring-red-200",
    }[status] ?? "bg-neutral-100 text-neutral-700 ring-neutral-300/50"
  );
}
