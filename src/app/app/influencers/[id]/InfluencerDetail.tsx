"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Phone,
  ExternalLink,
  Edit3,
  Trash2,
  Loader2,
  Check,
  AlertCircle,
  Copy,
  MessageSquare,
  TrendingUp,
  Users,
  Building2,
  Hash,
  Globe,
  RefreshCw,
  Clock3,
  Scale,
  Flame,
  Megaphone,
} from "lucide-react";
import {
  formatCompactNumber,
  formatPercent,
  formatTimeAgo,
  getAvatarGradient,
  getInitials,
  SIZE_TIER_LABEL,
  GLOBAL_STATUS_LABEL,
  PROSPECTION_STATUS_LABEL,
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
  contact_phone: string | null;
  pricing_min_cents: number | null;
  pricing_max_cents: number | null;
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
  description: string | null;
  brand_context: string | null;
}

interface SponsoredPost {
  url: string | null;
  brand: string | null;
  caption_preview: string;
  performance_vs_organic: "above" | "average" | "below";
  views: number | null;
  likes: number;
  comments: number;
  posted_at: string | null;
  quality: "natural" | "average" | "forced";
  notes: string;
}

interface TopPost {
  url: string | null;
  caption_preview: string;
  views: number | null;
  likes: number;
  comments: number;
  posted_at: string | null;
  reason_for_success: string;
}

interface RawAnalysisExtra {
  detected_brand_partners?: string[];
  sponsored_posts?: SponsoredPost[];
  top_posts?: TopPost[];
  sponsored_vs_organic?: {
    sponsored_count: number;
    sponsored_avg_views: number | null;
    organic_avg_views: number | null;
    verdict: string;
  } | null;
  posting_pattern?: {
    posts_per_week: number;
    consistency: "régulier" | "irrégulier" | "rare";
    activity_30d_summary: string;
  };
}

interface Analysis {
  id: string;
  brand: { id: string; name: string; slug: string } | null;
  detected_niche: string;
  estimated_engagement_rate: number;
  audience_age: Record<string, number>;
  audience_gender: Record<string, number>;
  audience_country: Record<string, number>;
  profitability_score: number;
  recommendation: "priority" | "contact" | "avoid";
  reasoning: string;
  raw_response: RawAnalysisExtra | null;
  created_at: string;
}

interface Prospection {
  id: string;
  status: string;
  channel: string | null;
  agreed_price_cents: number | null;
  first_contacted_at: string | null;
  last_interaction_at: string | null;
  created_at: string;
  campaign: { id: string; name: string; brand_id: string } | null;
}

type Tab = "overview" | "analyses" | "prospections" | "draft";

export function InfluencerDetail({
  influencer: initialInfluencer,
  brands,
  initialAnalyses,
  initialProspections,
}: {
  influencer: Influencer;
  brands: Brand[];
  initialAnalyses: Analysis[];
  initialProspections: Prospection[];
}) {
  const router = useRouter();
  const [influencer, setInfluencer] = useState(initialInfluencer);
  const [analyses, setAnalyses] = useState(initialAnalyses);
  const [prospections] = useState(initialProspections);
  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);

  const handle =
    influencer.handle_tiktok ?? influencer.handle_instagram ?? influencer.handle_youtube;
  const platform = influencer.handle_tiktok
    ? "TikTok"
    : influencer.handle_instagram
      ? "Instagram"
      : "YouTube";
  const gradient = getAvatarGradient(influencer.id);
  const initials = getInitials(influencer.display_name, influencer.display_name);
  const latestAnalysis = analyses[0] ?? null;

  async function deleteInfluencer() {
    if (!confirm(`Supprimer ${influencer.display_name} ? Tout l'historique (analyses, prospections) disparaît.`))
      return;
    const res = await fetch(`/api/influencers/${influencer.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.push("/app/influencers");
  }

  async function changeStatus(newStatus: string) {
    setInfluencer((i) => ({ ...i, global_status: newStatus }));
    await fetch(`/api/influencers/${influencer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ global_status: newStatus }),
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-8">
      <Link
        href="/app/influencers"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux influenceurs
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start gap-5 rounded-2xl border border-neutral-200 bg-white p-6">
        <div
          className={cn(
            "flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-[24px] font-bold text-white",
            gradient
          )}
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-neutral-900">
              {influencer.display_name}
            </h1>
            <span
              className={cn(
                "rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ring-1 ring-inset",
                tierClass(influencer.size_tier)
              )}
            >
              {SIZE_TIER_LABEL[influencer.size_tier]}
            </span>
          </div>

          {handle && (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px] text-neutral-500">
              <span>{platform} · @{handle}</span>
              {influencer.profile_url && (
                <a
                  href={influencer.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700"
                >
                  <ExternalLink className="h-3 w-3" />
                  Voir le profil
                </a>
              )}
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat
              icon={Users}
              label="Followers"
              value={formatCompactNumber(influencer.followers_count)}
            />
            <Stat
              icon={TrendingUp}
              label="Engagement"
              value={
                influencer.engagement_rate != null
                  ? formatPercent(Number(influencer.engagement_rate))
                  : "—"
              }
            />
            <Stat
              icon={Sparkles}
              label="Score IA"
              value={
                latestAnalysis ? `${latestAnalysis.profitability_score}/100` : "—"
              }
            />
            <Stat
              icon={MessageSquare}
              label="Prospections"
              value={String(prospections.length)}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <select
            value={influencer.global_status}
            onChange={(e) => changeStatus(e.target.value)}
            className={cn(
              "h-9 rounded-lg px-3 text-[12px] font-bold ring-1 ring-inset focus:outline-none",
              statusClass(influencer.global_status)
            )}
          >
            {Object.entries(GLOBAL_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k} className="bg-white text-neutral-900">
                {v}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-[12px] font-bold text-neutral-700 hover:bg-neutral-100"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Éditer
            </button>
            <button
              onClick={deleteInfluencer}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:border-rose-500/40 hover:bg-rose-50 hover:text-rose-700"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-neutral-200">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
          Vue d&apos;ensemble
        </TabBtn>
        <TabBtn active={tab === "analyses"} onClick={() => setTab("analyses")}>
          Analyses IA
          {analyses.length > 0 && (
            <span className="ml-1.5 rounded-md bg-neutral-100 px-1.5 text-[10px] font-bold text-neutral-500">
              {analyses.length}
            </span>
          )}
        </TabBtn>
        <TabBtn active={tab === "prospections"} onClick={() => setTab("prospections")}>
          Prospections
          {prospections.length > 0 && (
            <span className="ml-1.5 rounded-md bg-neutral-100 px-1.5 text-[10px] font-bold text-neutral-500">
              {prospections.length}
            </span>
          )}
        </TabBtn>
        <TabBtn active={tab === "draft"} onClick={() => setTab("draft")}>
          <Sparkles className="mr-1 inline h-3 w-3" />
          Rédiger un message
        </TabBtn>
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <OverviewTab influencer={influencer} latestAnalysis={latestAnalysis} />
        )}
        {tab === "analyses" && (
          <AnalysesTab
            analyses={analyses}
            brands={brands}
            influencerId={influencer.id}
            onAnalysisAdded={(a) => setAnalyses((prev) => [a, ...prev])}
          />
        )}
        {tab === "prospections" && (
          <ProspectionsTab
            prospections={prospections}
            influencerId={influencer.id}
            brands={brands}
            onRefresh={() => router.refresh()}
          />
        )}
        {tab === "draft" && (
          <DraftTab influencerId={influencer.id} brands={brands} />
        )}
      </div>

      {editOpen && (
        <EditInfluencerModal
          influencer={influencer}
          onClose={() => setEditOpen(false)}
          onSaved={(i) => {
            setInfluencer(i);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   TABS
   ============================================================ */

function OverviewTab({
  influencer,
  latestAnalysis,
}: {
  influencer: Influencer;
  latestAnalysis: Analysis | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card title="Notes">
          {influencer.notes ? (
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-700">
              {influencer.notes}
            </p>
          ) : (
            <p className="text-[12.5px] italic text-neutral-500">
              Pas de notes. Édite la fiche pour ajouter du contexte (bio, infos
              négo, préférences…).
            </p>
          )}
        </Card>

        {latestAnalysis && (
          <div className="mt-4">
            <Card title="Dernière analyse IA">
              <div className="flex items-center gap-3">
                <ScoreBubble score={latestAnalysis.profitability_score} />
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-bold text-neutral-900">
                    Pour {latestAnalysis.brand?.name ?? "—"} ·{" "}
                    {recoMeta(latestAnalysis.recommendation).emoji}{" "}
                    {recoMeta(latestAnalysis.recommendation).label}
                  </div>
                  <div className="text-[11.5px] text-neutral-500">
                    Niche détectée : {latestAnalysis.detected_niche} ·{" "}
                    {formatTimeAgo(latestAnalysis.created_at)}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[12.5px] leading-relaxed text-neutral-700">
                {latestAnalysis.reasoning}
              </p>
            </Card>
          </div>
        )}
      </div>

      <div>
        <Card title="Contact">
          <DetailRow
            icon={Mail}
            label="Email"
            value={influencer.contact_email}
            copyable
          />
          <DetailRow icon={Phone} label="Téléphone" value={influencer.contact_phone} />
          <DetailRow icon={Globe} label="Pays" value={influencer.country} />
          <DetailRow icon={Hash} label="Niche" value={influencer.niche} />
        </Card>

        <div className="mt-4">
          <Card title="Pricing connu">
            {influencer.pricing_min_cents || influencer.pricing_max_cents ? (
              <div className="text-[13.5px] font-bold text-neutral-900">
                {influencer.pricing_min_cents
                  ? `${(influencer.pricing_min_cents / 100).toFixed(0)}€`
                  : "?"}
                {" – "}
                {influencer.pricing_max_cents
                  ? `${(influencer.pricing_max_cents / 100).toFixed(0)}€`
                  : "?"}
              </div>
            ) : (
              <p className="text-[12.5px] italic text-neutral-500">
                Pas de fourchette renseignée.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AnalysesTab({
  analyses,
  brands,
  influencerId,
  onAnalysisAdded,
}: {
  analyses: Analysis[];
  brands: Brand[];
  influencerId: string;
  onAnalysisAdded: (a: Analysis) => void;
}) {
  const [selectedBrand, setSelectedBrand] = useState<string>(brands[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis(force: boolean) {
    if (!selectedBrand) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/influencers/${influencerId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId: selectedBrand, force }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      onAnalysisAdded(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Trigger card */}
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-5">
        <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-violet-700">
          <Sparkles className="h-3.5 w-3.5" />
          Lancer une nouvelle analyse
        </div>
        <p className="mt-1 text-[12.5px] text-neutral-500">
          L&apos;analyse est mise en cache 7 jours par marque pour éviter les
          coûts inutiles.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="h-10 flex-1 min-w-[180px] rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-[13px] text-neutral-900 focus:border-violet-500 focus:outline-none"
          >
            <option value="">— Choisir une marque —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => runAnalysis(false)}
            disabled={!selectedBrand || busy}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[12.5px] font-bold text-white shadow-md shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Analyse…
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Analyser
              </>
            )}
          </button>
          <button
            onClick={() => runAnalysis(true)}
            disabled={!selectedBrand || busy}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 text-[12px] text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            title="Force la re-analyse (ignore le cache 7j)"
          >
            <RefreshCw className="h-3 w-3" />
            Force
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-[12px] text-rose-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* History */}
      {analyses.length === 0 ? (
        <Card>
          <p className="text-center text-[12.5px] italic text-neutral-500">
            Aucune analyse encore. Choisis une marque ci-dessus et lance la
            première.
          </p>
        </Card>
      ) : (
        analyses.map((a) => <AnalysisCard key={a.id} analysis={a} />)
      )}
    </div>
  );
}

function ProspectionsTab({
  prospections,
  influencerId,
  brands,
  onRefresh,
}: {
  prospections: Prospection[];
  influencerId: string;
  brands: Brand[];
  onRefresh: () => void;
}) {
  const [creating, setCreating] = useState(false);

  async function createProspection(brandId: string) {
    setCreating(true);
    try {
      const res = await fetch("/api/prospections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ influencer_id: influencerId, brand_id: brandId }),
      });
      if (res.ok) onRefresh();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[14px] font-bold text-neutral-900">
            Nouvelle prospection
          </h3>
        </div>
        <p className="mt-1 text-[12.5px] text-neutral-500">
          Crée une fiche de prospection pour le suivi (statut, échanges, prix).
          Choisis la marque cible.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {brands.length === 0 ? (
            <span className="text-[12px] italic text-neutral-500">
              Pas de marque créée encore.{" "}
              <Link href="/app/brands" className="text-violet-600 hover:underline">
                Créer une marque
              </Link>
            </span>
          ) : (
            brands.map((b) => (
              <button
                key={b.id}
                onClick={() => createProspection(b.id)}
                disabled={creating}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-[12px] font-bold text-neutral-800 hover:border-violet-400 hover:bg-violet-50/60 disabled:opacity-50"
              >
                <Building2 className="h-3 w-3" />
                {b.name}
              </button>
            ))
          )}
        </div>
      </div>

      {prospections.length === 0 ? (
        <Card>
          <p className="text-center text-[12.5px] italic text-neutral-500">
            Aucune prospection. Crée la première en choisissant une marque
            ci-dessus.
          </p>
        </Card>
      ) : (
        prospections.map((p) => (
          <Link
            key={p.id}
            href={`/app/pipeline/${p.id}`}
            className="block rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-violet-400 hover:bg-white"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-[14px] font-bold text-neutral-900">
                  {p.campaign?.name ?? "Prospection libre"}
                </div>
                <div className="mt-0.5 text-[11.5px] text-neutral-500">
                  Créée {formatTimeAgo(p.created_at)}
                  {p.last_interaction_at && (
                    <> · Dernière interaction {formatTimeAgo(p.last_interaction_at)}</>
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ring-1 ring-inset",
                  prospectionStatusClass(p.status)
                )}
              >
                {PROSPECTION_STATUS_LABEL[p.status]}
              </span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

function DraftTab({
  influencerId,
  brands,
}: {
  influencerId: string;
  brands: Brand[];
}) {
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");
  const [channel, setChannel] = useState<"email" | "dm_instagram" | "dm_tiktok">("email");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ subject: string | null; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!brandId) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/influencers/${influencerId}/draft-message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandId, channel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setResult({ subject: data.subject, body: data.body });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  async function copyAll() {
    if (!result) return;
    const text = result.subject
      ? `Objet: ${result.subject}\n\n${result.body}`
      : result.body;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silencieux */
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-5">
        <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-violet-700">
          <Sparkles className="h-3.5 w-3.5" />
          Rédiger un message d&apos;approche perso (Claude)
        </div>
        <p className="mt-1 text-[12.5px] text-neutral-500">
          Choisis la marque + le canal, l&apos;IA personnalise le message en se
          basant sur la bio + le contenu de l&apos;influenceur.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-[13px] text-neutral-900 focus:border-violet-500 focus:outline-none"
          >
            <option value="">— Marque —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={channel}
            onChange={(e) =>
              setChannel(
                e.target.value as "email" | "dm_instagram" | "dm_tiktok"
              )
            }
            className="h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-[13px] text-neutral-900 focus:border-violet-500 focus:outline-none"
          >
            <option value="email">Email</option>
            <option value="dm_instagram">DM Instagram</option>
            <option value="dm_tiktok">DM TikTok</option>
          </select>
        </div>

        <button
          onClick={generate}
          disabled={!brandId || busy}
          className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[12.5px] font-bold text-white shadow-md shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Rédaction…
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Générer le message
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-[12px] text-rose-700">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[14px] font-bold text-neutral-900">
              Message proposé
            </h3>
            <button
              onClick={copyAll}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-[11.5px] font-bold text-neutral-800 hover:bg-neutral-100"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-600" />
                  Copié
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copier
                </>
              )}
            </button>
          </div>
          {result.subject && (
            <div className="mt-3 rounded-lg bg-neutral-50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Objet
              </div>
              <div className="mt-1 text-[13px] font-bold text-neutral-900">
                {result.subject}
              </div>
            </div>
          )}
          <div className="mt-3 rounded-lg bg-neutral-50 p-3">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-neutral-800">
              {result.body}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      {title && (
        <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-3 py-2 text-[13px] transition-colors",
        active ? "font-bold text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
      )}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
      )}
    </button>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-neutral-50/60 p-2.5">
      <div className="flex items-center gap-1 text-neutral-500">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-0.5 font-display text-[16px] font-extrabold text-neutral-900">
        {value}
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  copyable,
}: {
  icon: typeof Mail;
  label: string;
  value: string | null;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="flex items-center gap-2 border-b border-neutral-200 py-2 last:border-0">
      <Icon className="h-3.5 w-3.5 text-neutral-500" />
      <div className="flex-1 text-[11px] text-neutral-500">{label}</div>
      {value ? (
        <button
          onClick={copyable ? copy : undefined}
          className={cn(
            "font-mono text-[12px] text-neutral-800",
            copyable && "cursor-pointer hover:text-violet-700"
          )}
        >
          {copied ? "Copié ✓" : value}
        </button>
      ) : (
        <span className="text-[12px] italic text-neutral-600">—</span>
      )}
    </div>
  );
}

function AnalysisCard({ analysis: a }: { analysis: Analysis }) {
  const extra = a.raw_response ?? {};
  const sponsored = extra.sponsored_posts ?? [];
  const tops = extra.top_posts ?? [];
  const partners = extra.detected_brand_partners ?? [];
  const sponsoredVs = extra.sponsored_vs_organic;
  const pattern = extra.posting_pattern;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5">
      {/* Header : score + brand + reco + reasoning */}
      <div className="flex items-start gap-4">
        <ScoreBubble score={a.profitability_score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[15px] font-bold text-neutral-900">
              {a.brand?.name ?? "(marque supprimée)"}
            </h3>
            <RecoBadge reco={a.recommendation} />
            <span className="text-[11px] text-neutral-500">
              {formatTimeAgo(a.created_at)}
            </span>
          </div>
          <div className="mt-1 text-[12px] text-neutral-500">
            Niche : <strong>{a.detected_niche}</strong> · Engagement estimé :{" "}
            <strong>{formatPercent(Number(a.estimated_engagement_rate))}</strong>
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-neutral-700">
            {a.reasoning}
          </p>
        </div>
      </div>

      {/* Activité 30j */}
      {pattern && (
        <div className="mt-4 rounded-xl bg-neutral-50/60 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-700">
            <Clock3 className="h-3 w-3" />
            Activité 30 derniers jours
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
            <span className="text-neutral-700">
              <strong className="text-neutral-900">{pattern.posts_per_week}</strong>{" "}
              posts/semaine
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-700">
              Régularité :{" "}
              <strong
                className={cn(
                  pattern.consistency === "régulier"
                    ? "text-emerald-700"
                    : pattern.consistency === "irrégulier"
                      ? "text-amber-700"
                      : "text-rose-700"
                )}
              >
                {pattern.consistency}
              </strong>
            </span>
          </div>
          <p className="mt-2 text-[12px] text-neutral-500">
            {pattern.activity_30d_summary}
          </p>
        </div>
      )}

      {/* Marques partenaires détectées */}
      {partners.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-700">
            <Building2 className="h-3 w-3" />
            Marques déjà partenaires ({partners.length})
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {partners.map((p, idx) => (
              <span
                key={idx}
                className="rounded-md bg-violet-50 px-2 py-1 text-[11.5px] font-bold text-violet-700 ring-1 ring-inset ring-violet-200"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sponsored vs Organic — le KPI critique */}
      {sponsoredVs && sponsoredVs.sponsored_count > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">
            <Scale className="h-3 w-3" />
            Perf des pubs vs contenu organique
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-black/30 p-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                Pub (moy. vues)
              </div>
              <div className="mt-0.5 font-display text-[16px] font-extrabold text-amber-700">
                {sponsoredVs.sponsored_avg_views != null
                  ? formatCompactNumber(sponsoredVs.sponsored_avg_views)
                  : "—"}
              </div>
            </div>
            <div className="rounded-lg bg-black/30 p-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500">
                Organique (moy. vues)
              </div>
              <div className="mt-0.5 font-display text-[16px] font-extrabold text-emerald-700">
                {sponsoredVs.organic_avg_views != null
                  ? formatCompactNumber(sponsoredVs.organic_avg_views)
                  : "—"}
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[12px] font-bold text-amber-700">
            {sponsoredVs.verdict}
          </p>
        </div>
      )}

      {/* Top posts */}
      {tops.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <Flame className="h-3 w-3" />
            Top {tops.length} posts performants
          </div>
          <div className="mt-2 space-y-2">
            {tops.map((p, idx) => (
              <PostRow
                key={idx}
                post={p}
                tone="emerald"
                meta={p.reason_for_success}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sponsored posts */}
      {sponsored.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-700">
            <Megaphone className="h-3 w-3" />
            Posts sponsorisés détectés ({sponsored.length})
          </div>
          <div className="mt-2 space-y-2">
            {sponsored.map((p, idx) => (
              <SponsoredRow key={idx} post={p} />
            ))}
          </div>
        </div>
      )}

      {/* Audience breakdown */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <AudienceCard title="Pays" data={a.audience_country} percent />
        <AudienceCard title="Âge" data={a.audience_age} percent />
        <AudienceCard title="Genre" data={a.audience_gender} percent />
      </div>
    </div>
  );
}

function PostRow({
  post,
  tone,
  meta,
}: {
  post: { url: string | null; caption_preview: string; views: number | null; likes: number; comments: number };
  tone: "emerald" | "violet";
  meta?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-2.5 ring-1 ring-inset",
        tone === "emerald"
          ? "bg-emerald-50/60 ring-emerald-200"
          : "bg-violet-50/60 ring-violet-200"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="line-clamp-1 text-[12px] text-neutral-800">
            &quot;{post.caption_preview}&quot;
          </div>
          {meta && (
            <div className="mt-0.5 text-[11px] italic text-neutral-500">
              → {meta}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right text-[10.5px] text-neutral-500">
          {post.views != null && post.views > 0 && (
            <div className="font-bold text-neutral-900">
              {formatCompactNumber(post.views)} vues
            </div>
          )}
          <div>
            {formatCompactNumber(post.likes)} ❤ ·{" "}
            {formatCompactNumber(post.comments)} 💬
          </div>
          {post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-violet-700 hover:text-violet-700"
            >
              Voir
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function SponsoredRow({ post }: { post: SponsoredPost }) {
  const perfMeta = {
    above: { label: "Sur-performe", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200", emoji: "📈" },
    average: { label: "Moyenne", cls: "bg-neutral-500/10 text-neutral-700 ring-neutral-500/20", emoji: "➖" },
    below: { label: "Sous-performe", cls: "bg-rose-50 text-rose-700 ring-rose-200", emoji: "📉" },
  }[post.performance_vs_organic] ?? {
    label: post.performance_vs_organic,
    cls: "bg-neutral-500/10 text-neutral-700",
    emoji: "",
  };
  const qualityMeta = {
    natural: { label: "Naturelle", cls: "text-emerald-700" },
    average: { label: "Moyenne", cls: "text-neutral-700" },
    forced: { label: "Forcée", cls: "text-rose-700" },
  }[post.quality] ?? { label: post.quality, cls: "text-neutral-700" };

  return (
    <div className="rounded-lg bg-violet-50/60 p-2.5 ring-1 ring-inset ring-violet-200">
      <div className="flex flex-wrap items-center gap-1.5">
        {post.brand && (
          <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10.5px] font-bold text-violet-700">
            {post.brand}
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset",
            perfMeta.cls
          )}
        >
          {perfMeta.emoji} {perfMeta.label}
        </span>
        <span className={cn("text-[10.5px] font-bold", qualityMeta.cls)}>
          Intégration : {qualityMeta.label}
        </span>
        {post.posted_at && (
          <span className="text-[10.5px] text-neutral-500">
            · {formatTimeAgo(post.posted_at)}
          </span>
        )}
        {post.url && (
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-[10.5px] text-violet-700 hover:text-violet-700"
          >
            Voir <ExternalLink className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
      <div className="mt-1.5 line-clamp-2 text-[12px] text-neutral-800">
        &quot;{post.caption_preview}&quot;
      </div>
      {post.notes && (
        <p className="mt-1.5 text-[11.5px] italic text-neutral-500">
          {post.notes}
        </p>
      )}
      <div className="mt-1.5 flex gap-3 text-[10.5px] text-neutral-500">
        {post.views != null && post.views > 0 && (
          <span>{formatCompactNumber(post.views)} vues</span>
        )}
        <span>{formatCompactNumber(post.likes)} likes</span>
        <span>{formatCompactNumber(post.comments)} comments</span>
      </div>
    </div>
  );
}

function ScoreBubble({ score }: { score: number }) {
  const color =
    score >= 75
      ? "from-emerald-500 to-teal-500"
      : score >= 50
        ? "from-violet-500 to-fuchsia-500"
        : "from-rose-500 to-red-500";
  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg",
        color
      )}
    >
      <div className="font-display text-[18px] font-extrabold leading-none">
        {score}
      </div>
      <div className="text-[8px] uppercase tracking-wider opacity-80">/100</div>
    </div>
  );
}

function RecoBadge({ reco }: { reco: "priority" | "contact" | "avoid" }) {
  const m = recoMeta(reco);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${m.cls}`}
    >
      {m.emoji} {m.label}
    </span>
  );
}

function recoMeta(reco: "priority" | "contact" | "avoid") {
  return {
    priority: {
      emoji: "🔥",
      label: "À prioriser",
      cls: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    contact: {
      emoji: "👌",
      label: "À contacter",
      cls: "bg-violet-50 text-violet-700 ring-violet-200",
    },
    avoid: {
      emoji: "🛑",
      label: "À éviter",
      cls: "bg-rose-50 text-rose-700 ring-rose-200",
    },
  }[reco];
}

function AudienceCard({
  title,
  data,
  percent,
}: {
  title: string;
  data: Record<string, number>;
  percent?: boolean;
}) {
  const sorted = Object.entries(data ?? {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  if (sorted.length === 0) return null;
  return (
    <div className="rounded-lg bg-neutral-50/60 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-neutral-500">
        {title}
      </div>
      <div className="mt-1 space-y-1">
        {sorted.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between text-[11.5px]"
          >
            <span className="text-neutral-700">{k}</span>
            <span className="font-bold text-neutral-900">
              {percent ? `${Math.round(v * 100)}%` : v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function tierClass(tier: string): string {
  return (
    {
      nano: "bg-neutral-100 text-neutral-700 ring-neutral-300/50",
      micro: "bg-cyan-50 text-cyan-700 ring-cyan-200",
      mid: "bg-blue-50 text-blue-700 ring-blue-200",
      macro: "bg-violet-50 text-violet-700 ring-violet-200",
      mega: "bg-amber-50 text-amber-700 ring-amber-200",
    }[tier] ?? "bg-neutral-100 text-neutral-700 ring-neutral-300/50"
  );
}

function statusClass(status: string): string {
  return (
    {
      lead: "bg-neutral-100 text-neutral-700 ring-neutral-300/50",
      contacted: "bg-blue-50 text-blue-700 ring-blue-200",
      negotiating: "bg-violet-50 text-violet-700 ring-violet-200",
      accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      refused: "bg-rose-50 text-rose-700 ring-rose-200",
      blacklist: "bg-red-50 text-red-700 ring-red-200",
    }[status] ?? "bg-neutral-100 text-neutral-700 ring-neutral-300/50"
  );
}

function prospectionStatusClass(status: string): string {
  return (
    {
      to_contact: "bg-neutral-100 text-neutral-700 ring-neutral-300/50",
      contacted: "bg-blue-50 text-blue-700 ring-blue-200",
      awaiting_reply: "bg-amber-50 text-amber-700 ring-amber-200",
      negotiating: "bg-violet-50 text-violet-700 ring-violet-200",
      accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      refused: "bg-rose-50 text-rose-700 ring-rose-200",
      ghosted: "bg-neutral-100 text-neutral-500 ring-neutral-300/50",
    }[status] ?? "bg-neutral-100 text-neutral-700 ring-neutral-300/50"
  );
}

/* ============================================================
   EDIT MODAL
   ============================================================ */

function EditInfluencerModal({
  influencer,
  onClose,
  onSaved,
}: {
  influencer: Influencer;
  onClose: () => void;
  onSaved: (i: Influencer) => void;
}) {
  const [display_name, setName] = useState(influencer.display_name);
  const [niche, setNiche] = useState(influencer.niche ?? "");
  const [country, setCountry] = useState(influencer.country ?? "");
  const [contact_email, setEmail] = useState(influencer.contact_email ?? "");
  const [contact_phone, setPhone] = useState(influencer.contact_phone ?? "");
  const [pricing_min, setPricingMin] = useState(
    influencer.pricing_min_cents ? influencer.pricing_min_cents / 100 : ""
  );
  const [pricing_max, setPricingMax] = useState(
    influencer.pricing_max_cents ? influencer.pricing_max_cents / 100 : ""
  );
  const [notes, setNotes] = useState(influencer.notes ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`/api/influencers/${influencer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name,
          niche: niche || null,
          country: country || null,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          pricing_min_cents: pricing_min
            ? Math.round(Number(pricing_min) * 100)
            : null,
          pricing_max_cents: pricing_max
            ? Math.round(Number(pricing_max) * 100)
            : null,
          notes: notes || null,
        }),
      });
      const data = await res.json();
      if (res.ok) onSaved(data.influencer);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
          <h3 className="font-display text-[15px] font-bold text-neutral-900">
            Éditer l&apos;influenceur
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
          <ModalField label="Nom affiché" value={display_name} onChange={setName} required />
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Niche" value={niche} onChange={setNiche} />
            <ModalField label="Pays (FR, BE…)" value={country} onChange={setCountry} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModalField label="Email" value={contact_email} onChange={setEmail} />
            <ModalField label="Téléphone" value={contact_phone} onChange={setPhone} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModalField
              label="Prix min (€)"
              type="number"
              value={String(pricing_min)}
              onChange={(v) => setPricingMin(v)}
            />
            <ModalField
              label="Prix max (€)"
              type="number"
              value={String(pricing_max)}
              onChange={(v) => setPricingMax(v)}
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-[12.5px] font-bold text-neutral-700 hover:bg-neutral-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[12.5px] font-bold text-white hover:brightness-110 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}

function ModalField({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-violet-500 focus:outline-none"
      />
    </div>
  );
}
