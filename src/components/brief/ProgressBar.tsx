"use client";

import { motion } from "motion/react";

/**
 * ProgressBar — barre fine en haut du formulaire, % de complétion.
 */
export function ProgressBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="sticky top-14 z-20 -mx-5 border-b border-neutral-200 bg-white/95 px-5 py-3 backdrop-blur-md md:-mx-8 md:px-8">
      <div className="mx-auto flex max-w-[760px] items-center gap-3">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary-500 to-primary-700"
          />
        </div>
        <span className="min-w-[3em] text-right font-mono text-[11.5px] font-semibold text-neutral-600">
          {Math.round(clamped)}%
        </span>
      </div>
    </div>
  );
}
