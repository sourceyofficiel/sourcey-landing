"use client";

import { motion } from "motion/react";
import { Sparkles, Video, Camera, Box, Globe } from "lucide-react";

/**
 * V2Features — Features grid in the style of Checkit / Linear.
 *
 * Layout : 2 large cards on top row, 3 smaller cards on bottom row.
 * Each card pairs an illustrated visual (custom inline SVG mock) with a
 * title + description. Visuals lean on the Sourcey blue palette and
 * neutral grays for a clean, premium SaaS feel.
 */

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export function V2Features() {
  return (
    <section
      id="features"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
    >
      {/* Section label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-4 flex justify-center"
      >
        <span className="inline-flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-primary-600">
          <span className="h-3 w-px bg-primary-400" />
          Fonctionnalités
          <span className="h-3 w-px bg-primary-400" />
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Tout ce qu'il faut pour sourcer en Chine,
        <br className="hidden md:block" />{" "}
        <span className="text-primary-600">sans y mettre les pieds.</span>
      </motion.h2>

      {/* Grid */}
      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6 md:gap-5"
      >
        {/* === Top row : 2 large cards === */}
        <FeatureCard
          variants={fadeInUp}
          className="md:col-span-3"
          icon={Sparkles}
          title="Match IA en 5 secondes"
          description="Décris ton produit en français — notre IA identifie l'agent francophone le plus pertinent en Chine selon sa spécialité, sa ville et son historique. Plus de recherche infinie sur Alibaba."
          visual={<MatchIAVisual />}
        />

        <FeatureCard
          variants={fadeInUp}
          className="md:col-span-3"
          icon={Box}
          title="Catalogue déjà négocié"
          description="15+ produits pré-vérifiés par nos agents avec prix usine négociés, MOQ raisonnable et délais maîtrisés. Tu commandes, on s'occupe du reste."
          visual={<CatalogVisual />}
        />

        {/* === Bottom row : 3 smaller cards === */}
        <FeatureCard
          variants={fadeInUp}
          className="md:col-span-2"
          icon={Video}
          title="Contrôle qualité vidéo"
          description="Avant l'expédition, ton agent filme ton produit, teste le packaging, vérifie les défauts. Tu valides avant de payer."
          visual={<VideoQCVisual />}
        />

        <FeatureCard
          variants={fadeInUp}
          className="md:col-span-2"
          icon={Globe}
          title="Agents francophones sur place"
          description="Guangzhou, Shenzhen, Yiwu, Shanghai... Notre réseau couvre les principaux hubs industriels chinois."
          visual={<AgentsVisual />}
        />

        <FeatureCard
          variants={fadeInUp}
          className="md:col-span-2"
          icon={Camera}
          title="Services premium DTC"
          description="Photoshoot produit, packaging custom, design logo. Tout ce qu'il faut pour lancer ta marque proprement."
          visual={<ServicesVisual />}
        />
      </motion.div>
    </section>
  );
}

/* ============================================================
   FEATURE CARD WRAPPER
   ============================================================ */

type FeatureCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  visual: React.ReactNode;
  variants: typeof fadeInUp;
  className?: string;
};

function FeatureCard({
  icon: Icon,
  title,
  description,
  visual,
  variants,
  className = "",
}: FeatureCardProps) {
  return (
    <motion.article
      variants={variants}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-[0_24px_60px_-30px_rgba(37,99,235,0.25)] ${className}`}
    >
      {/* Visual area */}
      <div className="relative h-[220px] overflow-hidden bg-gradient-to-b from-neutral-50 to-white">
        {visual}
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col gap-2 p-6 md:p-7">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-[17px] font-bold tracking-tight text-neutral-900">
            {title}
          </h3>
        </div>
        <p className="text-[14px] leading-relaxed text-neutral-500">
          {description}
        </p>
      </div>
    </motion.article>
  );
}

/* ============================================================
   VISUAL MOCKS — inline SVG/HTML illustrations
   ============================================================ */

function MatchIAVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8">
      <div className="relative w-full max-w-[340px]">
        {/* Input field at the top */}
        <div className="relative flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-primary-500" />
          <div className="text-[12px] text-neutral-400">
            Coque iPhone bio compostable...
          </div>
          <div className="ml-auto rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
            Match
          </div>
        </div>

        {/* Agent results below — staggered cards */}
        <div className="mt-3 space-y-2">
          {[
            { name: "Chen Mei", city: "Guangzhou", score: 94, accent: "#FECACA" },
            { name: "Wang Jun", city: "Shenzhen", score: 88, accent: "#FED7AA" },
            { name: "Li Wei", city: "Yiwu", score: 81, accent: "#BFDBFE" },
          ].map((agent, i) => (
            <div
              key={agent.name}
              className="flex items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 shadow-sm"
              style={{
                transform: `translateX(${i * 6}px)`,
                opacity: 1 - i * 0.18,
              }}
            >
              <span
                className="h-6 w-6 shrink-0 rounded-full"
                style={{ background: agent.accent }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[11.5px] font-semibold text-neutral-900">
                  {agent.name}
                </div>
                <div className="text-[10px] text-neutral-500">{agent.city}</div>
              </div>
              <div className="rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-600">
                {agent.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatalogVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-8">
      <div className="relative h-[180px] w-full max-w-[340px]">
        {/* Stacked product cards */}
        {[
          { offset: 0, rotate: -4, opacity: 0.4, title: "T-shirt premium 220g" },
          { offset: 12, rotate: -1, opacity: 0.7, title: "Tote bag toile lourde" },
          { offset: 24, rotate: 2, opacity: 1, title: "Hoodie unisexe 380g" },
        ].map((card, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0 w-[230px] rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)]"
            style={{
              transform: `translateX(calc(-50% + ${card.offset}px)) translateY(${i * 8}px) rotate(${card.rotate}deg)`,
              opacity: card.opacity,
              zIndex: i,
            }}
          >
            {/* Image placeholder */}
            <div className="aspect-[4/3] w-full rounded-lg bg-gradient-to-br from-primary-50 via-neutral-100 to-neutral-50" />
            {/* Text */}
            <div className="mt-2.5 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-neutral-900 truncate">
                  {card.title}
                </div>
                <div className="text-[10px] text-neutral-500">à partir de 2,40€</div>
              </div>
              <div className="rounded-md bg-primary-600 px-2 py-0.5 text-[9.5px] font-bold text-white">
                Vetted
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoQCVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <div className="relative w-full max-w-[240px]">
        {/* Video player frame */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-br from-neutral-800 to-neutral-900 shadow-xl">
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-lg">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-primary-600 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Timeline at bottom */}
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
              <div className="h-full w-2/3 bg-white" />
            </div>
            <div className="text-[9px] font-mono text-white/80">02:14</div>
          </div>

          {/* Rec dot top right */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md bg-red-500/90 px-1.5 py-0.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            <span className="text-[9px] font-bold text-white">LIVE QC</span>
          </div>
        </div>

        {/* Below: status check */}
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 shadow-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" className="h-3 w-3 stroke-green-600 stroke-[3]" fill="none">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[11px] font-semibold text-neutral-700">
            Validé par Chen Mei
          </span>
        </div>
      </div>
    </div>
  );
}

function AgentsVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[200px] w-[280px]">
        {/* Orbit rings */}
        {[120, 80, 40].map((r, i) => (
          <div
            key={r}
            className="absolute left-1/2 top-1/2 rounded-full border border-dashed border-primary-200/60"
            style={{
              width: r * 2,
              height: r * 2,
              transform: "translate(-50%, -50%)",
              opacity: 0.5 + i * 0.15,
            }}
          />
        ))}

        {/* Center logo */}
        <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg">
          <Globe className="h-5 w-5 text-white" />
        </div>

        {/* City pins on the orbit */}
        {[
          { city: "Guangzhou", x: 100, y: -20, color: "#FECACA" },
          { city: "Shenzhen", x: 60, y: 90, color: "#FED7AA" },
          { city: "Yiwu", x: -90, y: 60, color: "#BFDBFE" },
          { city: "Shanghai", x: -80, y: -50, color: "#DDD6FE" },
          { city: "Ningbo", x: 20, y: -100, color: "#A7F3D0" },
        ].map((pin) => (
          <div
            key={pin.city}
            className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1"
            style={{
              transform: `translate(calc(-50% + ${pin.x}px), calc(-50% + ${pin.y}px))`,
            }}
          >
            <span
              className="h-5 w-5 rounded-full border-2 border-white shadow-md"
              style={{ background: pin.color }}
            />
            <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[9px] font-semibold text-neutral-700 shadow-sm backdrop-blur-sm">
              {pin.city}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-[180px] w-[260px]">
        {/* Desktop frame in background */}
        <div className="absolute left-2 top-4 h-[140px] w-[180px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md">
          <div className="h-3 border-b border-neutral-100 bg-neutral-50" />
          <div className="space-y-2 p-3">
            <div className="aspect-[4/3] w-full rounded-md bg-gradient-to-br from-primary-100 via-neutral-100 to-primary-50" />
            <div className="h-1.5 w-3/4 rounded bg-neutral-200" />
            <div className="h-1.5 w-1/2 rounded bg-neutral-200" />
          </div>
        </div>

        {/* Mobile frame in foreground */}
        <div className="absolute right-0 top-0 h-[170px] w-[90px] overflow-hidden rounded-2xl border-2 border-neutral-900 bg-white shadow-xl">
          <div className="space-y-1.5 p-2 pt-3">
            <div className="aspect-square w-full rounded-md bg-gradient-to-br from-primary-200 via-primary-100 to-white" />
            <div className="h-1 w-2/3 rounded bg-neutral-200" />
            <div className="h-1 w-1/2 rounded bg-neutral-200" />
            <div className="mt-2 h-4 w-full rounded bg-primary-600" />
          </div>
        </div>

        {/* Badge floating */}
        <div className="absolute -bottom-2 left-12 rounded-full border border-neutral-200/80 bg-white px-3 py-1.5 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-semibold text-neutral-700">
              Photoshoot · Packaging · Logo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
