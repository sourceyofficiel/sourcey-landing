"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { FEATURES, type Feature } from "@/lib/features-data";

// react-countup → SSR off pour éviter les mismatchs d'hydration
const CountUp = dynamic(() => import("react-countup"), { ssr: false });

/* ============================================================
   V2Features — recap des 6 fonctionnalités (alignées sur la navbar)
   en layout case-study alternant gauche/droite.

   Chaque row :
     - À gauche (ou droite) : icône colorée géante + récap (titre,
       paragraphe, CTA → /features/<slug>)
     - À l'autre côté : 2 métriques clés animées au scroll

   Source unique des features : src/lib/features-data.ts (même que
   le dropdown nav, garantit la cohérence)
   ============================================================ */

/** Récap court + métriques propres à chaque feature de la home */
type FeatureRecap = {
  slug: string;
  /** Couleur de l'icône + accents (Tailwind class du gradient) */
  accentFrom: string;
  accentTo: string;
  textAccent: string;
  /** Récap 1 phrase (titre) */
  recapTitle: string;
  /** Paragraphe 2-3 lignes */
  recapBody: string;
  metrics: { value: string; label: string; sub?: string }[];
};

const RECAPS: Record<string, Omit<FeatureRecap, "slug">> = {
  sourcing: {
    accentFrom: "from-primary-400",
    accentTo: "to-primary-600",
    textAccent: "text-primary-600",
    recapTitle: "On vérifie chaque usine sur place avant de te la présenter",
    recapBody:
      "Notre équipe terrain en Chine visite physiquement les fabricants, contrôle leurs licences, capacités et historiques d'export. Tu reçois 3-5 options comparées sur prix, MOQ, délais et certifications.",
    metrics: [
      { value: "3-5", label: "Options par brief", sub: "Toutes vérifiées sur place" },
      { value: "200+", label: "Usines partenaires", sub: "Carnet d'adresses Sourcey" },
    ],
  },
  negociation: {
    accentFrom: "from-primary-400",
    accentTo: "to-primary-600",
    textAccent: "text-primary-600",
    recapTitle: "On négocie en mandarin, tu obtiens des prix inaccessibles seul",
    recapBody:
      "Notre équipe basée en Asie engage les négociations en chinois natif. Tu n'as ni à parler à l'usine, ni à improviser. On joue plusieurs candidats les uns contre les autres pour obtenir le meilleur deal.",
    metrics: [
      { value: "-30%", label: "Prix moyen négocié", sub: "vs. tarif annoncé MOQ public" },
      { value: "100%", label: "Négociation en mandarin", sub: "Par notre équipe terrain" },
    ],
  },
  "controle-qualite": {
    accentFrom: "from-primary-400",
    accentTo: "to-primary-600",
    textAccent: "text-primary-600",
    recapTitle: "On inspecte chaque lot avant que ça parte",
    recapBody:
      "Un agent indépendant inspecte ta production sur place selon la norme AQL 2.5. Tu reçois un rapport photo + vidéo détaillé. Si défauts, l'usine reprend sans surcoût — clause négociée à l'avance.",
    metrics: [
      { value: "200", label: "Critères vérifiés", sub: "Par lot, selon AQL 2.5", suffix: "+" },
      { value: "24", label: "Heures après visite", sub: "Délai du rapport complet", suffix: "h" },
    ].map((m) => ({ value: `${m.value}${m.suffix ?? ""}`, label: m.label, sub: m.sub })),
  },
  expedition: {
    accentFrom: "from-primary-400",
    accentTo: "to-primary-600",
    textAccent: "text-primary-600",
    recapTitle: "Air, mer, express — on choisit le bon mode et on gère la douane",
    recapBody:
      "Selon ton volume et ton urgence, on optimise le mode de transport (express 5-7j, aérien 8-12j, maritime 35-45j). Dédouanement, taxes et assurance gérés pour toi en DDP.",
    metrics: [
      { value: "5-45", label: "Jours selon mode", sub: "Express / aérien / maritime" },
      { value: "DDP", label: "Tu reçois sans surcoûts", sub: "Douane et taxes incluses" },
    ],
  },
  "suivi-colis": {
    accentFrom: "from-primary-400",
    accentTo: "to-primary-600",
    textAccent: "text-primary-600",
    recapTitle: "Tu sais où en est ta commande à chaque instant",
    recapBody:
      "Notifications WhatsApp à chaque jalon (production, inspection, expédition, livraison) + tracking transporteur intégré dans ton dashboard Sourcey. Plus jamais à courir après l'usine.",
    metrics: [
      { value: "8", label: "Jalons trackés", sub: "Du brief à la réception" },
      { value: "100%", label: "Visibilité temps réel", sub: "Dashboard + WhatsApp" },
    ],
  },
  "relation-fournisseur": {
    accentFrom: "from-primary-400",
    accentTo: "to-primary-600",
    textAccent: "text-primary-600",
    recapTitle: "Un account manager dédié qui connaît tes produits",
    recapBody:
      "Pas de ticket support qui change de main. Ton AM Sourcey suit tes commandes sur la durée, anticipe les réassorts, ajuste les détails. Le 5e produit te prend 3x moins de temps que le 1er.",
    metrics: [
      { value: "1", label: "Account manager dédié", sub: "Tu connais son prénom" },
      { value: "2", label: "Clics pour réassort", sub: "Sur tes produits connus", suffix: " clics" },
    ].map((m) => ({ value: `${m.value}${m.suffix ?? ""}`, label: m.label, sub: m.sub })),
  },
};

/* ============================================================
   COMPONENT PRINCIPAL
   ============================================================ */

export function V2Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
      aria-labelledby="features-heading"
    >
      {/* Header */}
      <div className="mx-auto max-w-[760px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-primary-700 ring-1 ring-inset ring-primary-100"
        >
          Fonctionnalités
        </motion.div>
        <motion.h2
          id="features-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
        >
          Tout ce qu&apos;on fait{" "}
          <span className="text-primary-600">pour toi.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]"
        >
          Six piliers couvrent l&apos;intégralité de ton parcours sourcing.
          Clique sur une fonctionnalité pour voir le détail complet.
        </motion.p>
      </div>

      {/* 6 features — cards compactes sur mobile, alternées L/R sur desktop */}
      <div className="mt-12 flex flex-col gap-8 md:mt-16 md:gap-12 lg:mt-20 lg:gap-20">
        {FEATURES.map((feature, idx) => {
          const recap = RECAPS[feature.slug];
          if (!recap) return null;
          return (
            <FeatureRow
              key={feature.slug}
              feature={feature}
              recap={recap}
              reversed={idx % 2 === 1}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   ROW — un feature en case-study
   ============================================================ */

function FeatureRow({
  feature,
  recap,
  reversed,
}: {
  feature: Feature;
  recap: Omit<FeatureRecap, "slug">;
  reversed: boolean;
}) {
  const Icon = feature.icon as LucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-8 lg:grid lg:grid-cols-3 lg:items-center lg:gap-16 lg:rounded-none lg:border-0 lg:border-b lg:bg-transparent lg:p-0 lg:pb-20 lg:shadow-none lg:last:border-b-0 lg:last:pb-0"
    >
      {/* === Side récap (icône + texte) === */}
      <div
        className={[
          "flex flex-col gap-5 md:gap-6 lg:col-span-2",
          reversed
            ? "lg:order-2 lg:border-l lg:border-neutral-200 lg:pl-12 xl:pl-16"
            : "lg:border-r lg:border-neutral-200 lg:pr-12 xl:pr-16",
        ].join(" ")}
      >
        <div className="flex items-start gap-4 sm:gap-5 lg:flex-col lg:gap-6 xl:flex-row xl:gap-8">
          {/* Icon block — petit sur mobile, gros sur desktop */}
          <div
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br md:h-16 md:w-16 md:rounded-[20px] lg:h-32 lg:w-32 lg:rounded-3xl ${recap.accentFrom} ${recap.accentTo}`}
            style={{
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.35)",
                "inset 0 -2px 0 rgba(0,0,0,0.15)",
                "0 10px 24px -8px rgba(37,99,235,0.45)",
              ].join(", "),
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/30 to-transparent md:rounded-t-[20px] lg:rounded-t-3xl"
            />
            <Icon
              className="relative h-6 w-6 text-white md:h-7 md:w-7 lg:h-12 lg:w-12"
              strokeWidth={1.8}
            />
          </div>

          {/* Textual recap */}
          <div className="min-w-0 flex-1">
            <div
              className={`text-[10.5px] font-bold uppercase tracking-wider md:text-[11.5px] ${recap.textAccent}`}
            >
              {feature.eyebrow}
            </div>
            <h3 className="mt-1.5 font-display text-[16px] font-extrabold leading-tight tracking-tight text-neutral-900 md:mt-2 md:text-[18px] lg:text-[24px]">
              {recap.recapTitle}
            </h3>
          </div>
        </div>

        {/* Body — pleine largeur sous le bloc icône+titre */}
        <p className="text-[13px] leading-relaxed text-neutral-600 md:text-[14px] lg:text-[14.5px]">
          {recap.recapBody}
        </p>
        <Link
          href={`/features/${feature.slug}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900 transition-colors hover:text-primary-700"
        >
          Voir le détail
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* === Side métriques === */}
      <div
        className={[
          "mt-6 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-5 md:gap-6 md:pt-6",
          "lg:mt-0 lg:grid-cols-1 lg:gap-8 lg:self-center lg:border-t-0 lg:pt-0",
          reversed ? "lg:order-1" : "",
        ].join(" ")}
      >
        {recap.metrics.map((m, i) => (
          <MetricStat
            key={`${feature.slug}-${i}`}
            value={m.value}
            label={m.label}
            sub={m.sub}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ============================================================
   METRIC STAT — un compteur animé
   ============================================================ */

function MetricStat({
  value,
  label,
  sub,
  duration = 1.6,
}: {
  value: string;
  label: string;
  sub?: string;
  duration?: number;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const { prefix, end, suffix, decimals, isNumeric } = parseMetricValue(value);

  return (
    <div className="flex flex-col gap-1.5 text-left md:gap-2">
      <p
        className="font-display text-[22px] font-extrabold leading-none text-neutral-900 md:text-[28px] lg:text-[36px]"
        aria-label={`${label} ${value}`}
      >
        {isNumeric ? (
          <>
            {prefix}
            {reduceMotion ? (
              <span>
                {end.toLocaleString("fr-FR", {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                })}
              </span>
            ) : (
              <CountUp
                end={end}
                decimals={decimals}
                duration={duration}
                separator=" "
                enableScrollSpy
                scrollSpyOnce
              />
            )}
            {suffix}
          </>
        ) : (
          value
        )}
      </p>
      <p className="text-[12.5px] font-semibold text-neutral-900 md:text-[14px]">
        {label}
      </p>
      {sub && (
        <p className="text-[11px] text-neutral-500 md:text-[12.5px]">{sub}</p>
      )}
    </div>
  );
}

/* ============================================================
   HELPERS
   ============================================================ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/** Parse "98%", "3.5x", "-30%", "8", "DDP" — distingue numérique vs texte */
function parseMetricValue(raw: string) {
  const value = (raw ?? "").toString().trim();
  const m = value.match(
    /^([^\d\-+]*?)\s*([\-+]?\d{1,3}(?:[\s,]\d{3})*(?:\.\d+)?)\s*([^\d\s]*)$/
  );
  if (!m) {
    // Pas de chiffre → on affiche brut (ex: "DDP")
    return { prefix: "", end: 0, suffix: value, decimals: 0, isNumeric: false };
  }
  const [, prefix, num, suffix] = m;
  const normalized = num.replace(/[\s,]/g, "");
  const end = parseFloat(normalized);
  const decimals = normalized.split(".")[1]?.length ?? 0;
  return {
    prefix: prefix ?? "",
    end: isNaN(end) ? 0 : end,
    suffix: suffix ?? "",
    decimals,
    isNumeric: true,
  };
}
