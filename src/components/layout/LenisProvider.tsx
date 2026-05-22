"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";

/**
 * LenisProvider — smooth scroll global + désactivation des animations
 * motion sur tout le contenu enfant.
 *
 * IMPORTANT : Lenis n'est activé QUE sur desktop. Sur mobile/tactile, on
 * laisse le scroll natif (beaucoup plus fluide et performant).
 *
 * Aussi désactivé pour les utilisateurs avec `prefers-reduced-motion`.
 *
 * Le <MotionConfig reducedMotion="always"> englobe tout le tree pour que
 * les animations motion (fade-in au scroll, slide, stagger, etc.) soient
 * skippées — les composants apparaissent dans leur état final
 * instantanément. Les transitions d'interaction (accordion, dropdown,
 * AnimatePresence) restent fonctionnelles car elles utilisent height/
 * layout, pas transform/opacity.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip Lenis on devices that prefer reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Skip Lenis on touch devices (mobile/tablet) — native scroll is faster
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

    if (isTouch) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="always">{children}</MotionConfig>
  );
}
