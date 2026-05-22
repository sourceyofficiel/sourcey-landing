"use client";

import { motion } from "motion/react";

/**
 * V2LogoBar — barre de logos clients/partenaires.
 * Pour l'instant des wordmarks fictifs neutres (Inter/Plus Jakarta).
 * Remplacer par les vrais logos clients dès qu'on en aura.
 */
const BRANDS = [
  "StratoLink",
  "Graphizo",
  "LucenAI",
  "IntelliSpark",
  "Brigly",
  "Nordic Co.",
];

export function V2LogoBar() {
  return (
    <section className="border-y border-neutral-200/60 bg-white/50 py-10 md:py-14">
      <div className="mx-auto max-w-[1400px] px-5">
        <motion.p
          className="text-center text-[12.5px] font-medium tracking-wide text-neutral-500"
        >
          Plus de <span className="font-bold text-neutral-700">500+</span>{" "}
          marques DTC nous font déjà confiance
        </motion.p>

        <motion.div
          className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-14"
        >
          {BRANDS.map((brand) => (
            <span
              key={brand}
              className="text-[15px] font-bold tracking-tight text-neutral-400 transition-colors hover:text-neutral-700 md:text-[17px]"
            >
              {brand}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
