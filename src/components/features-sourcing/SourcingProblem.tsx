"use client";

import { motion } from "motion/react";
import { SearchX, Clock, MessageCircleOff } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * Section "Pourquoi c'est dur de sourcer seul" — 3 frictions principales.
 * Layout 3 cards, titre + body court, icônes neutres.
 */

const FRICTIONS = [
  {
    icon: SearchX,
    title: "Alibaba est saturé",
    body: "8 vendeurs sur 10 sont des revendeurs qui rebadgent. Sans contact terrain, distinguer le vrai fabricant du middleman prend des semaines.",
  },
  {
    icon: Clock,
    title: "C'est un job à plein temps",
    body: "Filtrer, contacter, demander des samples, suivre les retours, comparer… le sourcing solo peut prendre 80h avant même le premier devis sérieux.",
  },
  {
    icon: MessageCircleOff,
    title: "Tu n'as pas le levier mandarin",
    body: "Sans une équipe qui parle chinois et qui connaît les codes culturels, tu prends le prix annoncé. Pas de négo possible en anglais approximatif.",
  },
];

export function SourcingProblem() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Le problème</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Pourquoi sourcer seul,{" "}
          <span className="text-primary-600">ça coince.</span>
        </h2>
      </div>

      <motion.ul
        variants={{
          visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
          hidden: {},
        }}
        className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5"
      >
        {FRICTIONS.map((f) => {
          const Icon = f.icon;
          return (
            <motion.li
              key={f.title}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                },
              }}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-5 text-[16px] font-bold tracking-tight text-neutral-900 md:text-[17px]">
                {f.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500 md:text-[14px]">
                {f.body}
              </p>
            </motion.li>
          );
        })}
      </motion.ul>
    </section>
  );
}
