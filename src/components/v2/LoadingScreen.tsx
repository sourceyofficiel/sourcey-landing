"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * LoadingScreen — affiché pendant les transitions de routes Next.js.
 *
 * Animation :
 *  - Entrée : fade-in + zoom-out subtil sur 200ms (lisse l'apparition
 *    si le loader est visible plus de qq frames).
 *  - Anneau : 1 rotation complète en 1.2s, linear, infinite — assure
 *    au moins une rotation visible même sur les pages qui chargent vite.
 *  - Logo  : pulse doux (1 → 1.06 → 1) synchronisé sur 1.2s.
 *  - Halo  : pulse opacité pour donner de la profondeur visuelle.
 *
 * Fond blanc pour un look propre et professionnel.
 */
export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex min-h-screen items-center justify-center bg-white"
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex h-32 w-32 items-center justify-center"
      >
        {/* Halo bleu pulsé derrière, donne de la profondeur */}
        <motion.div
          aria-hidden
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary-300 blur-2xl"
        />

        {/* Anneau qui tourne — 1.2s/rotation, linear pour fluidité continue */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, ease: "linear", repeat: Infinity }}
          className="absolute inset-0"
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {/* Cercle de fond (gris clair) */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2.5"
            />
            {/* Arc bleu (~30% du cercle) avec dégradé pour effet "trail" */}
            <defs>
              <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0" />
                <stop offset="100%" stopColor="#2563EB" stopOpacity="1" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#loader-gradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="90 220"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </motion.div>

        {/* Logo Sourcey qui pulse — synchronisé avec l'anneau (1.2s) */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          className="relative"
        >
          <Image
            src="/logo/sourcey-mark.png"
            alt="Sourcey"
            width={307}
            height={307}
            priority
            className="h-14 w-14 select-none"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
