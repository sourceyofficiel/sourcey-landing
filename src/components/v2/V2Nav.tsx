"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { V2NavFeaturesDropdown } from "@/components/v2/V2NavFeatures";
import { FEATURES } from "@/lib/features-data";

// "Fonctionnalités" est géré séparément comme dropdown (V2NavFeaturesDropdown).
const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/pricing", label: "Tarifs" },
  { href: "/faq", label: "FAQ" },
];

type NavUser = {
  fullName: string | null;
  email: string;
} | null;

/**
 * Floating pill-shape navbar. Stays anchored just below the top banner with a
 * subtle gap; on mobile collapses to a hamburger that opens a full-screen menu.
 *
 * If `user` is provided → affiche "Mon profil" à la place de Connexion / Démarrer.
 */
export function V2Nav({ user }: { user?: NavUser } = {}) {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const firstName = user?.fullName?.split(" ")[0] ?? "";

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
            {/* Accueil */}
            <li>
              <Link
                href="/"
                className="rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-neutral-900 transition-colors"
              >
                Accueil
              </Link>
            </li>

            {/* Fonctionnalités → dropdown */}
            <li>
              <V2NavFeaturesDropdown />
            </li>

            {/* Tarifs + FAQ */}
            {LINKS.filter((l) => l.href !== "/").map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 text-[13.5px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right CTAs desktop */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {user ? (
              // Connected → show "Mon profil" pill
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3.5 py-1.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <User className="h-3 w-3" />
                </span>
                <span>Mon profil{firstName ? ` · ${firstName}` : ""}</span>
              </Link>
            ) : (
              // Anonymous → show Connexion + Démarrer
              <>
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
              </>
            )}
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
                {/* Accueil */}
                <motion.li
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
                    href="/"
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-[16px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
                  >
                    Accueil
                  </Link>
                </motion.li>

                {/* Fonctionnalités — accordéon mobile */}
                <motion.li
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
                  <button
                    type="button"
                    onClick={() => setFeaturesOpen((v) => !v)}
                    aria-expanded={featuresOpen}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-[16px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
                  >
                    <span>Fonctionnalités</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-neutral-500 transition-transform duration-200",
                        featuresOpen && "rotate-180"
                      )}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {featuresOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <li className="pt-1">
                          <ul className="ml-2 grid gap-0.5 border-l border-neutral-200 pl-3">
                            {FEATURES.map((f) => {
                              const Icon = f.icon;
                              return (
                                <li key={f.slug}>
                                  <Link
                                    href={`/features/${f.slug}`}
                                    onClick={() => {
                                      setOpen(false);
                                      setFeaturesOpen(false);
                                    }}
                                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-100"
                                  >
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
                                      <Icon
                                        className="h-4 w-4"
                                        strokeWidth={2}
                                      />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block text-[14px] font-semibold text-neutral-900">
                                        {f.title}
                                      </span>
                                      <span className="block text-[12px] text-neutral-500">
                                        {f.tagline}
                                      </span>
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.li>

                {/* Tarifs + FAQ */}
                {LINKS.filter((l) => l.href !== "/").map((link) => (
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
                {user ? (
                  <Link
                    href="/app"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-3 text-[15px] font-semibold text-white"
                  >
                    <User className="h-4 w-4" />
                    Mon profil
                    {firstName ? ` · ${firstName}` : ""}
                  </Link>
                ) : (
                  <>
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
                  </>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
