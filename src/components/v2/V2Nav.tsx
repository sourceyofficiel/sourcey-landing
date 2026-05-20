"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/#pricing", label: "Tarifs" },
  { href: "/#about", label: "À propos" },
];

/**
 * Floating pill-shape navbar. Stays anchored just below the top banner with a
 * subtle gap; on mobile collapses to a hamburger that opens a full-screen menu.
 */
export function V2Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-0 z-40 w-full px-4 pt-4">
        <nav
          className={cn(
            "mx-auto flex h-14 max-w-[1300px] items-center justify-between gap-4 rounded-full border border-neutral-200 bg-white/95 px-4 backdrop-blur-md md:px-5",
            "shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
          )}
        >
          <Link
            href="/"
            aria-label="Accueil Sourcey"
            className="flex shrink-0 items-center rounded-lg -m-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Logo />
          </Link>

          {/* Center desktop links */}
          <ul className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-colors",
                    link.href === "/"
                      ? "text-neutral-900"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right CTAs desktop */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              href="/login"
              className="rounded-full px-3 py-1.5 text-[13.5px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              Démarrer
            </Link>
          </div>

          {/* Mobile burger */}
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </motion.button>
        </nav>
      </div>

      {/* Mobile drawer — opens as a contained card under the banner */}
      <AnimatePresence>
        {open && (
          <>
            {/* Soft backdrop — only dims the area BELOW the banner */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-x-0 bottom-0 top-10 z-40 bg-neutral-900/15 backdrop-blur-[2px] md:hidden"
            />

            {/* Floating card */}
            <motion.div
              key="card"
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-3 top-12 z-50 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.25)] md:hidden"
            >
              {/* Top bar — logo + close */}
              <div className="flex h-14 items-center justify-between px-4">
                <Logo />
                <motion.button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  whileTap={{ scale: 0.92 }}
                  initial={{ rotate: -45, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 45, scale: 0.8, opacity: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-sm"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>

              {/* Links — staggered cascade */}
              <motion.ul
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: {
                      staggerChildren: 0.055,
                      delayChildren: 0.12,
                    },
                  },
                  closed: {
                    transition: {
                      staggerChildren: 0.03,
                      staggerDirection: -1,
                    },
                  },
                }}
                className="grid gap-1 px-3 pt-2"
              >
                {LINKS.map((link) => (
                  <motion.li
                    key={link.href}
                    variants={{
                      open: {
                        opacity: 1,
                        x: 0,
                        transition: {
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      closed: { opacity: 0, x: -18 },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-3 text-[16px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Bottom CTAs — slide up from below */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{
                  duration: 0.4,
                  delay: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-3 grid gap-2 border-t border-neutral-100 p-3"
              >
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-neutral-300 bg-white px-4 py-3 text-center text-[15px] font-semibold text-neutral-900"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-neutral-900 px-4 py-3 text-center text-[15px] font-semibold text-white"
                >
                  Démarrer
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
