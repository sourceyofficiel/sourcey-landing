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
} from "lucide-react";
import {
  formatCompactNumber,
  formatPercent,
  formatTimeAgo,
  formatDate,
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
        className="inline-flex items-center gap-1.5 text-[12.5px] text-neutral-400 hover:text-neutral-100"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux influenceurs
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-wrap items-start gap-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
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
            <h1 className="font-display text-[26px] font-extrabold tracking-tight text-white">
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
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px] text-neutral-400">
              <span>{platform} · @{handle}</span>
              {influencer.profile_url && (
                <a
                  href={influencer.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
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
              <option key={k} value={k} className="bg-neutral-900 text-white">
                {v}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => setEditOpen(true)}
              className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[12px] font-bold text-neutral-300 hover:bg-neutral-800"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Éditer
            </button>
            <button
              onClick={deleteInfluencer}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
              title="Supprimer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-1 border-b border-neutral-800">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
          Vue d&apos;ensemble
        </TabBtn>
        <TabBtn active={tab === "analyses"} onClick={() => setTab("analyses")}>
          Analyses IA
          {analyses.length > 0 && (
            <span className="ml-1.5 rounded-md bg-neutral-800 px-1.5 text-[10px] font-bold text-neutral-400">
              {analyses.length}
            </span>
          )}
        </TabBtn>
        <TabBtn active={tab === "prospections"} onClick={() => setTab("prospections")}>
          Prospections
          {prospections.length > 0 && (
            <span className="ml-1.5 rounded-md bg-neutral-800 px-1.5 text-[10px] font-bold text-neutral-400">
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
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-300">
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
                  <div className="text-[12.5px] font-bold text-white">
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
              <p className="mt-3 text-[12.5px] leading-relaxed text-neutral-300">
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
              <div className="text-[13.5px] font-bold text-white">
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
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-5">
        <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          Lancer une nouvelle analyse
        </div>
        <p className="mt-1 text-[12.5px] text-neutral-400">
          L&apos;analyse est mise en cache 7 jours par marque pour éviter les
          coûts inutiles.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="h-10 flex-1 min-w-[180px] rounded-lg border border-neutral-800 bg-neutral-950 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
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
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[12px] text-neutral-300 hover:bg-neutral-800 disabled:opacity-50"
            title="Force la re-analyse (ignore le cache 7j)"
          >
            <RefreshCw className="h-3 w-3" />
            Force
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] text-rose-200">
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
        analyses.map((a) => (
          <div
            key={a.id}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5"
          >
            <div className="flex items-start gap-4">
              <ScoreBubble score={a.profitability_score} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[15px] font-bold text-white">
                    {a.brand?.name ?? "(marque supprimée)"}
                  </h3>
                  <RecoBadge reco={a.recommendation} />
                  <span className="text-[11px] text-neutral-500">
                    {formatTimeAgo(a.created_at)}
                  </span>
                </div>
                <div className="mt-1 text-[12px] text-neutral-400">
                  Niche : <strong>{a.detected_niche}</strong> ·{" "}
                  Engagement estimé : <strong>{formatPercent(Number(a.estimated_engagement_rate))}</strong>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-neutral-300">
                  {a.reasoning}
                </p>

                {/* Audience breakdown */}
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <AudienceCard title="Pays" data={a.audience_country} percent />
                  <AudienceCard title="Âge" data={a.audience_age} percent />
                  <AudienceCard title="Genre" data={a.audience_gender} percent />
                </div>
              </div>
            </div>
          </div>
        ))
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
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[14px] font-bold text-white">
            Nouvelle prospection
          </h3>
        </div>
        <p className="mt-1 text-[12.5px] text-neutral-400">
          Crée une fiche de prospection pour le suivi (statut, échanges, prix).
          Choisis la marque cible.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {brands.length === 0 ? (
            <span className="text-[12px] italic text-neutral-500">
              Pas de marque créée encore.{" "}
              <Link href="/app/brands" className="text-violet-400 hover:underline">
                Créer une marque
              </Link>
            </span>
          ) : (
            brands.map((b) => (
              <button
                key={b.id}
                onClick={() => createProspection(b.id)}
                disabled={creating}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 text-[12px] font-bold text-neutral-200 hover:border-violet-500/40 hover:bg-violet-500/5 disabled:opacity-50"
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
            className="block rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 transition-colors hover:border-violet-500/40 hover:bg-neutral-900"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-display text-[14px] font-bold text-white">
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
      <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-5">
        <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-violet-300">
          <Sparkles className="h-3.5 w-3.5" />
          Rédiger un message d&apos;approche perso (Claude)
        </div>
        <p className="mt-1 text-[12.5px] text-neutral-400">
          Choisis la marque + le canal, l&apos;IA personnalise le message en se
          basant sur la bio + le contenu de l&apos;influenceur.
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
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
            className="h-10 rounded-lg border border-neutral-800 bg-neutral-950 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
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
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12px] text-rose-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-[14px] font-bold text-white">
              Message proposé
            </h3>
            <button
              onClick={copyAll}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 text-[11.5px] font-bold text-neutral-200 hover:bg-neutral-800"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
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
            <div className="mt-3 rounded-lg bg-neutral-950 p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Objet
              </div>
              <div className="mt-1 text-[13px] font-bold text-white">
                {result.subject}
              </div>
            </div>
          )}
          <div className="mt-3 rounded-lg bg-neutral-950 p-3">
            <pre className="whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-neutral-200">
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
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
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
        active ? "font-bold text-white" : "text-neutral-400 hover:text-neutral-100"
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
    <div className="rounded-lg bg-neutral-950/60 p-2.5">
      <div className="flex items-center gap-1 text-neutral-500">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-0.5 font-display text-[16px] font-extrabold text-white">
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
    <div className="flex items-center gap-2 border-b border-neutral-800 py-2 last:border-0">
      <Icon className="h-3.5 w-3.5 text-neutral-500" />
      <div className="flex-1 text-[11px] text-neutral-500">{label}</div>
      {value ? (
        <button
          onClick={copyable ? copy : undefined}
          className={cn(
            "font-mono text-[12px] text-neutral-200",
            copyable && "cursor-pointer hover:text-violet-300"
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
      cls: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
    },
    contact: {
      emoji: "👌",
      label: "À contacter",
      cls: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
    },
    avoid: {
      emoji: "🛑",
      label: "À éviter",
      cls: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
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
    <div className="rounded-lg bg-neutral-950/60 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-neutral-500">
        {title}
      </div>
      <div className="mt-1 space-y-1">
        {sorted.map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between text-[11.5px]"
          >
            <span className="text-neutral-300">{k}</span>
            <span className="font-bold text-white">
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

function prospectionStatusClass(status: string): string {
  return (
    {
      to_contact: "bg-neutral-800/80 text-neutral-300 ring-neutral-700/50",
      contacted: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
      awaiting_reply: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
      negotiating: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
      accepted: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
      refused: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
      ghosted: "bg-neutral-800/80 text-neutral-500 ring-neutral-700/50",
    }[status] ?? "bg-neutral-800/80 text-neutral-300 ring-neutral-700/50"
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
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3.5">
          <h3 className="font-display text-[15px] font-bold text-white">
            Éditer l&apos;influenceur
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200"
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
              className="mt-1 block w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-[13px] text-white focus:border-violet-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-neutral-800 bg-neutral-900 px-4 text-[12.5px] font-bold text-neutral-300 hover:bg-neutral-800"
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
        className="mt-1 block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
      />
    </div>
  );
}
