"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * FAQ spécifique à la page Sourcing fournisseur, suivi d'un CTA final
 * inline (pas le V2FinalCTA générique, mais une version sourcing-focused).
 */

const FAQ = [
  {
    q: "Combien de temps avant d'avoir mes premières options ?",
    a: "Compte 3 à 7 jours selon la complexité de ton produit. Pour des catégories standards (textile, accessoires, gadgets), c'est souvent 48-72h. Pour du sur-mesure ou des produits techniques avec certifications, on peut aller jusqu'à 2 semaines.",
  },
  {
    q: "Vous trouvez vraiment des usines, pas des revendeurs ?",
    a: "Oui. Notre équipe terrain vérifie sur place : licence d'export, capacité de production réelle, machines, ouvriers. Si un candidat est en fait un middleman, on l'exclut. C'est la valeur ajoutée principale de Sourcey par rapport à Alibaba.",
  },
  {
    q: "Et si aucune des options ne me convient ?",
    a: "On relance une vague de recherche. C'est inclus dans tous les plans, jusqu'à ce qu'on trouve un match. Tu paies ton abonnement, pas la recherche unitaire.",
  },
  {
    q: "Vous gérez quoi exactement comme catégories ?",
    a: "Mode, accessoires, beauté, maison/déco, électronique grand public, sport, animalerie, papeterie, goodies. Pas d'armes, pas de pharma, pas de produits réglementés santé/médical.",
  },
  {
    q: "Je reste anonyme côté usine ?",
    a: "Oui. Le fournisseur ne sait pas qui tu es ni où tu vends. Il négocie avec Sourcey. Ça te protège du démarchage direct et de la copie de ton concept.",
  },
];

export function SourcingFAQ() {
  return (
    <section className="relative mx-auto max-w-[860px] px-5 py-20 md:px-8 md:py-24">
      <div className="text-center">
        <V2SectionLabel>Petite FAQ</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Les questions qu&apos;on{" "}
          <span className="text-primary-600">nous pose souvent.</span>
        </h2>
      </div>

      <motion.ul
        variants={{
          visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
          hidden: {},
        }}
        className="mt-12 grid gap-3"
      >
        {FAQ.map((item) => (
          <motion.li
            key={item.q}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
              },
            }}
            className="rounded-2xl border border-neutral-200 bg-white p-6"
          >
            <h3 className="text-[15px] font-bold tracking-tight text-neutral-900 md:text-[16px]">
              {item.q}
            </h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-600 md:text-[14px]">
              {item.a}
            </p>
          </motion.li>
        ))}
      </motion.ul>

      {/* CTA final inline */}
      <motion.div
        className="mt-12 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-8 text-center md:p-12"
      >
        <h3 className="font-display text-[24px] font-extrabold tracking-tight text-neutral-900 md:text-[30px]">
          Prêt à trouver ton fournisseur&nbsp;?
        </h3>
        <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-relaxed text-neutral-500 md:text-[15px]">
          Décris ton projet en 10 minutes. Notre équipe t&apos;envoie 3-5
          options vérifiées sous une semaine.
        </p>
        <Link
          href="/signup"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "inset 0 -2px 0 rgba(15,40,100,0.35)",
              "0 14px 30px -8px rgba(37,99,235,0.55)",
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          Démarrer mon brief
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
