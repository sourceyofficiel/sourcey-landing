"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import {
  ArrowUpRight,
  Check,
  ShieldCheck,
  Truck,
  FileText,
  Sparkles,
} from "lucide-react";
import { MarketplaceMarquee } from "@/components/v2/MarketplaceMarquee";

/**
 * V2Hero — banner sombre premium avec animations riches.
 *
 * Override le MotionConfig global (reducedMotion="always") via une
 * nested <MotionConfig reducedMotion="never"> pour garder les
 * animations stylées uniquement sur ce composant.
 *
 * Animations :
 *   - Cascade fade-in à l'arrivée (eyebrow → title → subtitle → CTA)
 *   - Cards flottantes en continu (bobbing doux, timings désynchronisés)
 *   - Pulse sur le status dot
 *   - Gradient stripe qui breathe lentement
 *   - Hover scale subtil sur les cards
 */
export function V2Hero() {
  return (
    <MotionConfig reducedMotion="never">
      <section className="relative overflow-hidden bg-[#0E1535]">
        {/* === Backgrounds layers === */}
        <BackgroundLayers />

        {/* === Contenu === */}
        <div className="relative mx-auto max-w-[1400px] px-5 pb-14 pt-12 md:px-8 md:pb-20 md:pt-16 lg:pb-28 lg:pt-20">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* === LEFT : texte === */}
            <div className="relative text-white">
              {/* Eyebrow avec status dot pulsé */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-4 text-[11.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md"
              >
                <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                  <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <motion.span
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 rounded-full bg-green-400"
                    />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-400" />
                  </span>
                  Sourcing managé · Live
                </span>
              </motion.div>

              {/* Title — fade-in en cascade par ligne */}
              <h1 className="mt-7 font-display text-[clamp(36px,5.8vw,72px)] font-extrabold leading-[1.02] tracking-tight">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="block"
                >
                  Le sourcing en Chine,
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="block bg-gradient-to-r from-primary-300 via-primary-200 to-white bg-clip-text text-transparent"
                >
                  géré pour toi.
                </motion.span>
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-6 max-w-[520px] text-[14.5px] leading-relaxed text-white/70 md:mt-7 md:text-[16px]"
              >
                Trouver des fournisseurs fiables et assurer une production sans
                accroc peut s&apos;avérer complexe.{" "}
                <strong className="font-semibold text-white">
                  Sourcey prend en charge l&apos;intégralité du processus
                </strong>
                , de la sélection des fournisseurs à la livraison
                internationale.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10"
              >
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 py-3 pl-6 pr-2 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-8px_rgba(37,99,235,0.6),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:-translate-y-0.5"
                >
                  Démarrer un brief
                  <motion.span
                    whileHover={{ rotate: 45 }}
                    transition={{ duration: 0.3 }}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900"
                  >
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                  </motion.span>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-[14.5px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
                >
                  Voir nos services
                </Link>
              </motion.div>

              {/* Marketplace marquee — bandeau infini */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.85 }}
                className="mt-12 md:mt-14"
              >
                <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
                  <Sparkles className="h-3 w-3" />
                  Plateformes sourcées
                </div>
                <div className="mt-4">
                  <MarketplaceMarquee />
                </div>
              </motion.div>
            </div>

            {/* === RIGHT : image + floating cards === */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.9,
                delay: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative"
            >
              {/* Glow halo derrière l'image */}
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-primary-500/40 via-primary-600/20 to-transparent blur-3xl"
              />

              {/* Image principale */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-3xl bg-neutral-200 shadow-[0_40px_70px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10 lg:max-w-none"
              >
                <Image
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85&auto=format&fit=crop"
                  alt="Sourcey prend en charge ton sourcing"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-cover"
                  unoptimized
                />
                {/* Vignette pour faire ressortir les cards */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/10"
                />
              </motion.div>

              {/* === Floating cards === */}

              {/* Card 1 — "Brief validé" pill (top-left) */}
              <FloatingCard
                className="absolute left-2 top-6 lg:-left-6"
                delay={0.7}
                floatRange={6}
                floatDuration={5}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/95 px-3 py-2 text-[12px] font-semibold text-neutral-900 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4)] backdrop-blur-md">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  Brief validé
                </div>
              </FloatingCard>

              {/* Card 2 — "Vérifié sur place" pill (top-right) */}
              <FloatingCard
                className="absolute right-2 top-6 lg:-right-4"
                delay={0.85}
                floatRange={5}
                floatDuration={5.5}
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-neutral-900 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  <ShieldCheck className="h-3 w-3 text-primary-600" />
                  Vérifié sur place
                </div>
              </FloatingCard>

              {/* Card 3 — "Suivi commande" card (middle-left) */}
              <FloatingCard
                className="absolute bottom-[34%] left-2 hidden md:block lg:-left-12"
                delay={1.0}
                floatRange={8}
                floatDuration={6.5}
              >
                <div className="w-[230px] rounded-2xl border border-white/30 bg-white/95 p-4 shadow-[0_22px_45px_-15px_rgba(0,0,0,0.4)] backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md">
                      <Truck className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </span>
                    <span className="text-[12.5px] font-bold text-neutral-900">
                      Suivi commande
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-[11.5px]">
                    <li className="flex items-center gap-2 text-neutral-700">
                      <Check
                        className="h-3 w-3 text-primary-600"
                        strokeWidth={3}
                      />
                      Fournisseur sélectionné
                    </li>
                    <li className="flex items-center gap-2 text-neutral-700">
                      <Check
                        className="h-3 w-3 text-primary-600"
                        strokeWidth={3}
                      />
                      En production
                    </li>
                    <li className="flex items-center gap-2 text-neutral-400">
                      <span className="relative block h-3 w-3">
                        <motion.span
                          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 rounded-full bg-amber-400"
                        />
                        <span className="relative block h-3 w-3 rounded-full border-2 border-amber-400" />
                      </span>
                      Expédition en cours
                    </li>
                  </ul>
                </div>
              </FloatingCard>

              {/* Card 4 — "Devis envoyé" card (bottom-right) */}
              <FloatingCard
                className="absolute -bottom-4 right-2 lg:-right-8 lg:bottom-8"
                delay={1.15}
                floatRange={7}
                floatDuration={7}
              >
                <div className="w-[215px] rounded-2xl border border-white/30 bg-white/95 p-4 shadow-[0_22px_45px_-15px_rgba(0,0,0,0.4)] backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md">
                      <FileText className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </span>
                    <span className="text-[12.5px] font-bold text-neutral-900">
                      Devis envoyé
                    </span>
                  </div>
                  <div className="mt-3 font-display text-[24px] font-extrabold leading-none text-neutral-900">
                    2 100€
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-2.5 text-[10.5px]">
                    <div>
                      <div className="text-neutral-400">Délai</div>
                      <div className="font-semibold text-neutral-900">
                        7 jours
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-neutral-400">Réf.</div>
                      <div className="font-mono font-semibold text-neutral-900">
                        SC-0487
                      </div>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

/* ============================================================
   Background layers — gradient stripe + grid + glows
   ============================================================ */

function BackgroundLayers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Grid pattern subtle */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 70% 50%, black, transparent)",
        }}
      />

      {/* Diagonal gradient stripe à droite — breathe slowly */}
      <motion.div
        animate={{ opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-0 h-full w-[55%] bg-gradient-to-bl from-primary-500 via-primary-600/40 to-transparent"
        style={{
          clipPath: "polygon(35% 0%, 100% 0%, 100% 100%, 70% 100%, 50% 50%)",
        }}
      />

      {/* Soft radial glows */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[15%] top-[20%] h-[400px] w-[400px] rounded-full bg-primary-500/30 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute left-[10%] bottom-[20%] h-[300px] w-[300px] rounded-full bg-primary-400/20 blur-[100px]"
      />

      {/* Light beam diagonal */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
        }}
      />
    </div>
  );
}

/* ============================================================
   FloatingCard — wrapper qui combine fade-in à l'arrivée + float continu
   ============================================================ */

function FloatingCard({
  children,
  className,
  delay,
  floatRange,
  floatDuration,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  floatRange: number;
  floatDuration: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {/* Inner motion pour le float continu (indépendant du fade-in) */}
      <motion.div
        animate={{ y: [0, -floatRange, 0] }}
        transition={{
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
