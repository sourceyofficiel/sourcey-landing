"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, MapPin, Factory } from "lucide-react";

/**
 * Banner d'entrée de la page /features/sourcing.
 * Layout split : image plein cadre à gauche (sur dark), contenu droite.
 * Inspiré du style WeStock Europe — adapté DA Sourcey.
 */
export function SourcingBanner() {
  return (
    <section className="relative overflow-hidden bg-neutral-900">
      {/* Texture subtile en background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(37,99,235,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(15,40,100,0.4), transparent 60%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1400px] items-stretch md:grid-cols-[1.1fr_1fr]">
        {/* === Image gauche === */}
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400&q=85&auto=format&fit=crop"
            alt="Notre équipe Sourcey inspectant une usine partenaire en Chine"
            fill
            priority
            sizes="(min-width: 768px) 55vw, 100vw"
            className="object-cover"
            unoptimized
          />
          {/* Gradient pour blend avec le bg sombre sur la droite */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-neutral-900 md:via-neutral-900/30"
          />
        </div>

        {/* === Contenu droite === */}
        <div className="relative flex flex-col justify-center px-5 py-12 text-white md:px-10 md:py-20 lg:px-16 lg:py-24">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
          >
            <Factory className="h-3 w-3" />
            Sourcing fournisseur
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[clamp(32px,5vw,56px)] font-extrabold leading-[1.05] tracking-tight"
          >
            Le bon fournisseur.{" "}
            <span className="text-primary-300">Trouvé sur place.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-[480px] text-[14.5px] leading-relaxed text-white/80 md:text-[16px]"
          >
            Notre équipe terrain en Chine identifie et vérifie chaque usine
            avant de te la présenter. Tu reçois 3-5 options comparées, prêtes
            à produire pour toi.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.35)",
                  "inset 0 -2px 0 rgba(15,40,100,0.35)",
                  "0 14px 30px -8px rgba(37,99,235,0.55)",
                  "0 0 0 1px rgba(29,78,216,0.45)",
                ].join(", "),
              }}
            >
              Démarrer un brief
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#methode"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 py-3.5 text-[14px] font-semibold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20"
            >
              Voir la méthode
            </Link>
          </motion.div>

          {/* Stats inline en bas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6"
          >
            <Stat value="+200" label="Usines vérifiées" />
            <span className="text-white/20" aria-hidden>
              ·
            </span>
            <Stat value="7" label="Villes en Chine" />
            <span className="text-white/20" aria-hidden>
              ·
            </span>
            <Stat value="3-7j" label="Pour ton premier sample" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-[18px] font-extrabold leading-none text-white md:text-[20px]">
        {value}
      </div>
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-white/60">
        <MapPin className="h-2.5 w-2.5" />
        {label}
      </div>
    </div>
  );
}
