"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Wand2,
  Loader2,
  ArrowRight,
  RotateCcw,
  Brain,
  Tag,
  Palette,
  Eye,
  Award,
  Target,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BorderBeam } from "@/components/ui/border-beam";
import { ProductCard } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/lib/types/products";

interface CoachResult {
  positioning: {
    archetype: string;
    toneOfVoice: string[];
    visualMood: string[];
    competitorReference: string;
    uniqueAngle: string;
  };
  detectedCategory: string;
  detectedCategoryLabel: string;
  products: ProductSummary[];
  agent: {
    slug: string;
    fullName: string;
    city: string;
    avatar: string;
    tagline: string | null;
    specialties: string[];
    rating: number;
    missions: number;
  } | null;
  strategy: { title: string; text: string; priority: "now" | "next" | "later" }[];
}

type Stage = "form" | "loading" | "results";

export default function BrandCoachPage() {
  const [stage, setStage] = useState<Stage>("form");
  const [brandName, setBrandName] = useState("");
  const [description, setDescription] = useState("");
  const [audience, setAudience] = useState("");
  const [budget, setBudget] = useState("");
  const [goal, setGoal] = useState("");
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (stage === "loading") return;
    setStage("loading");
    setError(null);

    const minTime = new Promise<void>((r) => setTimeout(r, 2400));
    try {
      const [res] = await Promise.all([
        fetch("/api/ai/brand-coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brandName,
            description,
            audience,
            budget,
            goal,
          }),
        }),
        minTime,
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      setResult(data);
      setStage("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setStage("form");
    }
  }

  function reset() {
    setResult(null);
    setStage("form");
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-6 md:py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary-700">
          <Brain className="h-3 w-3" />
          AI Brand Coach · Powered by GPT-4
        </span>
        <h1 className="mt-3 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold tracking-tight text-neutral-900">
          On vous coache pour positionner votre marque
        </h1>
        <p className="mt-3 text-pretty text-sm text-neutral-600 sm:text-base">
          Décris ta marque, ton public, ton ambition. L'IA te ramène
          positionnement, produits qui matchent, agent idéal et stratégie de
          lancement.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {stage === "form" && (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            onSubmit={onSubmit}
            className="mt-10 space-y-5 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
          >
            <Field label="Nom de ta marque (ou idée)">
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="ex: Atelier Lila"
                className="input"
              />
            </Field>

            <Field label="Décris ta marque en 2-3 lignes" required>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ex: Marque de bougies parfumées en cire de soja, ambiance scandinave épurée, je vise une clientèle femmes 25-40 urbaines. Mon angle : qualité naturelle sans le côté granola."
                rows={5}
                className="input resize-none"
              />
              <p className="mt-1 text-right text-[10.5px] text-neutral-400">
                {description.length} caractères
              </p>
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Public cible">
                <input
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="ex: Femmes 25-40, urbaines, écoresponsables"
                  className="input"
                />
              </Field>
              <Field label="Budget de lancement">
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="input"
                >
                  <option value="">— Choisis —</option>
                  <option value="<5k">Moins de 5k €</option>
                  <option value="5k-15k">5k – 15k €</option>
                  <option value="15k-50k">15k – 50k €</option>
                  <option value="50k+">50k+ €</option>
                </select>
              </Field>
            </div>

            <Field label="Ton objectif principal">
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="input"
              >
                <option value="">— Choisis —</option>
                <option value="launch">Lancer ma toute première marque DTC</option>
                <option value="scale">Scaler ma marque existante</option>
                <option value="dropship">Tester en dropshipping</option>
                <option value="rebrand">Faire évoluer le branding</option>
                <option value="expand">Ouvrir une nouvelle catégorie</option>
              </select>
            </Field>

            {error && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
              <p className="text-[11px] text-neutral-500">
                ✨ Tes infos ne sont jamais partagées. L'IA tourne en privé.
              </p>
              <Button type="submit" variant="primary" size="lg">
                <Wand2 className="h-4 w-4" />
                Coach ma marque
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <style jsx>{`
              :global(.input) {
                width: 100%;
                height: 42px;
                padding: 0 14px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                font-size: 14px;
                color: #0f172a;
                transition: all 0.15s ease;
              }
              :global(.input::placeholder) {
                color: #94a3b8;
              }
              :global(.input:focus) {
                outline: none;
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
              }
              :global(textarea.input) {
                height: auto;
                padding: 10px 14px;
              }
            `}</style>
          </motion.form>
        )}

        {stage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 grid place-items-center rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50/40 via-white to-enterprise-50/40 p-12 text-center"
          >
            <div className="relative grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-primary-500 to-enterprise-600 text-white shadow-brand">
              <Brain className="h-7 w-7" />
              <span className="absolute -inset-1 rounded-3xl border-2 border-primary-300/50 animate-ping" />
            </div>
            <h2 className="mt-5 font-display text-xl font-extrabold text-neutral-900">
              On planche sur ta marque…
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Analyse positioning + match produits + sélection agent · ~3s
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-xs text-neutral-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              GPT-4 raisonne…
            </div>
          </motion.div>
        )}

        {stage === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 space-y-6"
          >
            {/* Positioning hero card */}
            <div className="relative overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50/40 via-white to-enterprise-50/40 p-6 md:p-8">
              <BorderBeam size={70} duration={9} colorFrom="#3B82F6" colorTo="#9333EA" />
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary-700 shadow-sm">
                  <Sparkles className="h-3 w-3" />
                  Positionnement détecté
                </span>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-neutral-500 hover:text-neutral-900"
                >
                  <RotateCcw className="h-3 w-3" />
                  Refaire
                </button>
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-neutral-900">
                {result.positioning.archetype}
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Catégorie principale :{" "}
                <strong className="text-neutral-900">
                  {result.detectedCategoryLabel}
                </strong>
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <Info icon={Eye} label="Ton de voix">
                  {result.positioning.toneOfVoice.join(" · ")}
                </Info>
                <Info icon={Palette} label="Univers visuel">
                  {result.positioning.visualMood.join(" · ")}
                </Info>
                <Info icon={Target} label="Marques de référence">
                  {result.positioning.competitorReference}
                </Info>
                <Info icon={Award} label="Angle unique">
                  {result.positioning.uniqueAngle}
                </Info>
              </div>
            </div>

            {/* Strategy timeline */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-8">
              <h3 className="font-display text-lg font-extrabold text-neutral-900">
                <Layers className="-mt-1 mr-1.5 inline h-4 w-4 text-primary-600" />
                Stratégie recommandée
              </h3>
              <ol className="mt-5 space-y-3">
                {result.strategy.map((s, i) => (
                  <li
                    key={i}
                    className={cn(
                      "relative flex items-start gap-3 rounded-2xl border p-4",
                      s.priority === "now"
                        ? "border-emerald-200 bg-emerald-50/40"
                        : s.priority === "next"
                          ? "border-primary-200 bg-primary-50/30"
                          : "border-neutral-200 bg-white"
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-bold uppercase",
                        s.priority === "now"
                          ? "bg-emerald-600 text-white"
                          : s.priority === "next"
                            ? "bg-primary-600 text-white"
                            : "bg-neutral-200 text-neutral-700"
                      )}
                    >
                      {s.priority === "now"
                        ? "Now"
                        : s.priority === "next"
                          ? "Next"
                          : "Later"}
                    </span>
                    <div className="flex-1">
                      <p className="text-[13.5px] font-bold text-neutral-900">
                        {s.title}
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">
                        {s.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Recommended agent */}
            {result.agent && (
              <section className="rounded-3xl border border-neutral-200 bg-white p-6">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Agent recommandé pour ta marque
                </p>
                <div className="mt-3 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <Image
                    src={result.agent.avatar}
                    alt={result.agent.fullName}
                    width={72}
                    height={72}
                    className="h-18 w-18 rounded-2xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-display text-lg font-extrabold text-neutral-900">
                      {result.agent.fullName}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {result.agent.tagline ?? result.agent.city}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {result.agent.specialties.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-primary-50 px-2 py-0.5 text-[10.5px] font-semibold text-primary-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button asChild variant="primary" size="md">
                    <Link href={`/app/agents/${result.agent.slug}`}>
                      Voir son profil
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            )}

            {/* Recommended products */}
            {result.products.length > 0 && (
              <section>
                <h3 className="font-display text-lg font-extrabold text-neutral-900">
                  Produits qui matchent ton positionnement
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Triés par popularité dans la communauté Sourcey
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {result.products.slice(0, 3).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-bold text-neutral-700">
        {label}
        {required && <span className="ml-1 text-primary-600">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Info({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white border border-neutral-100 p-4">
      <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
        <Icon className="h-3 w-3 text-neutral-400" />
        {label}
      </p>
      <p className="mt-1.5 text-[13px] font-semibold text-neutral-900">
        {children}
      </p>
    </div>
  );
}
