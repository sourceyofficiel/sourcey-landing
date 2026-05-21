"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { FileText, MessageSquare, Package, type LucideIcon } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";
import { cn } from "@/lib/utils";

/**
 * V2Solution — "Comment ça marche" en 3 étapes.
 *
 * — Mobile : carrousel horizontal swipeable (scroll-snap natif) avec dots
 *   en bas pour la navigation tactile/clic.
 * — Desktop : layout horizontal (grid 3 colonnes) avec flèches dashed
 *   entre les icon blocks.
 */

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: FileText,
    title: "Soumets ton brief",
    description:
      "Décris ton projet en détail : catégorie de produit, quantités cibles, budget et délais. Notre formulaire structuré te prend moins de 10 minutes.",
  },
  {
    n: "02",
    icon: MessageSquare,
    title: "Notre équipe prend le relais",
    description:
      "Un account manager francophone te contacte sous 24 heures pour qualifier ton besoin. Nous identifions les fournisseurs pertinents et engageons les négociations en mandarin pour ton compte.",
  },
  {
    n: "03",
    icon: Package,
    title: "Reçois ta proposition",
    description:
      "Devis complet avec prix négocié, conditions de production et délais d'expédition. Tu valides, nous orchestrons la commande et assurons le suivi jusqu'à livraison.",
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
   MOBILE — carrousel horizontal swipeable (scroll-snap natif)
   ============================================================ */

function MobileFlow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Track scroll position → met à jour les dots
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const onScroll = () => {
      const cardWidth = container.clientWidth;
      if (cardWidth === 0) return;
      const idx = Math.round(container.scrollLeft / cardWidth);
      setCurrentIdx(Math.max(0, Math.min(STEPS.length - 1, idx)));
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToIdx(idx: number) {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({
      left: container.clientWidth * idx,
      behavior: "smooth",
    });
  }

  return (
    <div className="md:hidden">
      {/* Carrousel scrollable horizontalement (snap-x) */}
      <div
        ref={scrollRef}
        className="-mx-5 mt-12 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollPaddingInline: "1.25rem" }}
      >
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            className="flex w-full shrink-0 snap-center justify-center px-5"
          >
            <StepCard step={step} index={i} />
          </div>
        ))}
      </div>

      {/* Dots de navigation */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {STEPS.map((s, i) => {
          const isActive = i === currentIdx;
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => scrollToIdx(i)}
              aria-label={`Aller à l'étape ${s.n}`}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isActive
                  ? "w-8 bg-primary-600"
                  : "w-2 bg-neutral-300 hover:bg-neutral-400"
              )}
            />
          );
        })}
      </div>

      {/* Compteur "X / 3" */}
      <div className="mt-3 text-center text-[11.5px] font-mono font-semibold text-neutral-400">
        {currentIdx + 1} / {STEPS.length}
      </div>
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
    </motion.div>
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

  const arrowMid1 = "M 232 44 L 501 44";
  const arrowMid2 = "M 599 44 L 867 44";

  const baseProps = {
    stroke: "#3B82F6",
    strokeWidth: "2",
    strokeLinecap: "round" as const,
    strokeDasharray: "6 6",
    markerEnd: "url(#h-arrow)",
  };

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

      {/* Arrow 1 → 2 */}
      <motion.path
        d={arrowMid1}
        {...baseProps}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{
          pathLength: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.3 },
        }}
      />

      {/* Arrow 2 → 3 */}
      <motion.path
        d={arrowMid2}
        {...baseProps}
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{
          pathLength: { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.3, delay: 0.3 },
        }}
      />
    </svg>
  );
}
