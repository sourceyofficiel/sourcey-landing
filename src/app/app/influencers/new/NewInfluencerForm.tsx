"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { formatCompactNumber, formatPercent } from "@/lib/format";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_context: string | null;
}

interface ScrapedSummary {
  bio: string | null;
  avatarUrl: string | null;
  verified: boolean;
  averageLikes: number | null;
  averageComments: number | null;
  averageViews: number | null;
  recentPosts: Array<{ caption: string; likes: number; comments: number }>;
}

interface ScrapeResult {
  influencer: {
    id: string;
    display_name: string;
    handle_tiktok: string | null;
    handle_instagram: string | null;
    followers_count: number;
    engagement_rate: number | null;
    contact_email: string | null;
  };
  scrapedData?: ScrapedSummary;
  alreadyExists: boolean;
}

interface AnalysisResult {
  detected_niche: string;
  estimated_engagement_rate: number;
  profitability_score: number;
  recommendation: "priority" | "contact" | "avoid";
  reasoning: string;
  audience_country: Record<string, number>;
}

export function NewInfluencerForm({ brands }: { brands: Brand[] }) {
  const [step, setStep] = useState<"input" | "scraping" | "scraped" | "analyzing" | "done">(
    "input"
  );
  const [url, setUrl] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(
    brands[0]?.id ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep("scraping");

    try {
      const res = await fetch("/api/influencers/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = (await res.json()) as { error?: string } & ScrapeResult;
      if (!res.ok) {
        setError(data.error ?? "Erreur de scraping");
        setStep("input");
        return;
      }
      setScrapeResult(data);
      setStep("scraped");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
      setStep("input");
    }
  }

  async function handleAnalyze() {
    if (!scrapeResult || !selectedBrandId) return;
    setError(null);
    setStep("analyzing");

    try {
      const res = await fetch(
        `/api/influencers/${scrapeResult.influencer.id}/analyze`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandId: selectedBrandId }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur d'analyse IA");
        setStep("scraped");
        return;
      }
      setAnalysis(data.analysis);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
      setStep("scraped");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 lg:px-8 lg:py-10">
      <Link
        href="/app/influencers"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-neutral-400 hover:text-neutral-100"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à la liste
      </Link>

      <h1 className="mt-3 font-display text-[24px] font-extrabold tracking-tight text-white">
        Ajouter un influenceur
      </h1>
      <p className="mt-1 text-[13px] text-neutral-400">
        Colle une URL TikTok ou Instagram — l&apos;IA scrape le profil et calcule
        un score de pertinence pour la marque de ton choix.
      </p>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2 text-[11px] text-neutral-500">
        <Step n={1} label="URL" active={step === "input"} done={step !== "input"} />
        <div className="h-px flex-1 bg-neutral-800" />
        <Step
          n={2}
          label="Scraping"
          active={step === "scraping" || step === "scraped"}
          done={step === "analyzing" || step === "done"}
        />
        <div className="h-px flex-1 bg-neutral-800" />
        <Step
          n={3}
          label="Analyse IA"
          active={step === "analyzing" || step === "done"}
          done={step === "done"}
        />
      </div>

      {/* === STEP 1 : INPUT === */}
      {step === "input" && (
        <form
          onSubmit={handleScrape}
          className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6"
        >
          <label className="block">
            <span className="block text-[11.5px] font-bold uppercase tracking-wider text-neutral-400">
              URL ou handle
            </span>
            <div className="relative mt-1.5">
              <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                required
                autoFocus
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.tiktok.com/@charlidamelio ou @charlidamelio"
                className="block h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-10 pr-3 text-[13.5px] text-white placeholder:text-neutral-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
            </div>
            <p className="mt-1.5 text-[11.5px] text-neutral-500">
              Formats acceptés : tiktok.com/@handle, instagram.com/handle, ou
              @handle (assumé TikTok).
            </p>
          </label>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12.5px] text-rose-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>{error}</div>
            </div>
          )}

          <button
            type="submit"
            disabled={!url.trim()}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13.5px] font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
          >
            Scraper le profil
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* === STEP 2 : SCRAPING === */}
      {step === "scraping" && (
        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-violet-400" />
          <h3 className="mt-4 font-display text-[15px] font-bold text-white">
            Scraping du profil…
          </h3>
          <p className="mt-1 text-[12.5px] text-neutral-400">
            On contacte Apify pour récupérer followers, posts récents et
            engagement. ~30 à 90 secondes selon la plateforme.
          </p>
        </div>
      )}

      {/* === STEP 2.5 : SCRAPED → choose brand for analysis === */}
      {(step === "scraped" || step === "analyzing") && scrapeResult && (
        <div className="mt-6 space-y-4">
          <ScrapedCard result={scrapeResult} />

          {/* Brand picker pour l'analyse */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              Analyse IA pour une marque
            </div>
            <p className="mt-1 text-[12.5px] text-neutral-400">
              Claude va scorer la pertinence de cet influenceur pour la marque
              choisie (niche, audience, engagement).
            </p>

            {brands.length === 0 ? (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12.5px] text-amber-200">
                <strong>Aucune marque créée.</strong> Crée d&apos;abord ta
                marque dans{" "}
                <Link
                  href="/app/brands"
                  className="font-bold underline hover:text-amber-100"
                >
                  Brands
                </Link>{" "}
                pour pouvoir lancer une analyse.
              </div>
            ) : (
              <>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBrandId(b.id)}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                        selectedBrandId === b.id
                          ? "border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30"
                          : "border-neutral-800 bg-neutral-950/40 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[12px] font-bold text-white">
                        {b.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-bold text-white">
                          {b.name}
                        </div>
                        {b.description && (
                          <div className="truncate text-[11px] text-neutral-500">
                            {b.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12.5px] text-rose-200">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedBrandId || step === "analyzing"}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[13.5px] font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
                  >
                    {step === "analyzing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyse en cours…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Lancer l&apos;analyse IA
                      </>
                    )}
                  </button>
                  <Link
                    href={`/app/influencers/${scrapeResult.influencer.id}`}
                    className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-[13px] font-bold text-neutral-300 hover:bg-neutral-800"
                  >
                    Skip l&apos;analyse
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* === STEP 3 : DONE === */}
      {step === "done" && scrapeResult && analysis && (
        <div className="mt-6 space-y-4">
          <ScrapedCard result={scrapeResult} />
          <AnalysisCard analysis={analysis} />
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/app/influencers/${scrapeResult.influencer.id}`}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[13.5px] font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110"
            >
              Voir la fiche complète
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => {
                setStep("input");
                setUrl("");
                setScrapeResult(null);
                setAnalysis(null);
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-[13px] font-bold text-neutral-300 hover:bg-neutral-800"
            >
              Ajouter un autre
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({
  n,
  label,
  active,
  done,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
          done
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/40"
            : active
              ? "bg-violet-500 text-white"
              : "bg-neutral-800 text-neutral-500"
        }`}
      >
        {done ? <Check className="h-3 w-3" /> : n}
      </div>
      <span
        className={
          active || done ? "font-bold text-neutral-200" : "text-neutral-500"
        }
      >
        {label}
      </span>
    </div>
  );
}

function ScrapedCard({ result }: { result: ScrapeResult }) {
  const i = result.influencer;
  const handle = i.handle_tiktok ?? i.handle_instagram;
  const platform = i.handle_tiktok ? "TikTok" : "Instagram";
  const scraped = result.scrapedData;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-emerald-300">
          <Check className="h-3.5 w-3.5" />
          Profil scrapé
        </div>
        {result.alreadyExists && (
          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10.5px] font-bold text-amber-300 ring-1 ring-inset ring-amber-500/20">
            Déjà en base
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start gap-3">
        {scraped?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={scraped.avatarUrl}
            alt={i.display_name}
            className="h-12 w-12 rounded-full object-cover ring-1 ring-neutral-800"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate font-display text-[15px] font-bold text-white">
              {i.display_name}
            </h3>
            {scraped?.verified && (
              <span className="text-[12px]" title="Vérifié">
                ✓
              </span>
            )}
          </div>
          <div className="text-[12px] text-neutral-400">
            {platform} · @{handle}
          </div>
        </div>
      </div>

      {scraped?.bio && (
        <p className="mt-3 line-clamp-3 text-[12.5px] text-neutral-300">
          {scraped.bio}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Followers" value={formatCompactNumber(i.followers_count)} />
        <Stat
          label="Engagement"
          value={
            i.engagement_rate != null
              ? formatPercent(Number(i.engagement_rate))
              : "—"
          }
        />
        <Stat
          label="Likes moy."
          value={
            scraped?.averageLikes != null
              ? formatCompactNumber(Math.round(scraped.averageLikes))
              : "—"
          }
        />
      </div>

      {i.contact_email && (
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[12px]">
          <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-300">
            📧 Email détecté en bio
          </div>
          <div className="mt-0.5 font-mono text-emerald-200">
            {i.contact_email}
          </div>
        </div>
      )}
    </div>
  );
}

function AnalysisCard({ analysis }: { analysis: AnalysisResult }) {
  const recoMeta = {
    priority: {
      label: "À prioriser",
      bg: "from-emerald-500/20 to-teal-500/10",
      text: "text-emerald-200",
      ring: "ring-emerald-500/30",
      emoji: "🔥",
    },
    contact: {
      label: "À contacter",
      bg: "from-violet-500/20 to-fuchsia-500/10",
      text: "text-violet-200",
      ring: "ring-violet-500/30",
      emoji: "👌",
    },
    avoid: {
      label: "À éviter",
      bg: "from-rose-500/20 to-red-500/10",
      text: "text-rose-200",
      ring: "ring-rose-500/30",
      emoji: "🛑",
    },
  }[analysis.recommendation];

  const topCountry = Object.entries(analysis.audience_country ?? {})
    .sort(([, a], [, b]) => b - a)[0];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br p-5 ring-1 ring-inset ${recoMeta.bg} ${recoMeta.ring}`}
    >
      <div className={`flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider ${recoMeta.text}`}>
        <Sparkles className="h-3.5 w-3.5" />
        Analyse IA · Claude Sonnet 4.5
      </div>

      <div className="mt-3 flex items-center gap-4">
        <div className="text-center">
          <div className={`font-display text-[40px] font-extrabold leading-none ${recoMeta.text}`}>
            {analysis.profitability_score}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-400">
            /100
          </div>
        </div>
        <div className="flex-1">
          <div className="font-display text-[18px] font-extrabold text-white">
            {recoMeta.emoji} {recoMeta.label}
          </div>
          <div className="text-[12px] text-neutral-300">
            Niche : <span className="font-bold">{analysis.detected_niche}</span>
          </div>
          {topCountry && (
            <div className="text-[12px] text-neutral-300">
              Audience principale :{" "}
              <span className="font-bold">
                {topCountry[0].toUpperCase()} ({Math.round(topCountry[1] * 100)}
                %)
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-[12.5px] leading-relaxed text-neutral-200">
        {analysis.reasoning}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-950/60 p-2.5">
      <div className="text-[9.5px] uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="mt-0.5 font-display text-[15px] font-extrabold text-white">
        {value}
      </div>
    </div>
  );
}
