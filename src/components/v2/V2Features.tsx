"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { FEATURES, type Feature } from "@/lib/features-data";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/* ============================================================
   V2Features — accordéon des 6 fonctionnalités (mêmes que la navbar)
   ============================================================

   Layout :
     - Section header (titre + intro centré) AU-DESSUS de la card
     - Card unique blanche rounded-3xl, contenant :
         • DESKTOP : split 2 cols (gauche = label + titre + arrow CTA,
           droite = liste accordéon des 6 features)
         • MOBILE : stack vertical (top, puis liste)
     - Chaque feature dans la liste : icône bleue + titre. Clic →
       toggle l'ouverture, qui révèle la description + lien
       "Voir le détail" vers /features/<slug>. Une seule ouverte à
       la fois.

   Source unique des features : src/lib/features-data.ts (même que
   le dropdown nav).
*/

export function V2Features() {
  // index de la feature ouverte (default: 0 = la première)
  const [openIdx, setOpenIdx] = useState<number>(0);

  return (
    <section
      id="features"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
      aria-labelledby="features-heading"
    >
      {/* === Header centré au-dessus de la card === */}
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Fonctionnalités</V2SectionLabel>
        <motion.h2
          id="features-heading"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
        >
          Tout ce qu&apos;on fait{" "}
          <span className="text-primary-600">pour toi.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]"
        >
          Six piliers couvrent l&apos;intégralité de ton parcours sourcing.
          Clique pour ouvrir une fonctionnalité.
        </motion.p>
      </div>

      {/* === Card principale === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-12 max-w-[1100px] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.08)]"
      >
        <div className="grid gap-0 md:grid-cols-[minmax(0,340px)_1fr]">
          {/* === LEFT : label + titre + CTA === */}
          <div className="border-b border-neutral-100 p-6 md:border-b-0 md:border-r md:p-8 lg:p-10">
            <div className="text-[12px] font-semibold text-neutral-500">
              Notre service
            </div>
            <h3 className="mt-2 font-display text-[20px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[24px] lg:text-[26px]">
              On orchestre ton sourcing à ta place.
            </h3>
            <Link
              href="/signup"
              aria-label="Démarrer un brief"
              className="group mt-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* === RIGHT : liste accordéon === */}
          <ul className="divide-y divide-neutral-100 p-2 md:p-3">
            {FEATURES.map((feature, idx) => (
              <FeatureAccordionItem
                key={feature.slug}
                feature={feature}
                isOpen={openIdx === idx}
                onToggle={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              />
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================================================
   FEATURE ACCORDION ITEM
   ============================================================ */

function FeatureAccordionItem({
  feature,
  isOpen,
  onToggle,
}: {
  feature: Feature;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = feature.icon as LucideIcon;
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-start gap-3 rounded-xl p-4 text-left transition-colors hover:bg-neutral-50 md:p-5"
      >
        {/* Icon block bleu */}
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "inset 0 -2px 0 rgba(0,0,0,0.15)",
              "0 6px 14px -4px rgba(37,99,235,0.4)",
            ].join(", "),
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/30 to-transparent"
          />
          <Icon
            className="relative h-[18px] w-[18px] text-white"
            strokeWidth={2}
          />
        </span>

        {/* Titre + description quand ouverte */}
        <div className="min-w-0 flex-1">
          <div
            className={`flex items-center gap-2 text-[14.5px] font-bold leading-tight tracking-tight transition-colors md:text-[16px] ${
              isOpen ? "text-neutral-900" : "text-neutral-800 group-hover:text-neutral-900"
            }`}
          >
            {feature.title}
          </div>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  duration: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-[13px] leading-relaxed text-neutral-500 md:text-[13.5px]">
                  {feature.tagline}
                </p>
                <Link
                  href={`/features/${feature.slug}`}
                  className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary-700 hover:text-primary-800"
                  onClick={(e) => e.stopPropagation()}
                >
                  Voir le détail
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chevron / + indicateur d'ouverture */}
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center text-[16px] font-light text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden
        >
          +
        </span>
      </button>
    </li>
  );
}
