"use client";

import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { NumberTicker } from "@/components/ui/number-ticker";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STATS = [
  {
    value: 1247,
    suffix: "",
    label: "Missions de sourcing réalisées",
    sub: "depuis le lancement bêta",
  },
  {
    value: 14,
    suffix: "",
    label: "Agents vérifiés en personne",
    sub: "à Yiwu, Guangzhou, Shenzhen, Shanghai",
  },
  {
    value: 42,
    suffix: "%",
    prefix: "-",
    label: "Économie moyenne vs Alibaba",
    sub: "sur les commandes Pro et Entreprise",
  },
];

export function Stats() {
  return (
    <section className="border-y border-neutral-200/60 bg-white py-16 md:py-20">
      <Container>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="grid gap-4 md:grid-cols-3"
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
              className="group relative overflow-hidden rounded-3xl bg-primary-50/60 p-7 transition-colors hover:bg-primary-50"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-200/40 blur-3xl" />
              <p className="text-[clamp(36px,4vw,52px)] font-extrabold leading-none tracking-tight text-primary-700">
                {stat.prefix}
                <NumberTicker
                  value={stat.value}
                  className="text-primary-700"
                />
                {stat.suffix}
              </p>
              <p className="mt-3 text-[15px] font-semibold text-neutral-900">
                {stat.label}
              </p>
              <p className="mt-1 text-sm text-neutral-600">{stat.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
