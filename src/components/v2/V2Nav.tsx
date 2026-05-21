"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { V2NavFeaturesDropdown } from "@/components/v2/V2NavFeatures";
import { FEATURES } from "@/lib/features-data";

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
 * V2Nav — full-width sticky navbar avec glassmorphism (border-b + backdrop-blur).
 *
 * Style "Notion / Linear" : nav flush en haut, fond translucide qui laisse
 * voir le contenu qui scroll derrière. Sur mobile, un sheet slide depuis
 * la gauche (au lieu du drawer top-floating de la version précédente).
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
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200/60 bg-white/85 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70">
        <nav className="mx-auto flex h-16 max-w-[1300px] items-center justify-between gap-4 px-5 md:px-8">
          {/* Logo */}
          <Link
            href="/"
            aria-label="Accueil Sourcey"
            className="flex shrink-0 items-center rounded-md -m-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Logo />
          </Link>

          {/* Center links — desktop */}
          <ul className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
            <li>
              <Link
                href="/"
                className="rounded-md px-3 py-1.5 text-[13.5px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                Accueil
              </Link>
            </li>
            <li>
              <V2NavFeaturesDropdown />
            </li>
            {LINKS.filter((l) => l.href !== "/").map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-1.5 text-[13.5px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right CTAs — desktop */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            {user ? (
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-3.5 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <User className="h-3 w-3" />
                </span>
                <span>Mon profil{firstName ? ` · ${firstName}` : ""}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md border border-neutral-200 bg-white px-3.5 py-2 text-[13.5px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className="rounded-md bg-neutral-900 px-3.5 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  Démarrer
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <motion.button
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-900 md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </motion.button>
        </nav>
      </header>

      {/* Mobile sheet — slide from LEFT */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop transparent — capture les clics pour fermer mais sans assombrir */}
            <div
              key="backdrop"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 md:hidden"
              aria-hidden
            />

            {/* Sheet */}
            <motion.aside
              key="sheet"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col border-r border-neutral-200/60 bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/85 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
            >
              {/* Top bar */}
              <div className="flex h-16 items-center justify-between border-b border-neutral-200/60 px-5">
                <Logo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-900 transition-colors hover:bg-neutral-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 overflow-y-auto p-3">
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: {
                      transition: { staggerChildren: 0.04, delayChildren: 0.1 },
                    },
                    hidden: {},
                  }}
                  className="grid gap-0.5"
                >
                  {/* Accueil */}
                  <motion.li
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.3 },
                      },
                    }}
                  >
                    <Link
                      href="/"
                      onClick={() => setOpen(false)}
                      className="flex items-center rounded-md px-3 py-2.5 text-[14.5px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                      Accueil
                    </Link>
                  </motion.li>

                  {/* Fonctionnalités — accordéon */}
                  <motion.li
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.3 },
                      },
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setFeaturesOpen((v) => !v)}
                      aria-expanded={featuresOpen}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-[14.5px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
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
                          <div className="ml-3 mt-1 grid gap-0.5 border-l border-neutral-200 pl-3">
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
                                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-neutral-700 transition-colors hover:bg-neutral-100"
                                  >
                                    <Icon
                                      className="h-3.5 w-3.5 text-primary-600"
                                      strokeWidth={2}
                                    />
                                    {f.title}
                                  </Link>
                                </li>
                              );
                            })}
                          </div>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.li>

                  {LINKS.filter((l) => l.href !== "/").map((link) => (
                    <motion.li
                      key={link.href}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.3 },
                        },
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center rounded-md px-3 py-2.5 text-[14.5px] font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
                      >
                        {link.label}
                      </Link>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Footer CTAs */}
              <div className="grid gap-2 border-t border-neutral-200/60 p-4">
                {user ? (
                  <Link
                    href="/app"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800"
                  >
                    <User className="h-4 w-4" />
                    Mon profil{firstName ? ` · ${firstName}` : ""}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-neutral-800"
                    >
                      Démarrer
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
