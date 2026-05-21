"use client";

import Image from "next/image";
import { motion } from "motion/react";

/**
 * LoadingScreen — affiché pendant les transitions de routes Next.js.
 *
 * Le composant principal est utilisé par les fichiers `loading.tsx` placés
 * dans les groupes de routes. Affiche le logo Sourcey "mark" qui pulse
 * légèrement avec un anneau bleu qui tourne autour.
 *
 * Fond blanc pour un look propre et professionnel.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="relative flex h-32 w-32 items-center justify-center">
        {/* Anneau qui tourne */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
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
            {/* Arc bleu animé (1/4 du cercle) */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#2563EB"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="80 220"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </motion.div>

        {/* Logo Sourcey qui pulse */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
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
      </div>
    </div>
  );
}
