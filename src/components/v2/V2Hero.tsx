"use client";

import Image from "next/image";
import { motion, MotionConfig } from "motion/react";
import { ShieldCheck, MousePointer2 } from "lucide-react";
import { MarketplaceMarquee } from "@/components/v2/MarketplaceMarquee";
import { HeroButton } from "@/components/v2/HeroButton";

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
            {/* min-w-0 critique : empêche le marquee (w-max interne) de pousser
                la colonne au-delà de son allocation grid */}
            <div className="relative min-w-0 text-white">
              {/* Title — fade-in en cascade par ligne */}
              <h1 className="font-display text-[clamp(36px,5.8vw,72px)] font-extrabold leading-[1.02] tracking-tight">
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

              {/* CTA principal style MySourcify — gradient + icon box blanc + morph hover */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-9 md:mt-10"
              >
                <HeroButton href="/signup">Démarrer gratuitement</HeroButton>
              </motion.div>

              {/* Marketplace marquee — bandeau infini */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.85 }}
                className="mt-12 md:mt-14"
              >
                <MarketplaceMarquee />
              </motion.div>

              {/* Scroll indicator — style MySourcify */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="mt-12 hidden items-center gap-2 text-[12px] font-medium text-white/50 lg:flex"
              >
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <MousePointer2 className="h-3.5 w-3.5 -rotate-90" />
                </motion.div>
                <span>Scroll pour découvrir</span>
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
              {/* Image principale — PNG transparent, pas de halo / pas de cadre */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mx-auto aspect-[4/5] w-full max-w-[480px] lg:max-w-none"
              >
                <Image
                  src="/images/hero-founder.png"
                  alt="E-commerçant Sourcey inspectant un produit avec son agent en Chine"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-contain"
                />
              </motion.div>

              {/* Seule card conservée — "Vérifié sur place" top-right */}
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
