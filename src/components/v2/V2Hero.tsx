"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

/**
 * Hero full-bleed avec vidéo en background.
 *
 * — Vidéo cargo self-hosted dans /public/videos/hero.mp4
 * — Overlay sombre (gradient) pour la lisibilité du texte blanc
 * — Title + subtitle + CTAs + badge agents superposés au centre
 * — Mute toggle discret en bas à droite
 */
export function V2Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    if (!videoRef.current) return;
    const next = !muted;
    videoRef.current.muted = next;
    setMuted(next);
  }

  return (
    <section className="relative min-h-[88vh] w-full overflow-hidden">
      {/* === Vidéo en background === */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* === Overlay sombre pour lisibilité === */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-b from-black/55 via-black/45 to-black/70"
      />

      {/* === Fade vers le blanc en bas pour blend avec la section suivante === */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-white"
      />

      {/* === Contenu superposé === */}
      <div className="relative z-20 mx-auto flex min-h-[88vh] max-w-[1400px] flex-col items-center justify-center px-5 py-20 text-center md:px-8 md:py-28">
        {/* Badge agents disponibles */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <AgentAvailabilityBadge />
        </motion.div>

        {/* Titre (blanc) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.06] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
        >
          Tu nous dis ce que tu veux{" "}
          <span className="italic text-primary-300">vendre.</span>
          <br className="hidden md:block" /> On trouve le fournisseur,{" "}
          <span className="italic">on gère tout.</span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-[620px] text-[15.5px] leading-relaxed text-white/85 md:text-[17px]"
        >
          Tu décris ton idée de produit, notre équipe française contacte et
          négocie avec les fournisseurs pour toi. Tout se passe sur WhatsApp,
          comme un pote — sauf que ton pote sait sourcer.
        </motion.p>

        {/* CTAs */}
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
                "inset 0 1px 0 rgba(255,255,255,0.35)",
                "inset 0 -2px 0 rgba(15,40,100,0.35)",
                "0 14px 30px -8px rgba(37,99,235,0.6)",
                "0 4px 8px -2px rgba(15,23,42,0.18)",
                "0 0 0 1px rgba(29,78,216,0.45)",
              ].join(", "),
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/25 to-transparent"
            />
            <span className="relative">Essayer gratuitement</span>
            <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary CTA — glassmorphism pour fond sombre */}
          <Link
            href="/#how-it-works"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-[14.5px] font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20"
          >
            Comment ça marche
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-4 text-[12.5px] text-white/70"
        >
          Sans carte bancaire&nbsp;·&nbsp; Annulable à tout moment&nbsp;·&nbsp;
          Contact WhatsApp sous 24h
        </motion.p>
      </div>

      {/* Mute toggle discret en bas à droite */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Activer le son" : "Couper le son"}
        className="absolute bottom-40 right-5 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white/90 backdrop-blur-md transition-all hover:bg-white/25 md:bottom-44 md:right-8"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </section>
  );
}

/* ============================================================
   AGENT AVAILABILITY BADGE — stacked agent avatars (real photos)
   ============================================================ */

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
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/15 py-1 pl-1 pr-4 text-[12.5px] font-medium text-white backdrop-blur-md shadow-lg">
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
        <strong className="font-bold text-white">24h</strong>
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
