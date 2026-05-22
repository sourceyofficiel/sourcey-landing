"use client";

import { motion } from "motion/react";

/**
 * V2SectionLabel — pill badge bleu pour les en-têtes de sections.
 * DA cohérente : gradient primary-500 → primary-700, texte blanc UPPERCASE,
 * ombre bleutée subtile, inner top sheen pour la profondeur.
 *
 * Usage :
 *   <V2SectionLabel>Comment ça marche</V2SectionLabel>
 */
export function V2SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="mb-5 flex justify-center"
    >
      <span
        className="relative inline-flex items-center overflow-hidden rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white"
        style={{
          boxShadow: [
            // Inner top sheen
            "inset 0 1px 0 rgba(255,255,255,0.3)",
            // Inner bottom lip
            "inset 0 -2px 0 rgba(15,40,100,0.3)",
            // Blue glow
            "0 6px 18px -4px rgba(37,99,235,0.45)",
            // Crisp outline
            "0 0 0 1px rgba(29,78,216,0.35)",
          ].join(", "),
        }}
      >
        {/* Top sheen highlight (light from above) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/25 to-transparent"
        />
        <span className="relative">{children}</span>
      </span>
    </motion.div>
  );
}
