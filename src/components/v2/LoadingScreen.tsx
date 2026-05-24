"use client";

import { motion, MotionConfig } from "motion/react";
import { Mail } from "lucide-react";

/**
 * LoadingScreen — affiché pendant les transitions de routes Next.js.
 *
 * Branding AutoSAV : carré emerald arrondi avec icône Mail amber au
 * centre + anneau emerald qui tourne + halo emerald pulsé.
 *
 * Animations (override le MotionConfig parent reducedMotion="always") :
 *  - Container : fade-in + scale-up 200ms
 *  - Anneau : rotation 1.2s linear infinite
 *  - Logo : pulse scale 1 → 1.06 → 1 sur 1.2s
 *  - Halo emerald : pulse opacité 0.2 → 0.5 → 0.2 sur 1.2s
 *  - Texte "AutoSAV" : fade-in léger après le logo
 */
export function LoadingScreen() {
  return (
    <MotionConfig reducedMotion="never">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="flex min-h-screen flex-col items-center justify-center bg-white"
      >
        <motion.div
          initial={{ scale: 0.92 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-32 w-32 items-center justify-center"
        >
          {/* Halo emerald pulsé en arrière-plan */}
          <motion.div
            aria-hidden
            animate={{ opacity: [0.2, 0.55, 0.2] }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-emerald-400 blur-2xl"
          />

          {/* Anneau qui tourne */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
            className="absolute inset-0"
          >
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {/* Cercle de fond emerald très clair */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#D1FAE5"
                strokeWidth="2.5"
              />
              {/* Arc emerald (~30% du cercle) avec dégradé trail */}
              <defs>
                <linearGradient
                  id="autosav-loader-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#047857" stopOpacity="0" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="1" />
                </linearGradient>
              </defs>
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#autosav-loader-gradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray="90 220"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </motion.div>

          {/* Logo AutoSAV — carré emerald + icône Mail amber, pulse */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
            className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-800 text-amber-200 shadow-[0_8px_24px_-6px_rgba(6,95,70,0.5)]"
          >
            <Mail className="h-6 w-6" />
          </motion.div>
        </motion.div>

        {/* Texte "AutoSAV" sous le logo */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="mt-6 text-center"
        >
          <div className="font-display text-[15px] font-extrabold tracking-tight text-emerald-900">
            AutoSAV
          </div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
            className="mt-1 text-[11.5px] text-emerald-700/70"
          >
            Chargement…
          </motion.div>
        </motion.div>
      </motion.div>
    </MotionConfig>
  );
}
