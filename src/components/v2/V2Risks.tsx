"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Clock, ShieldAlert, Languages } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * V2Risks — "S'improviser acheteur international, quels sont les risques ?"
 *
 * Section split en 2 parties :
 *   1. Header 2 colonnes : titre + intro à gauche, image d'usine + offset
 *      bleu à droite
 *   2. 3 cards horizontales sur les risques (la 1ère mise en avant en
 *      gradient bleu Sourcey, les 2 autres en blanc avec border)
 */

type Risk = {
  icon: typeof Clock;
  title: string;
  description: string;
};

const RISKS: Risk[] = [
  {
    icon: Clock,
    title: "Du temps perdu sur les recherches",
    description:
      "Identifier les bons fabricants, vérifier leur sérieux, négocier, suivre la production… sans équipe dédiée, c'est des heures et des heures à y passer, au détriment de ton business principal.",
  },
  {
    icon: ShieldAlert,
    title: "Risques de non-conformité",
    description:
      "Normes, certifications, contrôles qualité… sans expertise locale, le risque de recevoir des produits non conformes est bien réel. Et parfois, ça ne se voit qu'une fois les marchandises livrées.",
  },
  {
    icon: Languages,
    title: "Difficultés de communication",
    description:
      "La langue, les habitudes commerciales, les contrats, les horaires… travailler avec des fournisseurs étrangers demande une vraie maîtrise interculturelle pour éviter les quiproquos et les imprévus.",
  },
];

export function V2Risks() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      {/* === Top : 2 colonnes header === */}
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* Texte à gauche */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex md:justify-start">
            <div className="-mb-1 md:mb-0">
              <div className="md:contents">
                {/* Override V2SectionLabel centering for this case via wrapper */}
                <div className="[&>div]:!mb-0 [&>div]:!justify-start">
                  <V2SectionLabel>Risques</V2SectionLabel>
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-5 font-display text-[clamp(28px,4vw,48px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900">
            S'improviser acheteur international,{" "}
            <span className="text-primary-600">quels sont les risques ?</span>
          </h2>

          <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-neutral-500 md:text-[16.5px]">
            Trouver un bon fournisseur à l'étranger, ça peut vite devenir un
            casse-tête. Voici pourquoi notre accompagnement change la donne.
          </p>
        </motion.div>

        {/* Image à droite avec offset bleu derrière */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          {/* Offset bleu derrière l'image */}
          <div
            aria-hidden
            className="absolute -bottom-4 -right-4 h-full w-full rounded-2xl bg-primary-600 md:-bottom-5 md:-right-5"
          />

          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]">
            <Image
              src="https://images.unsplash.com/photo-1565793979206-6d599e4f3ad7?w=1200&q=80&auto=format&fit=crop"
              alt="Ouvriers dans une usine textile en Chine"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        </motion.div>
      </div>

      {/* === Bottom : 3 cards de risques === */}
      <motion.ul
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
          hidden: {},
        }}
        className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-5"
      >
        {RISKS.map((risk, i) => (
          <RiskCard key={risk.title} risk={risk} highlight={i === 0} />
        ))}
      </motion.ul>
    </section>
  );
}

/* ============================================================
   CARD — variant "highlight" (bleu gradient) ou normale (blanche)
   ============================================================ */

function RiskCard({
  risk,
  highlight,
}: {
  risk: Risk;
  highlight: boolean;
}) {
  const Icon = risk.icon;
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={`relative overflow-hidden rounded-2xl p-6 md:p-7 ${
        highlight
          ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white"
          : "border border-neutral-200 bg-white"
      }`}
      style={
        highlight
          ? {
              boxShadow: [
                "inset 0 1px 0 rgba(255,255,255,0.2)",
                "inset 0 -2px 0 rgba(15,40,100,0.3)",
                "0 20px 40px -12px rgba(37,99,235,0.4)",
                "0 0 0 1px rgba(29,78,216,0.4)",
              ].join(", "),
            }
          : undefined
      }
    >
      {/* Decorative pattern dans le coin (uniquement highlight) */}
      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 opacity-15"
        >
          <Icon className="h-32 w-32 text-white" strokeWidth={1} />
        </div>
      )}

      {/* Top sheen sur la card highlight */}
      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-2xl bg-gradient-to-b from-white/15 to-transparent"
        />
      )}

      {/* Icon */}
      <span
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${
          highlight
            ? "bg-white/15 text-white ring-1 ring-inset ring-white/25"
            : "bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100"
        }`}
      >
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>

      {/* Title */}
      <h3
        className={`relative mt-6 text-[18px] font-bold leading-tight tracking-tight md:text-[19px] ${
          highlight ? "text-white" : "text-neutral-900"
        }`}
      >
        {risk.title}
      </h3>

      {/* Description */}
      <p
        className={`relative mt-3 text-[13.5px] leading-relaxed md:text-[14.5px] ${
          highlight ? "text-white/85" : "text-neutral-500"
        }`}
      >
        {risk.description}
      </p>
    </motion.li>
  );
}
