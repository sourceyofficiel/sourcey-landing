"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Hourglass, PackageX, Receipt } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * V2Risks — section qui pose les 3 risques principaux quand on source seul
 * en Chine. Inspiré d'un layout vu ailleurs mais réécrit dans la voix
 * Sourcey (direct, tutoiement, exemples concrets).
 *
 *   1. Header 2 colonnes : titre + intro à gauche, image d'usine + offset
 *      bleu à droite
 *   2. 3 cards horizontales (la 1ère mise en avant en gradient bleu, les 2
 *      autres en blanc avec border)
 */

type Risk = {
  icon: typeof Hourglass;
  title: string;
  description: string;
};

const RISKS: Risk[] = [
  {
    icon: Hourglass,
    title: "Tu passes 3 mois sur Alibaba pour rien",
    description:
      "Trier les vrais fabricants des revendeurs, demander 15 samples, comparer les fiches techniques en mauvais anglais… sans contact terrain ni carnet d'adresses, ton soir et tes week-ends y passent. Et ton produit n'est toujours pas en ligne.",
  },
  {
    icon: PackageX,
    title: "Le sample est nickel, la prod est bof",
    description:
      "Le premier carton arrive : la couleur a viré, les coutures sont approximatives, le packaging est mal collé. Sans inspection physique avant le départ, tu découvres tout à la réception — quand c'est trop tard pour exiger une re-production.",
  },
  {
    icon: Receipt,
    title: "Le prix annoncé n'est jamais le vrai prix",
    description:
      "MOQ qui double au dernier moment, frais d'emballage non chiffrés, supplément express, taxes douanières surprise. Sans quelqu'un qui parle mandarin et qui négo en ton nom, tu signes ce qu'on te donne — et tu paies la différence.",
  },
];

export function V2Risks() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      {/* === Top : 2 colonnes header === */}
      <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
        {/* Texte à gauche */}
        <motion.div
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
            Sourcer en Chine sans aide,{" "}
            <span className="text-primary-600">ça pique vite.</span>
          </h2>

          <p className="mt-5 max-w-[520px] text-[15px] leading-relaxed text-neutral-500 md:text-[16.5px]">
            Les pièges sont partout — usines fantômes, samples truqués, prix
            qui glissent. Voilà les 3 qu'on désamorce pour toi dès ton
            premier brief.
          </p>
        </motion.div>

        {/* Image à droite avec offset bleu derrière */}
        <motion.div
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
              src="/images/risks-inspection.png"
              alt="Sourcing en Chine — illustration"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>

      {/* === Bottom : 3 cards de risques === */}
      <motion.ul
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
