"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * LenisProvider — smooth scroll global.
 *
 * IMPORTANT : Lenis n'est activé QUE sur desktop. Sur mobile/tactile, on
 * laisse le scroll natif (beaucoup plus fluide et performant).
 *
 * Aussi désactivé pour les utilisateurs avec `prefers-reduced-motion`.
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

  return <>{children}</>;
}
