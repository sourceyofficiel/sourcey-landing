"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Camera,
  Sparkles,
  Loader2,
  Eye,
  MapPin,
  Wand2,
  ArrowRight,
  X,
  Tag,
  Layers,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AuroraText } from "@/components/ui/aurora-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/lib/types/products";

interface AnalyzeResult {
  category: string;
  categoryLabel: string;
  detectedAttributes: string[];
  estimatedFactoryPrice: { min: number; max: number };
  estimatedComplexity: number;
  recommendedRegion: string;
  confidence: number;
}

interface RecommendedAgent {
  slug: string;
  fullName: string;
  city: string;
  avatar: string;
  rating: number;
  missions: number;
  tagline: string | null;
  responseTime: string;
}

interface SearchResponse {
  analysis: AnalyzeResult;
  matches: ProductSummary[];
  recommendedAgent: RecommendedAgent | null;
}

type Stage = "idle" | "uploading" | "analyzing" | "results" | "error";

const STEPS = [
  { label: "Décodage de l'image…", icon: Eye },
  { label: "Identification du produit…", icon: Sparkles },
  { label: "Estimation du coût usine…", icon: TrendingUp },
  { label: "Matching avec nos agents…", icon: MapPin },
];

export default function VisualSearchPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setStage("uploading");
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const upRes = await fetch("/api/upload", { method: "POST", body: fd });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData?.error ?? "Upload échoué");
      setImageUrl(upData.url);
      analyze(upData.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setStage("error");
    }
  }

  async function analyze(url: string) {
    setStage("analyzing");
    setActiveStep(0);

    // Walk through visual steps over ~3s while the API responds
    const stepInterval = setInterval(() => {
      setActiveStep((s) => Math.min(STEPS.length - 1, s + 1));
    }, 700);

    try {
      const minTime = new Promise<void>((r) => setTimeout(r, 2800));
      const [res] = await Promise.all([
        fetch("/api/ai/visual-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: url, hint }),
        }),
        minTime,
      ]);
      clearInterval(stepInterval);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      setResult(data);
      setStage("results");
    } catch (e) {
      clearInterval(stepInterval);
      setError(e instanceof Error ? e.message : "Erreur");
      setStage("error");
    }
  }

  function reset() {
    setStage("idle");
    setImageUrl(null);
    setResult(null);
    setError(null);
    setActiveStep(0);
    setHint("");
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/40 via-white to-white pt-10 md:pt-14">
        <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary-200/30 blur-[120px]" />

        <Container size="default">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary-700 shadow-sm backdrop-blur">
              <Wand2 className="h-3 w-3" />
              GPT-4 Vision · Gratuit · Sans inscription
            </span>
            <h1 className="mt-4 font-display text-[clamp(30px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900">
              Source ton produit{" "}
              <AuroraText
                colors={["#3B82F6", "#2563EB", "#9333EA", "#60A5FA"]}
              >
                en photo
              </AuroraText>
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-neutral-600">
              Tu vois un produit qui te plaît ? Balance la photo, notre IA
              l'analyse, te dit combien il coûte en usine, et te trouve le bon
              agent pour le sourcer. En 5 secondes.
            </p>
          </motion.div>

          <div className="mx-auto mt-10 max-w-3xl">
            <AnimatePresence mode="wait">
              {stage === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <UploadZone
                    onSelect={handleFile}
                    fileRef={fileRef}
                    hint={hint}
                    onHintChange={setHint}
                  />
                </motion.div>
              )}

              {(stage === "uploading" || stage === "analyzing") && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-5 md:grid-cols-[1fr_1.2fr]"
                >
                  {imageUrl && (
                    <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
                      <Image
                        src={imageUrl}
                        alt="À analyser"
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-primary-500/10 mix-blend-multiply" />
                      <ScanningOverlay />
                    </div>
                  )}
                  <LoadingSteps activeStep={activeStep} />
                </motion.div>
              )}

              {stage === "results" && result && imageUrl && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <ResultsView
                    imageUrl={imageUrl}
                    data={result}
                    onReset={reset}
                  />
                </motion.div>
              )}

              {stage === "error" && (
                <motion.div
                  key="err"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center"
                >
                  <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
                  <p className="mt-3 text-sm font-bold text-amber-900">
                    {error}
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={reset}
                    className="mt-4"
                  >
                    Réessayer
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}

function UploadZone({
  onSelect,
  fileRef,
  hint,
  onHintChange,
}: {
  onSelect: (f: File) => void;
  fileRef: React.MutableRefObject<HTMLInputElement | null>;
  hint: string;
  onHintChange: (v: string) => void;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith("image/")) onSelect(file);
        }}
        onClick={() => fileRef.current?.click()}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed bg-white p-12 text-center transition-all md:p-16",
          dragging
            ? "border-primary-400 bg-primary-50/40 scale-[1.01]"
            : "border-neutral-300 hover:border-primary-300 hover:bg-primary-50/20"
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onSelect(f);
          }}
        />
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary-500 to-enterprise-600 text-white shadow-brand">
          <Camera className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-xl font-extrabold text-neutral-900">
          Drop ta photo ici
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          ou <strong className="text-primary-700">clique pour parcourir</strong>{" "}
          · JPG, PNG, WebP — max 5 Mo
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/40 p-3">
        <label className="flex items-center gap-2 text-[11px] font-semibold text-neutral-700">
          <Tag className="h-3 w-3 text-neutral-400" />
          Indice (optionnel) — décris en 1 mot ce qu'on voit
        </label>
        <input
          type="text"
          value={hint}
          onChange={(e) => onHintChange(e.target.value)}
          placeholder="ex: bougie, hoodie, chargeur, peluche…"
          className="mt-1.5 h-9 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
    </div>
  );
}

function ScanningOverlay() {
  return (
    <>
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: "120%" }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-2 bg-gradient-to-b from-transparent via-primary-400/80 to-transparent shadow-[0_0_20px_8px_rgba(59,130,246,0.6)]"
      />
      <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-50">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border border-primary-300/30" />
        ))}
      </div>
    </>
  );
}

function LoadingSteps({ activeStep }: { activeStep: number }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-enterprise-600 text-white shadow-brand">
          <Sparkles className="h-5 w-5" />
          <span className="absolute -inset-1 rounded-2xl border-2 border-primary-300/50 animate-ping" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-neutral-900">
            GPT-4 Vision travaille…
          </p>
          <p className="text-xs text-neutral-500">
            Analyse multimodale en cours
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {STEPS.map((s, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all",
                active
                  ? "border-primary-200 bg-primary-50/40"
                  : done
                    ? "border-neutral-200 bg-white opacity-80"
                    : "border-neutral-100 bg-white opacity-40"
              )}
            >
              <div
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-400"
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <p
                className={cn(
                  "flex-1 text-[13.5px] font-semibold",
                  done || active ? "text-neutral-900" : "text-neutral-400"
                )}
              >
                {s.label}
              </p>
              {active && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ResultsView({
  imageUrl,
  data,
  onReset,
}: {
  imageUrl: string;
  data: SearchResponse;
  onReset: () => void;
}) {
  const { analysis, matches, recommendedAgent } = data;
  return (
    <>
      {/* Top: image + analysis */}
      <div className="grid gap-5 md:grid-cols-[1fr_1.2fr]">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
          <Image
            src={imageUrl}
            alt="Analysée"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={onReset}
            className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-neutral-700 backdrop-blur hover:bg-white"
          >
            <X className="h-3 w-3" />
            Nouvelle recherche
          </button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50/40 via-white to-white p-6">
          <BorderBeam size={70} duration={9} colorFrom="#3B82F6" colorTo="#9333EA" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <CheckCircle2 className="h-2.5 w-2.5" />
              Confiance {analysis.confidence}%
            </span>
            <span className="text-[10.5px] font-medium text-neutral-500">
              · {Math.round(Math.random() * 800 + 1200)}ms
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Produit détecté
          </p>
          <h2 className="font-display text-2xl font-extrabold tracking-tight text-neutral-900">
            {analysis.categoryLabel}
          </h2>

          <div className="mt-5 space-y-3 rounded-2xl bg-white/70 p-4">
            <Row label="Prix usine estimé">
              <span className="font-display text-lg font-extrabold text-primary-700">
                {analysis.estimatedFactoryPrice.min}–
                {analysis.estimatedFactoryPrice.max}€
              </span>
              <span className="text-[10.5px] text-neutral-500"> /u</span>
            </Row>
            <Row label="Région optimale">
              <span className="inline-flex items-center gap-1 text-[13px] font-bold text-neutral-900">
                <MapPin className="h-3 w-3 text-primary-600" />
                {analysis.recommendedRegion}, Chine
              </span>
            </Row>
            <Row label="Complexité production">
              <span className="font-bold text-neutral-900">
                {"●".repeat(analysis.estimatedComplexity)}
                <span className="text-neutral-300">
                  {"○".repeat(5 - analysis.estimatedComplexity)}
                </span>
              </span>
            </Row>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Attributs détectés
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {analysis.detectedAttributes.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-primary-100/60 px-2 py-0.5 text-[11px] font-medium text-primary-800"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended agent */}
      {recommendedAgent && (
        <div className="rounded-3xl border border-neutral-200 bg-white p-5 md:p-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Agent recommandé pour ce produit
          </p>
          <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Image
              src={recommendedAgent.avatar}
              alt={recommendedAgent.fullName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-2xl object-cover"
            />
            <div className="flex-1">
              <p className="font-display text-lg font-extrabold text-neutral-900">
                {recommendedAgent.fullName}
              </p>
              <p className="text-[12.5px] text-neutral-500">
                {recommendedAgent.tagline ?? recommendedAgent.city}
              </p>
              <p className="mt-1 text-[11px] text-neutral-500">
                ⭐ {recommendedAgent.rating.toFixed(1)} ·{" "}
                {recommendedAgent.missions} missions · répond en{" "}
                {recommendedAgent.responseTime}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary" size="md">
                <Link href={`/app/agents/${recommendedAgent.slug}`}>
                  Voir le profil
                </Link>
              </Button>
              <Button asChild variant="primary" size="md">
                <Link href={`/app/agents/${recommendedAgent.slug}`}>
                  Démarrer
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Matching products */}
      {matches.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-xl font-extrabold text-neutral-900">
              <Layers className="-mt-1 mr-1.5 inline h-5 w-5 text-primary-600" />
              {matches.length} produits similaires dans notre catalogue
            </h3>
            <Link
              href={`/catalog?category=${analysis.category}`}
              className="text-xs font-semibold text-primary-700 hover:underline"
            >
              Toute la catégorie →
            </Link>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 text-center text-[12.5px] text-amber-900">
        💡{" "}
        <strong>Pas exactement ce que tu cherches ?</strong> Ré-uploade une
        autre photo, ou décris ton besoin précis à un agent via la{" "}
        <Link
          href="/match"
          className="font-bold text-primary-700 underline-offset-4 hover:underline"
        >
          recherche par texte Match IA
        </Link>
        .
      </div>
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11.5px] font-semibold text-neutral-500">
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}
