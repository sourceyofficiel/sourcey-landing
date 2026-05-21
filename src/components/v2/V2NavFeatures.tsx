"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { FEATURES } from "@/lib/features-data";
import { cn } from "@/lib/utils";

/**
 * Dropdown "Fonctionnalités" — version desktop only.
 *
 * — S'ouvre au hover sur le trigger ET au focus (clavier-friendly).
 * — Reste ouvert tant que la souris est dans le panel (gap forgiveness).
 * — Se ferme avec un timeout court quand la souris quitte la zone trigger+panel.
 * — Panel large 640px, grid 2 colonnes × 3 lignes de feature cards.
 */
export function V2NavFeaturesDropdown() {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleClose() {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 120);
  }

  function cancelClose() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onFocus={() => {
          cancelClose();
          setOpen(true);
        }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[13.5px] font-medium transition-colors",
          "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
          open && "bg-neutral-100 text-neutral-900"
        )}
      >
        Fonctionnalités
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-50 mt-3 w-[640px] -translate-x-1/2"
          >
            {/* Petit triangle de "gap forgiveness" pour rejoindre le trigger sans fermer */}
            <div className="absolute -top-3 left-0 right-0 h-3" />

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.18)]">
              <div className="grid grid-cols-2 gap-1 p-2">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <Link
                      key={f.slug}
                      href={`/features/${f.slug}`}
                      onClick={() => setOpen(false)}
                      className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-neutral-50"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100 transition-colors group-hover:bg-primary-100 group-hover:text-primary-700"
                      >
                        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13.5px] font-semibold text-neutral-900">
                          {f.title}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-relaxed text-neutral-500">
                          {f.tagline}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600" />
                    </Link>
                  );
                })}
              </div>

              {/* Footer du panel — CTA discrète */}
              <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-4 py-3">
                <span className="text-[12px] text-neutral-500">
                  Tu paies l'abo, on s'occupe de tout.
                </span>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-primary-700 hover:text-primary-800"
                >
                  Démarrer un brief
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
