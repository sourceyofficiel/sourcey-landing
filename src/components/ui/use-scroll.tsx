"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` when window.scrollY exceeds the threshold (default 10px).
 * Uses passive scroll listener and reads initial position on mount.
 */
export function useScroll(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    onScroll(); // initial check
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
