"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

/**
 * V2FinalCTA — section claire avec card blanc/transparent.
 *
 * S'intègre dans la DA light du reste de la page (blanc + grid bg).
 * Le footer dessous (bleu primary) crée le contraste de fermeture.
 */
export function V2FinalCTA() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative px-6 py-12 md:px-12 md:py-16"
      >
        <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16">
          {/* Left : title + subtitle */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-[clamp(30px,4.5vw,52px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
            >
              Prêt à trouver ton{" "}
              <span className="relative inline-block">
                <span className="relative z-10">prochain produit</span>
                {/* Animated accent underline */}
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute -bottom-1 left-0 right-0 h-1.5 origin-left rounded-full bg-primary-500"
                />
              </span>
              &nbsp;?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-[520px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]"
            >
              Crée ton compte en 30 secondes. Décris ton premier produit. Reçois
              ton premier devis sous 24h.
            </motion.p>
          </div>

          {/* Right : 2 CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row"
          >
            {/* Secondary CTA — neutral outlined */}
            <Link
              href="/v2#how-it-works"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-[14px] font-semibold text-neutral-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-300"
            >
              Voir une démo
            </Link>

            {/* Primary CTA — gradient blue (unchanged) */}
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-6 py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
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
              <span className="relative">Commencer gratuitement</span>
              <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Reassurance line at the bottom */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative mt-10 border-t border-neutral-200/60 pt-6 text-[12.5px] text-neutral-500"
        >
          Sans carte bancaire&nbsp;·&nbsp; Annulable à tout moment&nbsp;·&nbsp;
          Agent assigné sous 24h
        </motion.p>
      </motion.div>
    </section>
  );
}
