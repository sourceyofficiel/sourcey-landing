"use client";

import { motion } from "motion/react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * V2Testimonials — 3 témoignages avec gros guillemets, photo, résultat chiffré.
 * Mix solo + marque DTC pour couvrir les 2 profils.
 */

const TESTIMONIALS = [
  {
    quote:
      "J'ai testé 12 produits différents en 6 mois sans bouger de mon canapé. Mon agent Chen Mei me négocie tout, je n'ai qu'à valider les samples par vidéo. Game changer absolu.",
    name: "Léo Marchand",
    role: "Solo dropshipper · 24 ans",
    avatarBg: "#FECACA",
    initials: "LM",
    result: "+€18k CA",
    resultLabel: "en 90 jours",
  },
  {
    quote:
      "Notre marque de bijoux a multiplié son catalogue par 3 sans grossir l'équipe. L'agent dédié et la traduction temps réel ont supprimé 80% de notre charge opérationnelle Chine.",
    name: "Léna Aubry",
    role: "Co-fondatrice · Marque DTC bijoux",
    avatarBg: "#BFDBFE",
    initials: "LA",
    result: "−80% ops",
    resultLabel: "Chine",
  },
  {
    quote:
      "Avant Sourcey, j'ai perdu 6 000€ avec un fournisseur Alibaba qui m'a livré n'importe quoi. Aujourd'hui, vidéo QC obligatoire avant paiement. Dormir tranquille, ça n'a pas de prix.",
    name: "Marc Pinto",
    role: "Marque accessoires moto",
    avatarBg: "#FED7AA",
    initials: "MP",
    result: "0 commande",
    resultLabel: "ratée en 12 mois",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function V2Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
    >
      <V2SectionLabel>Témoignages</V2SectionLabel>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Ils l'ont essayé,
        <br className="hidden md:block" />{" "}
        <span className="italic text-primary-600">ils en parlent.</span>
      </motion.h2>

      {/* Grid */}
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {TESTIMONIALS.map((t, i) => (
          <motion.article
            key={t.name}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`group relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-sm md:p-7 ${
              i === 1 ? "md:scale-[1.02] md:shadow-md" : ""
            }`}
          >
            {/* Subtle blue glow background — top-left blob */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 transition-opacity duration-300 group-hover:opacity-80"
              style={{
                backgroundImage:
                  "radial-gradient(circle at center, #DBEAFE 0%, transparent 70%)",
                opacity: 0.5,
                mixBlendMode: "multiply",
              }}
            />

            {/* Big quote mark */}
            <span
              aria-hidden
              className="font-display text-[64px] leading-none text-primary-200"
            >
              "
            </span>

            {/* Quote */}
            <p className="-mt-6 text-[14.5px] leading-relaxed text-neutral-700">
              {t.quote}
            </p>

            {/* Result chip */}
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 px-2.5 py-1 text-[12px] font-bold text-white shadow-sm">
                {t.result}
              </span>
              <span className="text-[11.5px] font-medium text-neutral-500">
                {t.resultLabel}
              </span>
            </div>

            {/* Author */}
            <div className="mt-auto flex items-center gap-3 border-t border-neutral-100 pt-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-neutral-900"
                style={{ background: t.avatarBg }}
              >
                {t.initials}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-neutral-900 truncate">
                  {t.name}
                </div>
                <div className="text-[12px] text-neutral-500 truncate">
                  {t.role}
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
