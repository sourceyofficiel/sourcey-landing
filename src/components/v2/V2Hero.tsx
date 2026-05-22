"use client";

import Image from "next/image";
import { motion, MotionConfig } from "motion/react";
import { MousePointer2 } from "lucide-react";
import { MarketplaceMarquee } from "@/components/v2/MarketplaceMarquee";
import { HeroButton } from "@/components/v2/HeroButton";

/**
 * V2Hero — banner sombre style MySourcify.
 *
 * Layout :
 *   - Background dark navy (#0E1535) + diagonal blue stripes à droite
 *   - Colonne gauche : title cascade + subtitle + CTA + marquee
 *   - Colonne droite : hero-founder.png (photo + cards intégrées dans le PNG)
 *
 * Override le MotionConfig global (reducedMotion="always") via une
 * nested <MotionConfig reducedMotion="never"> pour garder les
 * animations stylées uniquement sur ce composant.
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

            {/* === RIGHT : mockup PNG (photo + cards baked in) === */}
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
              {/* Float continu doux sur l'ensemble du mockup */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative mx-auto aspect-[4/5] w-full max-w-[520px] lg:max-w-none"
              >
                <Image
                  src="/images/hero-founder.png"
                  alt="Mockup Sourcey — suivi de commande, statut de livraison et facturation"
                  fill
                  priority
                  sizes="(min-width: 1024px) 45vw, 90vw"
                  className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}

/* ============================================================
   Background layers — style MySourcify : diagonal stripes propres
   ============================================================ */

function BackgroundLayers() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Grid pattern subtle */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 70% 50%, black, transparent)",
        }}
      />

      {/* Diagonal blue stripes — style MySourcify (right side) */}
      <div
        className="absolute right-0 top-0 h-full w-[55%]"
        style={{
          background:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 90px, rgba(56,107,255,0.18) 90px, rgba(56,107,255,0.18) 130px)",
          maskImage:
            "linear-gradient(to left, black 0%, black 40%, transparent 100%)",
        }}
      />

      {/* Bloc bleu principal — gros aplat diagonal en haut à droite */}
      <div
        className="absolute right-0 top-0 h-full w-[45%] bg-gradient-to-bl from-primary-500 via-primary-600/50 to-transparent"
        style={{
          clipPath: "polygon(40% 0%, 100% 0%, 100% 70%, 60% 100%, 25% 60%)",
          opacity: 0.85,
        }}
      />

      {/* Soft radial glow — accent doux derrière le mockup */}
      <motion.div
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[12%] top-[25%] h-[420px] w-[420px] rounded-full bg-primary-500/25 blur-[120px]"
      />

      {/* Light beam diagonal subtle */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
        }}
      />
    </div>
  );
}
