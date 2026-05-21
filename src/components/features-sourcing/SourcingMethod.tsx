"use client";

import Image from "next/image";
import { motion } from "motion/react";
import {
  ClipboardList,
  Network,
  Package,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * Section "Notre méthode" — 4 étapes du processus de sourcing chez Sourcey.
 * Layout : grosse image à gauche, liste à droite (timeline avec dots).
 */

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
  duration: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: ClipboardList,
    title: "On qualifie ton besoin",
    body: "Account manager francophone te contacte sous 24h. On affine ensemble la catégorie produit, MOQ, budget, certifications nécessaires et délais.",
    duration: "1h d'appel",
  },
  {
    n: "02",
    icon: Network,
    title: "On consulte notre carnet d'adresses",
    body: "Plus de 200 fabricants vérifiés par notre équipe terrain. Si on a déjà ton type de produit, on revient avec des candidats sous 48h.",
    duration: "24-48h",
  },
  {
    n: "03",
    icon: Package,
    title: "On commande les échantillons",
    body: "Pour 2-3 usines les plus prometteuses, on commande les samples physiques. On les inspecte sur place, on les photographie en studio.",
    duration: "3-7 jours",
  },
  {
    n: "04",
    icon: FileText,
    title: "On te présente le rapport comparatif",
    body: "3-5 options dans un document propre : photos samples, fiche d'usine, prix négocié, MOQ, délais, certifications. Tu choisis, on commande.",
    duration: "Synthèse PDF",
  },
];

export function SourcingMethod() {
  return (
    <section
      id="methode"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-24"
    >
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Notre méthode</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Comment on trouve{" "}
          <span className="text-primary-600">ton fournisseur.</span>
        </h2>
        <p className="mt-4 text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Une méthode éprouvée en 4 étapes. Aucune zone grise — tu sais à
          chaque instant où on en est.
        </p>
      </div>

      <div className="mt-16 grid items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Image gauche */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative lg:sticky lg:top-32"
        >
          <div className="relative">
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 inset-0 rounded-3xl bg-primary-600"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.25)]">
              <Image
                src="https://images.unsplash.com/photo-1581094289810-adf5d25690e3?w=1000&q=85&auto=format&fit=crop"
                alt="Inspection d'usine en Chine par l'équipe Sourcey"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          {/* Caption sous l'image */}
          <div className="mt-6 rounded-2xl bg-neutral-50 p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary-700">
              Sur le terrain
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">
              Nos agents visitent les usines en personne — visites surprise,
              audit qualité, vérification des conditions de travail.
            </p>
          </div>
        </motion.div>

        {/* Timeline étapes droite */}
        <ol className="relative space-y-8">
          {/* Vertical line */}
          <div
            aria-hidden
            className="absolute left-[18px] top-3 bottom-3 w-px bg-neutral-200"
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.n}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: 0.1 + i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative flex items-start gap-5 pl-1"
              >
                {/* Step icon dot */}
                <span
                  className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white ring-4 ring-white"
                  style={{
                    boxShadow:
                      "0 4px 12px -4px rgba(37,99,235,0.45), 0 0 0 1px rgba(29,78,216,0.4)",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>

                <div className="min-w-0 flex-1 pb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] font-bold text-primary-700">
                      {step.n}
                    </span>
                    <h3 className="text-[16px] font-bold tracking-tight text-neutral-900 md:text-[17px]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500 md:text-[14px]">
                    {step.body}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-semibold text-primary-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    {step.duration}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
