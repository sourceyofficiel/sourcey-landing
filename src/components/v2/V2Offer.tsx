"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { Check, ArrowRight, Calendar, FileText } from "lucide-react";

/**
 * V2Offer — section présentation de l'offre Sourcey, layout 3 colonnes.
 *
 * Inspiré d'un design vu ailleurs, adapté à la DA Sourcey (bleu primary,
 * fond blanc, rondeurs douces) :
 *   - Gauche  : portrait équipe Sourcey en Chine + offset bleu derrière +
 *               carte vidéo en bas-gauche (play icon en overlay)
 *   - Centre  : titre + sous-titre + 5 piliers cochés
 *   - Droite  : 2 cards CTAs verticales (appel de découverte +
 *               devis gratuit avec image cargo en background)
 */

const PILLARS = [
  {
    title: "Recherche de fournisseurs",
    description:
      "Accès à un large réseau de fabricants qualifiés et vérifiés sur place par notre équipe.",
  },
  {
    title: "Négociation des prix",
    description:
      "Conditions tarifaires optimales obtenues en mandarin, paiements sécurisés.",
  },
  {
    title: "Suivi de production et contrôle qualité",
    description:
      "Inspection physique avant expédition, gestion des non-conformités et ajustements.",
  },
  {
    title: "Gestion de la logistique et expédition",
    description:
      "Optimisation des coûts d'envoi et coordination avec les meilleurs transitaires.",
  },
  {
    title: "Accompagnement sur mesure",
    description:
      "Un interlocuteur unique tout au long du projet et un reporting précis.",
  },
];

export function V2Offer() {
  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-14">
        {/* === COLONNE GAUCHE : titre + bullets === */}
        <motion.div
        >
          <h2 className="font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
            Le sourcing en Chine,{" "}
            <span className="text-primary-600">simplifié et sécurisé.</span>
          </h2>

          <p className="mt-5 max-w-[540px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
            Marque e-commerce, retailer ou entrepreneur — nous t&apos;accompagnons
            de la recherche du bon fournisseur à la gestion complète de ta
            production.
          </p>

          <ul className="mt-8 space-y-5">
            {PILLARS.map((pillar, i) => (
              <motion.li
                key={pillar.title}
                className="flex items-start gap-4"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 ring-1 ring-inset ring-primary-200">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[15px] font-bold tracking-tight text-neutral-900 md:text-[16px]">
                    {pillar.title}
                  </h3>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-500 md:text-[14px]">
                    {pillar.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* === COLONNE DROITE : 2 cards CTAs === */}
        <motion.div
          className="flex flex-col gap-5"
        >
          {/* Card 1 — appel découverte */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
              <Calendar className="h-4 w-4" />
            </div>
            <h3 className="mt-4 font-display text-[18px] font-extrabold leading-tight text-neutral-900">
              Plus de 250 clients accompagnés, pourquoi pas toi&nbsp;?
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
              Échangeons sur tes objectifs lors d&apos;un{" "}
              <strong className="text-neutral-700">
                appel de découverte gratuit de 30 minutes
              </strong>{" "}
              et trouvons ensemble les meilleures solutions.
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-5 py-3 text-[13.5px] font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.35)",
                  "inset 0 -2px 0 rgba(15,40,100,0.3)",
                  "0 10px 24px -8px rgba(37,99,235,0.5)",
                  "0 0 0 1px rgba(29,78,216,0.4)",
                ].join(", "),
              }}
            >
              Réserver un appel
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2 — devis gratuit avec image cargo en background */}
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200 shadow-sm">
            {/* Background image */}
            <Image
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&q=80&auto=format&fit=crop"
              alt="Cargo et containers au port"
              fill
              sizes="300px"
              className="object-cover"
              unoptimized
            />
            {/* Dark overlay pour lisibilité */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-b from-neutral-900/55 via-neutral-900/65 to-neutral-900/85"
            />

            {/* Content */}
            <div className="relative p-6">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="mt-4 font-display text-[18px] font-extrabold leading-tight text-white">
                Devis gratuit en 24h
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/85">
                Obtiens une estimation rapide et précise pour ton projet. Soumets
                ton brief et reçois un devis détaillé sous 24h.
              </p>
              <Link
                href="/app/new"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[13.5px] font-semibold text-neutral-900 transition-all hover:-translate-y-0.5 hover:bg-neutral-100"
              >
                Demander un devis
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
