"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Sparkles,
  Link as LinkIcon,
  Check,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Phone,
  Mail,
  Users as UsersIcon,
  Hash,
  Wallet,
  PencilLine,
  Zap,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactNumber, formatPercent } from "@/lib/format";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_context: string | null;
}

type Mode = "quick" | "scrape";
type ScrapeStep = "input" | "scraping" | "scraped" | "analyzing" | "done";

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
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("quick");

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8 lg:py-10">
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

      {/* Mode toggle */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("quick")}
          className={cn(
            "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
            mode === "quick"
              ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20"
              : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              mode === "quick"
                ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                : "bg-neutral-800 text-neutral-400"
            )}
          >
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[14px] font-bold text-white">
              Lead convertie
            </div>
            <div className="mt-0.5 text-[11.5px] text-neutral-400">
              L&apos;influenceur a répondu OUI à ton message. Tu rentres ses
              coordonnées et les conditions négociées.
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode("scrape")}
          className={cn(
            "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
            mode === "scrape"
              ? "border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20"
              : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
              mode === "scrape"
                ? "bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                : "bg-neutral-800 text-neutral-400"
            )}
          >
            <Search className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[14px] font-bold text-white">
              Analyser un profil
            </div>
            <div className="mt-0.5 text-[11.5px] text-neutral-400">
              Avant de contacter : scrape les stats + score IA pour vérifier
              si ça vaut le coup d&apos;envoyer un DM.
            </div>
          </div>
        </button>
      </div>

      <div className="mt-6">
        {mode === "quick" ? (
          <QuickForm brands={brands} router={router} />
        ) : (
          <ScrapeFlow brands={brands} />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   QUICK FORM — saisie rapide d'une lead convertie
   ============================================================ */

function QuickForm({
  brands,
  router,
}: {
  brands: Brand[];
  router: ReturnType<typeof useRouter>;
}) {
  const [platform, setPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [niche, setNiche] = useState("");
  const [country, setCountry] = useState("FR");
  const [pricingEur, setPricingEur] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [channel, setChannel] = useState("dm_tiktok");
  const [notes, setNotes] = useState("");
  const [brandId, setBrandId] = useState(brands[0]?.id ?? "");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cleanHandle(h: string): string {
    return h.trim().replace(/^@/, "").replace(/^https?:\/\//, "").split("/").filter(Boolean).pop() ?? h;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cleaned = cleanHandle(handle);
      const payload = {
        display_name: displayName.trim() || cleaned || "Influenceur",
        handle_tiktok: platform === "tiktok" ? cleaned || null : null,
        handle_instagram: platform === "instagram" ? cleaned || null : null,
        followers_count: followers ? parseInt(followers.replace(/[^0-9]/g, "")) : 0,
        niche: niche.trim() || null,
        country: country.trim() || null,
        contact_email: email.trim() || null,
        contact_phone: whatsapp.trim() || null,
        pricing_cents: pricingEur ? Math.round(parseFloat(pricingEur) * 100) : null,
        expected_deliverables: deliverables.trim() || null,
        notes: notes.trim() || null,
        brand_id: brandId || null,
        channel,
      };

      const res = await fetch("/api/influencers/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.existingId) {
          if (
            confirm(
              `${data.error}\n\nVoir la fiche existante ?`
            )
          ) {
            router.push(`/app/influencers/${data.existingId}`);
          }
          return;
        }
        setError(data.error ?? "Erreur");
        return;
      }

      // Succès : direction la fiche de l'influenceur
      router.push(`/app/influencers/${data.influencer.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6"
    >
      <div className="rounded-xl bg-violet-500/5 p-3 ring-1 ring-inset ring-violet-500/20">
        <p className="text-[12px] leading-relaxed text-violet-200">
          🔥 <strong>Lead convertie.</strong> Cette saisie crée l&apos;influenceur
          + une prospection en statut <strong>&laquo; Accepté &raquo;</strong>,
          comptée dans ton classement.
        </p>
      </div>

      {/* Plateforme */}
      <div className="mt-5">
        <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
          Plateforme principale *
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {(["tiktok", "instagram"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={cn(
                "rounded-xl border px-3 py-2 text-[13px] font-bold transition-colors",
                platform === p
                  ? "border-violet-500 bg-violet-500/10 text-violet-200"
                  : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
              )}
            >
              {p === "tiktok" ? "TikTok" : "Instagram"}
            </button>
          ))}
        </div>
      </div>

      {/* Handle */}
      <Field
        label={`Handle ${platform === "tiktok" ? "TikTok" : "Instagram"} *`}
        icon={Hash}
      >
        <div className="flex items-center">
          <span className="select-none rounded-l-lg border border-r-0 border-neutral-800 bg-neutral-950 px-3 text-[13px] text-neutral-500">
            @
          </span>
          <input
            type="text"
            required
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={platform === "tiktok" ? "charlidamelio" : "zendaya"}
            className="block h-10 w-full rounded-r-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </Field>

      {/* Nom affiché */}
      <Field label="Nom (prénom ou pseudo affiché)" icon={PencilLine}>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Marie · Léo · Sarah Bensoussan…"
          className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Followers (approx)" icon={UsersIcon}>
          <input
            type="text"
            inputMode="numeric"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
            placeholder="120000"
            className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
          />
        </Field>
        <Field label="Pays (FR, BE, CH…)">
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value.toUpperCase())}
            maxLength={3}
            className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] uppercase text-white focus:border-violet-500 focus:outline-none"
          />
        </Field>
      </div>

      <Field label="Niche / catégorie" icon={Hash}>
        <input
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Mode streetwear, foot, beauté, food…"
          className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
        />
      </Field>

      {/* Contact */}
      <div className="mt-5 rounded-xl bg-neutral-950/40 p-4">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-emerald-300">
          📞 Coordonnées de contact
        </div>
        <p className="mt-0.5 text-[11px] text-neutral-500">
          C&apos;est le plus important : comment tu peux continuer la conversation
          en dehors du DM.
        </p>

        <Field label="WhatsApp / téléphone *" icon={Phone}>
          <input
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
          />
        </Field>

        <Field label="Email (optionnel)" icon={Mail}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="marie@example.com"
            className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
          />
        </Field>

        <Field label="Canal de contact utilisé">
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
          >
            <option value="dm_tiktok">DM TikTok</option>
            <option value="dm_instagram">DM Instagram</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </Field>
      </div>

      {/* Deal */}
      <div className="mt-5 rounded-xl bg-neutral-950/40 p-4">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-amber-300">
          💰 Conditions négociées
        </div>

        <Field label="Tarif négocié (€)" icon={Wallet}>
          <input
            type="number"
            min="0"
            step="10"
            value={pricingEur}
            onChange={(e) => setPricingEur(e.target.value)}
            placeholder="150"
            className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
          />
        </Field>

        <Field label="Livrables convenus">
          <textarea
            rows={2}
            value={deliverables}
            onChange={(e) => setDeliverables(e.target.value)}
            placeholder="1 vidéo TikTok + 2 stories Instagram avant le 15 juin. Code promo UKTV15."
            className="block w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
          />
        </Field>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <Field label="Marque associée">
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
          >
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {/* Notes */}
      <Field label="Notes libres (optionnel)">
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ce qui s'est dit dans le DM, dispos, préférences, contraintes…"
          className="block w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
        />
      </Field>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12.5px] text-rose-200">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || !handle.trim() || !whatsapp.trim()}
        className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13.5px] font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enregistrement…
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Enregistrer la lead
          </>
        )}
      </button>
      <p className="mt-2 text-center text-[10.5px] text-neutral-500">
        Champs requis : handle + WhatsApp/téléphone (le reste tu peux le remplir
        plus tard depuis la fiche)
      </p>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Hash;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block">
      <span className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

/* ============================================================
   SCRAPE FLOW — workflow scraping + analyse IA (legacy mode)
   ============================================================ */

function ScrapeFlow({ brands }: { brands: Brand[] }) {
  const [step, setStep] = useState<ScrapeStep>("input");
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
    <div>
      <div className="rounded-xl bg-amber-500/5 p-3 ring-1 ring-inset ring-amber-500/20">
        <p className="text-[12px] leading-relaxed text-amber-200">
          🔍 <strong>Mode vérification avant DM.</strong> Tu colles l&apos;URL,
          on scrape les stats + IA score la pertinence pour la marque cible.
          Pratique pour trier 20 profils avant d&apos;envoyer les messages.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mt-5 flex items-center gap-2 text-[11px] text-neutral-500">
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

      {step === "input" && (
        <form
          onSubmit={handleScrape}
          className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6"
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
                placeholder="https://www.tiktok.com/@charlidamelio"
                className="block h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-10 pr-3 text-[13.5px] text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          </label>
          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12.5px] text-rose-200">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={!url.trim()}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13.5px] font-bold text-white hover:brightness-110 disabled:opacity-50"
          >
            Scraper le profil
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {step === "scraping" && (
        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-violet-400" />
          <h3 className="mt-4 font-display text-[15px] font-bold text-white">
            Scraping en cours…
          </h3>
          <p className="mt-1 text-[12.5px] text-neutral-400">
            Apify récupère bio, 30 derniers posts, engagement, sponsos détectées. ~60-90 secondes.
          </p>
        </div>
      )}

      {(step === "scraped" || step === "analyzing") && scrapeResult && (
        <div className="mt-5 space-y-4">
          <ScrapedCard result={scrapeResult} />
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              Analyse IA pour une marque
            </div>
            {brands.length === 0 ? (
              <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12.5px] text-amber-200">
                Crée d&apos;abord une marque dans{" "}
                <Link href="/app/brands" className="font-bold underline">
                  Marques
                </Link>
                .
              </div>
            ) : (
              <>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBrandId(b.id)}
                      className={cn(
                        "rounded-xl border p-3 text-left transition-colors",
                        selectedBrandId === b.id
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                      )}
                    >
                      <div className="font-bold text-white">{b.name}</div>
                      {b.description && (
                        <div className="truncate text-[11px] text-neutral-500">
                          {b.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {error && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12.5px] text-rose-200">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedBrandId || step === "analyzing"}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[13.5px] font-bold text-white hover:brightness-110 disabled:opacity-50"
                  >
                    {step === "analyzing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyse…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Lancer l&apos;analyse
                      </>
                    )}
                  </button>
                  <Link
                    href={`/app/influencers/${scrapeResult.influencer.id}`}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 px-4 text-[13px] font-bold text-neutral-300 hover:bg-neutral-800"
                  >
                    Skip
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {step === "done" && scrapeResult && analysis && (
        <div className="mt-5 space-y-4">
          <ScrapedCard result={scrapeResult} />
          <AnalysisQuickCard analysis={analysis} />
          <Link
            href={`/app/influencers/${scrapeResult.influencer.id}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[13.5px] font-bold text-white hover:brightness-110"
          >
            Voir la fiche complète
            <ArrowRight className="h-4 w-4" />
          </Link>
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
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
          done
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/40"
            : active
              ? "bg-violet-500 text-white"
              : "bg-neutral-800 text-neutral-500"
        )}
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
      <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-emerald-300">
        <Check className="h-3.5 w-3.5" />
        Profil scrapé
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
          <h3 className="truncate font-display text-[15px] font-bold text-white">
            {i.display_name}
          </h3>
          <div className="text-[12px] text-neutral-400">
            {platform} · @{handle}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Mini label="Followers" value={formatCompactNumber(i.followers_count)} />
        <Mini
          label="Engagement"
          value={
            i.engagement_rate != null
              ? formatPercent(Number(i.engagement_rate))
              : "—"
          }
        />
        <Mini
          label="Likes moy."
          value={
            scraped?.averageLikes != null
              ? formatCompactNumber(Math.round(scraped.averageLikes))
              : "—"
          }
        />
      </div>
    </div>
  );
}

function AnalysisQuickCard({ analysis }: { analysis: AnalysisResult }) {
  const recoMeta = {
    priority: { label: "À prioriser", emoji: "🔥", tone: "emerald" },
    contact: { label: "À contacter", emoji: "👌", tone: "violet" },
    avoid: { label: "À éviter", emoji: "🛑", tone: "rose" },
  }[analysis.recommendation];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
      <div className="flex items-center gap-3">
        <div className="font-display text-[36px] font-extrabold text-white">
          {analysis.profitability_score}
          <span className="text-[14px] text-neutral-500">/100</span>
        </div>
        <div>
          <div className="font-display text-[16px] font-extrabold text-white">
            {recoMeta.emoji} {recoMeta.label}
          </div>
          <div className="text-[12px] text-neutral-400">
            Niche : <strong>{analysis.detected_niche}</strong>
          </div>
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-neutral-300">{analysis.reasoning}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-950/60 p-2">
      <div className="text-[9.5px] uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="mt-0.5 font-display text-[14px] font-extrabold text-white">
        {value}
      </div>
    </div>
  );
}
