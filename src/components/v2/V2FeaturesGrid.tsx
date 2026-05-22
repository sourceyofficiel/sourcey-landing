"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Sparkles,
  Video,
  Truck,
  Check,
  Play,
  type LucideIcon,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";
import { cn } from "@/lib/utils";

// Leaflet ne sait pas faire de SSR → dynamic import client-only
const V2ChinaMap = dynamic(
  () => import("@/components/v2/V2ChinaMap").then((m) => m.V2ChinaMap),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[5/4] w-full animate-pulse rounded-2xl bg-neutral-100" />
    ),
  }
);

/**
 * V2FeaturesGrid — tabs interactifs des 4 piliers Sourcey.
 *
 * Layout 2-cols (desktop) : à gauche le détail (titre + paragraphe + bullets),
 * à droite un visual illustré. Onglets en pill sticky en haut.
 *
 * Inspiration : "tabs feature showcase" style Linear / Vercel.
 */

type Tab = {
  id: string;
  label: string;
  icon: LucideIcon;
  title: string;
  description: string;
  bullets: string[];
  visualType: "agents" | "ai" | "qc" | "logistics";
};

const TABS: Tab[] = [
  {
    id: "agents",
    label: "Réseau d'agents",
    icon: Users,
    title: "14 agents francophones, vérifiés en personne",
    description:
      "Chacun est basé dans une ville-clé en Chine (Yiwu, Guangzhou, Shenzhen...) et spécialisé sur ses catégories. Aucun marketplace anonyme — que des humains que tu peux nommer.",
    bullets: [
      "Tous parlent français + chinois (et souvent anglais)",
      "Vérifiés sur place par notre équipe à Shanghai",
      "Note publique transparente après chaque mission",
    ],
    visualType: "agents",
  },
  {
    id: "ai",
    label: "Sourcing IA",
    icon: Sparkles,
    title: "Trouve l'agent qui connaît ta niche en 5 secondes",
    description:
      "Décris ton produit en français, notre IA route vers l'agent qui connaît ta catégorie par cœur. Pas de questionnaires, pas de tickets — juste une mise en relation directe.",
    bullets: [
      "Match en moins de 5 secondes basé sur la spécialité",
      "Scoring multi-critères (niche, langue, historique)",
      "Re-routing automatique si l'agent est indisponible",
    ],
    visualType: "ai",
  },
  {
    id: "qc",
    label: "QC vidéo",
    icon: Video,
    title: "Vidéo QC obligatoire avant chaque expédition",
    description:
      "Ton agent filme ton produit en direct, teste le packaging, vérifie les défauts. Tu valides depuis ton téléphone avant que le colis ne parte. Zéro mauvaise surprise.",
    bullets: [
      "Vidéo full HD archivée dans ton dashboard",
      "Tu valides ou demandes correction en 1 clic",
      "Garantie remplacement si non conforme à la vidéo",
    ],
    visualType: "qc",
  },
  {
    id: "logistics",
    label: "Logistique",
    icon: Truck,
    title: "Livraison 10 jours porte-à-porte, douanes incluses",
    description:
      "Air ou maritime selon ton choix. On s'occupe des douanes, du transit, des taxes. Tu reçois exactement ce que tu as validé, avec tracking en temps réel.",
    bullets: [
      "Air express : 7-10 jours porte-à-porte",
      "Maritime : 35-45 jours (économique)",
      "Douanes EU/US gérées par notre équipe",
    ],
    visualType: "logistics",
  },
];

export function V2FeaturesGrid() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const active = TABS.find((t) => t.id === activeId) ?? TABS[0];

  return (
    <section
      id="features"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
    >
      <V2SectionLabel>Fonctionnalités</V2SectionLabel>

      {/* Title */}
      <motion.h2
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Tout ce qu'il faut pour{" "}
        <span className="text-primary-600">scaler ton e-com.</span>
      </motion.h2>

      <motion.p
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto mt-5 max-w-[600px] text-center text-[15px] leading-relaxed text-neutral-500"
      >
        Quatre piliers conçus pour t'enlever toute la charge mentale du sourcing.
      </motion.p>

      {/* Tabs */}
      <motion.div
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-10 flex justify-center"
      >
        <div className="inline-flex w-full max-w-[640px] flex-wrap items-center justify-center gap-1 rounded-full border border-neutral-200/80 bg-neutral-50/70 p-1 shadow-sm backdrop-blur-sm md:w-auto md:flex-nowrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "relative inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors md:px-4",
                  isActive
                    ? "text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                {/* Active background pill — animated layout transition */}
                {isActive && (
                  <motion.span
                    layoutId="features-tab-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.08)]"
                    transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
                  />
                )}
                <Icon
                  className={cn(
                    "relative h-3.5 w-3.5 transition-colors",
                    isActive ? "text-primary-600" : "text-neutral-400"
                  )}
                  strokeWidth={2}
                />
                <span className="relative whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content area — 2 col grid */}
      <div className="relative mt-12 grid grid-cols-1 gap-8 md:mt-16 md:grid-cols-2 md:gap-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${activeId}`}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="md:order-1"
          >
            <h3 className="font-display text-[clamp(22px,3vw,32px)] font-extrabold leading-[1.15] tracking-tight text-neutral-900">
              {active.title}
            </h3>
            <p className="mt-4 text-[14.5px] leading-relaxed text-neutral-500 md:text-[15.5px]">
              {active.description}
            </p>

            <ul className="mt-7 grid gap-3">
              {active.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-neutral-700 md:text-[14.5px]">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Visual */}
          <motion.div
            key={`visual-${activeId}`}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:order-2"
          >
            <FeatureVisual type={active.visualType} />
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ============================================================
   VISUAL DISPATCHER
   ============================================================ */

function FeatureVisual({ type }: { type: Tab["visualType"] }) {
  switch (type) {
    case "agents":
      return <V2ChinaMap />;
    case "ai":
      return <AISourcingVisual />;
    case "qc":
      return <VideoQCVisual />;
    case "logistics":
      return <LogisticsVisual />;
  }
}

/* ============================================================
   VISUAL 2 — AI Sourcing UI mock
   ============================================================ */

function AISourcingVisual() {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-primary-50/40 via-white to-white p-6 shadow-sm">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-600">
        Match en cours…
      </span>

      <div className="mt-3 flex w-full items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm">
        <Sparkles className="h-4 w-4 shrink-0 text-primary-500" />
        <div className="text-[12px] text-neutral-500">
          Bougies parfumées artisanales, MOQ 100…
        </div>
        <div className="ml-auto rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
          Match
        </div>
      </div>

      {/* Agent results */}
      <div className="mt-5 space-y-2.5">
        {[
          { name: "Zhang Lin", city: "Shanghai", spec: "Cosméto & bougies", score: 96, color: "#FECACA" },
          { name: "Chen Mei", city: "Guangzhou", spec: "Déco maison", score: 89, color: "#FED7AA" },
          { name: "Wang Jun", city: "Yiwu", spec: "Goodies & gifts", score: 82, color: "#BFDBFE" },
        ].map((agent, i) => (
          <motion.div
            key={agent.name}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-xl border border-neutral-200/80 bg-white p-2.5 shadow-sm"
          >
            <span
              className="h-9 w-9 shrink-0 rounded-full"
              style={{ background: agent.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-neutral-900">
                {agent.name}
              </div>
              <div className="truncate text-[10.5px] text-neutral-500">
                {agent.city} · {agent.spec}
              </div>
            </div>
            <div className="flex items-baseline gap-0.5 rounded-lg bg-primary-50 px-2 py-1">
              <span className="text-[12px] font-bold text-primary-700">
                {agent.score}
              </span>
              <span className="text-[9px] text-primary-600">%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   VISUAL 3 — Video QC player mock
   ============================================================ */

function VideoQCVisual() {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-neutral-50 to-white p-5 shadow-sm">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-600">
        Contrôle qualité live
      </span>

      {/* Video player frame */}
      <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black shadow-md">
        {/* Live badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-red-500/95 px-2 py-1 shadow-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          <span className="text-[9px] font-bold tracking-wider text-white">
            LIVE QC
          </span>
        </div>

        {/* Play button center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg backdrop-blur-sm">
            <Play className="ml-0.5 h-5 w-5 fill-primary-600 text-primary-600" />
          </div>
        </div>

        {/* Bottom timeline */}
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full w-2/3 rounded-full bg-white" />
          </div>
          <span className="font-mono text-[9px] text-white/80">02:14</span>
        </div>
      </div>

      {/* Validation row */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-rose-200 shadow-sm">
          <Users className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 rounded-xl border border-green-200 bg-green-50/60 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
              <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
            </span>
            <span className="text-[12px] font-semibold text-green-700">
              Validé par Chen Mei
            </span>
          </div>
          <p className="mt-0.5 text-[10.5px] text-green-700/80">
            500 unités vérifiées · 0 défaut détecté
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   VISUAL 4 — Logistics timeline mock
   ============================================================ */

function LogisticsVisual() {
  const STEPS = [
    { label: "Production", date: "J+0", done: true },
    { label: "QC vidéo", date: "J+3", done: true },
    { label: "Expédition", date: "J+4", done: true, active: true },
    { label: "Transit", date: "J+7", done: false },
    { label: "Livré", date: "J+10", done: false },
  ];

  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-primary-50/40 via-white to-white p-5 shadow-sm">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-primary-600">
        Suivi en temps réel
      </span>

      {/* Tracking number */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white p-3 shadow-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-neutral-400">
            Tracking
          </div>
          <div className="font-mono text-[13px] font-bold text-neutral-900">
            SRC-2026-04812
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1">
          <Truck className="h-3 w-3 text-primary-600" strokeWidth={2.5} />
          <span className="text-[10.5px] font-semibold text-primary-700">
            En transit
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative mt-5">
        {/* Vertical connector line */}
        <div className="absolute left-[10px] top-2 bottom-2 w-px bg-neutral-200" />
        <motion.div
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 0 }}
          className="absolute left-[10px] top-2 bottom-2 w-px bg-primary-500"
        />

        <ul className="relative space-y-3">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.label}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <span
                className={cn(
                  "relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white shadow",
                  step.done
                    ? "bg-primary-500"
                    : "bg-white ring-1 ring-neutral-200"
                )}
              >
                {step.done && (
                  <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
                )}
                {step.active && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary-400 opacity-75" />
                )}
              </span>
              <div className="flex-1">
                <div
                  className={cn(
                    "text-[12.5px] font-semibold",
                    step.done ? "text-neutral-900" : "text-neutral-400"
                  )}
                >
                  {step.label}
                </div>
              </div>
              <span
                className={cn(
                  "font-mono text-[10.5px]",
                  step.done ? "text-primary-600" : "text-neutral-400"
                )}
              >
                {step.date}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
