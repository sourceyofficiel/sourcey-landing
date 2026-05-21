"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Volume2, VolumeX, Ship } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Hero centered. Two-color headline split via inline span (first chunk in
 * primary blue, rest in neutral-900). Heavy display typography, narrow
 * subtitle column, dual CTAs centered.
 *
 * Below the CTAs: une vidéo cinématique d'un cargo ship aérien (Pexels,
 * libre de droits) qui raconte concrètement le métier : Sourcey gère
 * l'acheminement de tes produits depuis la Chine.
 *
 * Pour remplacer par ta propre vidéo : héberge-la dans /public/videos/
 * et change l'URL `src` dans <HeroVideo />.
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
        Tu nous dis ce que tu veux{" "}
        <span className="italic text-primary-600">vendre.</span>
        <br className="hidden md:block" /> On trouve le fournisseur,{" "}
        <span className="italic">on gère tout.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-6 max-w-[620px] text-[15.5px] leading-relaxed text-neutral-500 md:text-[17px]"
      >
        Tu décris ton idée de produit, notre équipe française contacte et
        négocie avec les fournisseurs pour toi. Tout se passe sur WhatsApp,
        comme un pote — sauf que ton pote sait sourcer.
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
          href="/#how-it-works"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[14.5px] font-semibold text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300"
        >
          Comment ça marche
        </Link>
      </motion.div>

      {/* Reassurance line under the CTAs */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-4 text-[12.5px] text-neutral-400"
      >
        Sans carte bancaire&nbsp;·&nbsp; Annulable à tout moment&nbsp;·&nbsp;
        Contact WhatsApp sous 24h
      </motion.p>

      {/* === Hero Video — cargo ship aérien === */}
      <HeroVideo />
    </section>
  );
}

/* ============================================================
   HERO VIDEO — cargo ship aérien (Pexels, libre de droits)
   ============================================================ */

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    if (!videoRef.current) return;
    const next = !muted;
    videoRef.current.muted = next;
    setMuted(next);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto mt-16 max-w-[1100px] md:mt-20"
    >
      {/* Soft blue glow halo derrière la vidéo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-x-10 -bottom-10 -top-10 -z-10"
      >
        <div className="absolute left-1/2 top-1/2 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/20 blur-[100px]" />
        <div className="absolute left-[20%] top-[10%] h-[40%] w-[40%] rounded-full bg-primary-400/15 blur-[80px]" />
        <div className="absolute right-[15%] bottom-[5%] h-[30%] w-[40%] rounded-full bg-primary-300/20 blur-[90px]" />
      </div>

      {/* Video frame */}
      <div
        className="relative overflow-hidden rounded-[20px] border border-neutral-200 bg-neutral-900 md:rounded-[28px]"
        style={{
          boxShadow: [
            "0 50px 100px -20px rgba(15, 23, 42, 0.25)",
            "0 30px 60px -30px rgba(37, 99, 235, 0.35)",
            "0 0 0 1px rgba(15, 23, 42, 0.06)",
            "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          ].join(", "),
        }}
      >
        <div className="relative aspect-[16/9] w-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.pexels.com/videos/4434242/cargo-container-shipping-export-4434242.jpeg?auto=compress&cs=tinysrgb&w=1280"
            className="absolute inset-0 h-full w-full object-cover"
          >
            {/*
              Pexels — Aerial view of cargo ship, libre de droits.
              Pour remplacer par ta propre vidéo :
                1. mets ton fichier dans /public/videos/hero.mp4
                2. remplace src par "/videos/hero.mp4"
            */}
            <source
              src="https://videos.pexels.com/video-files/4434242/4434242-hd_1920_1080_30fps.mp4"
              type="video/mp4"
            />
            <source
              src="https://videos.pexels.com/video-files/4434242/4434242-uhd_2560_1440_30fps.mp4"
              type="video/mp4"
            />
            Ton navigateur ne supporte pas la lecture vidéo HTML5.
          </video>

          {/* Overlay gradient pour la lisibilité du label en bas */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"
          />

          {/* Label en bas à gauche */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 md:bottom-6 md:left-6 md:right-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[11.5px] font-bold text-neutral-900 backdrop-blur-sm md:text-[12.5px]">
              <Ship className="h-3 w-3 text-primary-600 md:h-3.5 md:w-3.5" />
              On gère ton acheminement depuis la Chine
            </div>

            {/* Mute toggle */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Activer le son" : "Couper le son"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-neutral-700 backdrop-blur-sm transition-colors hover:bg-white md:h-9 md:w-9"
            >
              {muted ? (
                <VolumeX className="h-3.5 w-3.5 md:h-4 md:w-4" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              )}
            </button>
          </div>

          {/* LIVE dot top-right */}
          <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 backdrop-blur-sm md:right-6 md:top-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-white md:text-[10px]">
              Cargo en route
            </span>
          </div>
        </div>
      </div>

      {/* Reflection / floor glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-10 -bottom-6 h-12 rounded-full bg-primary-600/10 blur-2xl"
      />
    </motion.div>
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
        On te contacte sur WhatsApp en{" "}
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
