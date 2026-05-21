"use client";

import { motion } from "motion/react";
import { FileText, MessageSquare, Package, type LucideIcon } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * V2Solution — "Comment ça marche" en 3 étapes.
 *
 * — Mobile : layout vertical avec des courbes SVG serpentine entre les steps
 * — Desktop : layout horizontal (grid 3 colonnes) avec des arcs élégants
 *   qui connectent les icon blocks, plus un dot qui flow le long du tracé
 *   pour l'effet "data circulant".
 */

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  description: string;
  duration: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: FileText,
    title: "Tu remplis ton brief",
    description:
      "Tu décris ce que tu veux vendre : type de produit, MOQ, budget, délais. Un formulaire en 2 minutes depuis ton compte Sourcey.",
    duration: "2 min",
  },
  {
    n: "02",
    icon: MessageSquare,
    title: "On t'appelle sur WhatsApp",
    description:
      "Notre équipe française te contacte sous 24h. On affine ton besoin, on cherche les fournisseurs, on négocie en coulisses. Tu restes anonyme.",
    duration: "24h",
  },
  {
    n: "03",
    icon: Package,
    title: "Tu reçois ton devis",
    description:
      "Quand on a négocié, on te renvoie le meilleur prix sur WhatsApp. Tu valides, on commande pour toi. On gère la relation fournisseur sur la durée.",
    duration: "3-7 jours",
  },
];

export function V2Solution() {
  return (
    <section
      id="how-it-works"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
    >
      <V2SectionLabel>Comment ça marche</V2SectionLabel>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Du brief au colis livré chez toi,
        <br className="hidden md:block" />{" "}
        <span className="italic text-primary-600">en 3 étapes.</span>
      </motion.h2>

      {/* === MOBILE: vertical layout === */}
      <MobileFlow />

      {/* === DESKTOP: horizontal layout === */}
      <DesktopFlow />
    </section>
  );
}

/* ============================================================
   MOBILE — vertical with serpentine S-curves
   ============================================================ */

function MobileFlow() {
  return (
    <div className="relative mx-auto mt-16 flex max-w-[480px] flex-col items-center md:hidden">
      {STEPS.map((step, i) => (
        <div
          key={step.n}
          className="relative flex w-full flex-col items-center"
          // Earlier wrappers get higher z-index so their arc paints ABOVE
          // the next step's icon halo (which would otherwise hide the arrow).
          style={{ zIndex: STEPS.length - i }}
        >
          <StepCard step={step} index={i} />
          {i < STEPS.length - 1 && (
            <VerticalArc direction={i % 2 === 0 ? "left" : "right"} index={i} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   DESKTOP — 3 cards in a row with arcing arrows between
   ============================================================ */

function DesktopFlow() {
  return (
    <div className="relative mx-auto mt-24 hidden max-w-[1400px] md:block">
      <div className="relative">
        {/* SVG arcs OVERLAY positioned to span between icon centers */}
        <HorizontalArcsOverlay />

        {/* 3 cards in a clean grid */}
        <div className="relative grid grid-cols-3 items-start gap-0">
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className="flex flex-col items-center px-6 text-center"
            >
              <StepCard step={step} index={i} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STEP CARD — used on both mobile and desktop
   ============================================================ */

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex flex-col items-center text-center"
    >
      {/* Glow halo */}
      <div className="relative">
        <div
          aria-hidden
          className="absolute inset-0 -m-4 rounded-[28px] bg-primary-400/30 blur-xl"
        />

        {/* Icon block */}
        <div
          className="relative flex h-[88px] w-[88px] items-center justify-center rounded-[22px] bg-gradient-to-b from-primary-500 to-primary-700"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "inset 0 -2px 0 rgba(15,40,100,0.4)",
              "0 12px 30px -6px rgba(37,99,235,0.55)",
              "0 4px 8px -2px rgba(15,23,42,0.18)",
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-[22px] bg-gradient-to-b from-white/30 to-transparent"
          />
          <Icon className="relative h-9 w-9 text-white" strokeWidth={2} />
        </div>

        {/* Step number badge */}
        <div className="absolute -right-2.5 -top-2.5 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-neutral-900 text-[11px] font-bold text-white shadow-md">
          {step.n}
        </div>
      </div>

      <h3 className="mt-7 text-[18px] font-bold tracking-tight text-neutral-900 md:text-[20px]">
        {step.title}
      </h3>

      <p className="mt-3 max-w-[320px] text-[14px] leading-relaxed text-neutral-500">
        {step.description}
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 text-[12px] font-semibold text-primary-700">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
        {step.duration}
      </div>
    </motion.div>
  );
}

/* ============================================================
   VERTICAL ARC — mobile (gentle curve between cards)
   Simple, no glow, no traveling dot, just a clean line + arrow.
   ============================================================ */

function VerticalArc({
  direction,
  index,
}: {
  direction: "left" | "right";
  index: number;
}) {
  // S-curve qui termine dans le GAP entre les deux step cards (pas dans
  // la zone du halo de l'icon suivant). L'arrow head est dessinée comme
  // un <polygon> séparé pour qu'elle reste visible quelle que soit
  // l'animation du tracé (les markers SVG sont parfois capricieux avec
  // l'animation de pathLength dans certains navigateurs mobiles).
  const path =
    direction === "left"
      ? "M 160 6 C 10 55, 10 130, 160 178"
      : "M 160 6 C 310 55, 310 130, 160 178";

  // Tangent direction at endpoint (160, 178) :
  //   left  : (160-10, 178-130) = (150, 48), arrow points down-right
  //   right : (160-310, 178-130) = (-150, 48), arrow points down-left
  // Normalized then rotated 90° for the perpendicular base of the triangle.
  const tipX = 160;
  const tipY = 178;
  const dx = direction === "left" ? 150 : -150;
  const dy = 48;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  // perpendiculaire
  const px = -uy;
  const py = ux;
  const arrowLen = 16;
  const arrowHalfWidth = 8;
  const baseX = tipX - ux * arrowLen;
  const baseY = tipY - uy * arrowLen;
  const leftX = baseX + px * arrowHalfWidth;
  const leftY = baseY + py * arrowHalfWidth;
  const rightX = baseX - px * arrowHalfWidth;
  const rightY = baseY - py * arrowHalfWidth;

  return (
    <div className="pointer-events-none relative -my-6 h-[200px] w-full max-w-[340px]">
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        fill="none"
        style={{ overflow: "visible" }}
      >
        {/* Main thick stroke — solid blue */}
        <motion.path
          d={path}
          stroke="#2563EB"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{
            pathLength: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.3 },
          }}
        />

        {/* Inner accent line (lighter blue, thinner) — double-line doodle feel */}
        <motion.path
          d={path}
          stroke="#60A5FA"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.7"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.7 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{
            pathLength: { duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.3, delay: 0.15 },
          }}
        />

        {/* Arrow head — drawn as an explicit polygon so it is always
            visible regardless of the path animation. Fades in just after
            the line finishes drawing. */}
        <motion.polygon
          points={`${tipX},${tipY} ${leftX.toFixed(2)},${leftY.toFixed(2)} ${rightX.toFixed(2)},${rightY.toFixed(2)}`}
          fill="#2563EB"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{
            duration: 0.35,
            delay: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: `${tipX}px ${tipY}px`, transformBox: "fill-box" }}
        />
      </svg>
    </div>
  );
}

/* ============================================================
   HORIZONTAL ARROWS OVERLAY — desktop (straight arrows between 3 cards)
   Simple thin line + dashed pattern + small arrow head.
   ============================================================ */

function HorizontalArcsOverlay() {
  /*
    ViewBox: 1100 x 100
    Icon centers x: 183, 550, 916
    Icon radius: 44
    Arrows go straight from edge of icon N to edge of icon N+1 at y=44.
  */

  const arc1 = "M 232 44 L 501 44";
  const arc2 = "M 599 44 L 867 44";

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[100px] w-full"
      viewBox="0 0 1100 100"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <marker
          id="h-arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 Z" fill="#3B82F6" />
        </marker>
      </defs>

      {/* Arc 1 */}
      <motion.path
        d={arc1}
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 6"
        markerEnd="url(#h-arrow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{
          pathLength: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.3 },
        }}
      />

      {/* Arc 2 */}
      <motion.path
        d={arc2}
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 6"
        markerEnd="url(#h-arrow)"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{
          pathLength: {
            duration: 0.8,
            delay: 0.3,
            ease: [0.22, 1, 0.36, 1],
          },
          opacity: { duration: 0.3, delay: 0.3 },
        }}
      />
    </svg>
  );
}
