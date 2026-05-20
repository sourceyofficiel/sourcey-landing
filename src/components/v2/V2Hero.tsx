"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/**
 * Hero centered. Two-color headline split via inline span (first chunk in
 * primary blue, rest in neutral-900). Heavy display typography, narrow
 * subtitle column, dual CTAs centered.
 *
 * Below the CTAs: a "dashboard mockup" showcase à la Checkit / Linear —
 * rounded corners, soft blue-tinted shadow, subtle glow halo behind.
 */
export function V2Hero() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 pt-16 pb-24 text-center md:px-8 md:pt-24 md:pb-32">
      {/* Intro pill — stacked agent avatars + online indicator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex justify-center"
      >
        <AgentAvailabilityBadge />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.06] tracking-tight text-neutral-900"
      >
        Trouve ton produit en{" "}
        <span className="italic text-primary-600">Chine.</span>
        <br className="hidden md:block" /> Un agent humain s'occupe du{" "}
        <span className="italic">reste.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-6 max-w-[600px] text-[15.5px] leading-relaxed text-neutral-500 md:text-[17px]"
      >
        Notre agent francophone négocie tes prix usine, contrôle la qualité par
        vidéo et expédie chez toi en 10 jours. Tu choisis. On gère.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        <Link
          href="/signup"
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-6 py-3 text-[14.5px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:duration-75"
          style={{
            boxShadow: [
              // Inner top shine (light coming from above)
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              // Inner bottom lip (darker edge for depth)
              "inset 0 -2px 0 rgba(15,40,100,0.35)",
              // Glow halo (the blue diffuse aura)
              "0 14px 30px -8px rgba(37,99,235,0.6)",
              // Base ground shadow
              "0 4px 8px -2px rgba(15,23,42,0.18)",
              // Crisp 1px outer border darkening
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          {/* Top sheen — subtle gradient highlight on the top half */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/25 to-transparent"
          />
          <span className="relative">Essayer gratuitement</span>
          <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/catalog"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[14.5px] font-semibold text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300"
        >
          Voir le catalogue
        </Link>
      </motion.div>

      {/* Reassurance line under the CTAs */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-4 text-[12.5px] text-neutral-400"
      >
        Sans carte bancaire&nbsp;·&nbsp; Annulable à tout moment&nbsp;·&nbsp; Agent
        assigné sous 24h
      </motion.p>

      {/* === Dashboard Mockup Showcase === */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto mt-16 max-w-[1400px] md:mt-20"
      >
        {/* Soft blue glow halo behind the mockup */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-x-10 -bottom-10 -top-10 -z-10"
        >
          <div className="absolute left-1/2 top-1/2 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/20 blur-[100px]" />
          <div className="absolute left-[20%] top-[10%] h-[40%] w-[40%] rounded-full bg-primary-400/15 blur-[80px]" />
          <div className="absolute right-[15%] bottom-[5%] h-[30%] w-[40%] rounded-full bg-primary-300/20 blur-[90px]" />
        </div>

        {/* Mockup frame — rounded card with subtle browser chrome */}
        <div
          className="relative overflow-hidden rounded-[20px] border border-neutral-200 bg-white md:rounded-[28px]"
          style={{
            boxShadow: [
              // Outer ambient ground shadow
              "0 50px 100px -20px rgba(15, 23, 42, 0.18)",
              // Blue-tinted accent shadow (DA Sourcey)
              "0 30px 60px -30px rgba(37, 99, 235, 0.35)",
              // Crisp 1px border-ish outline
              "0 0 0 1px rgba(15, 23, 42, 0.04)",
              // Subtle inner top highlight
              "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
            ].join(", "),
          }}
        >
          {/* Browser chrome — subtle top bar with traffic lights */}
          <div className="flex h-8 items-center gap-1.5 border-b border-neutral-100 bg-neutral-50/80 px-4 md:h-10">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            <div className="ml-4 hidden h-5 flex-1 items-center justify-center rounded-md bg-white px-3 text-[11px] text-neutral-400 md:flex">
              app.sourcey.fr/app
            </div>
          </div>

          {/* Mockup image */}
          <div className="relative aspect-[16/9] w-full bg-neutral-50">
            {/*
              Mockup image. Currently an SVG placeholder that mimics the
              dashboard layout. Replace with a real screenshot at
              `/public/mockups/dashboard.png` and update the `src` below.
            */}
            <Image
              src="/mockups/dashboard.svg"
              alt="Aperçu du dashboard Sourcey — messagerie agents, commandes, services premium"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1100px) 90vw, 1100px"
              className="object-cover object-top"
            />

            {/* Subtle vignette to anchor the bottom edge */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/[0.04] to-transparent"
            />
          </div>
        </div>

        {/* Reflection / floor glow under the mockup */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-10 -bottom-6 h-12 rounded-full bg-primary-600/10 blur-2xl"
        />
      </motion.div>
    </section>
  );
}

/* ============================================================
   AGENT AVAILABILITY BADGE — stacked agent avatars (real photos)
   ============================================================ */

// 3 vraies photos de portraits chinois (Unsplash, libres de droits).
// À remplacer par les vraies photos de tes agents quand tu les as.
const AGENTS = [
  {
    name: "Chen Mei",
    src: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&crop=faces&q=80",
  },
  {
    name: "Wang Jun",
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=120&h=120&fit=crop&crop=faces&q=80",
  },
  {
    name: "Li Wei",
    src: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop&crop=faces&q=80",
  },
  {
    name: "Zhang Lin",
    src: "https://images.unsplash.com/photo-1587628604439-3b9a0aa7a163?w=120&h=120&fit=crop&crop=faces&q=80",
  },
  {
    name: "Liu Hao",
    src: "https://images.unsplash.com/photo-1542206395-9feb3edaa68d?w=120&h=120&fit=crop&crop=faces&q=80",
  },
];

function AgentAvailabilityBadge() {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-primary-200/60 bg-white py-1 pl-1 pr-4 text-[12.5px] font-medium text-neutral-700 shadow-sm">
      {/* Stacked agent avatars (3 overlapping circles) */}
      <div className="flex -space-x-2.5">
        {AGENTS.map((agent) => (
          <AgentAvatar
            key={agent.name}
            src={agent.src}
            name={agent.name}
          />
        ))}
      </div>

      <span className="leading-none">
        Un agent humain assigné en{" "}
        <strong className="font-bold text-neutral-900">24h</strong>
      </span>
    </div>
  );
}

function AgentAvatar({ src, name }: { src: string; name: string }) {
  return (
    <Image
      src={src}
      alt={name}
      width={56}
      height={56}
      className="h-7 w-7 rounded-full border-[2px] border-white object-cover shadow-sm"
    />
  );
}
