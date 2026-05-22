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
 * Style "Notion / Linear". Scroll-aware : si `transparentTop` est true,
 * la navbar démarre en mode sombre transparent (texte blanc) pour s'aligner
 * avec un hero dark. Une fois scroll > 80px, transition vers white-glass.
 */
export function V2Nav({
  user,
  transparentTop = false,
}: {
  user?: NavUser;
  transparentTop?: boolean;
} = {}) {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const firstName = user?.fullName?.split(" ")[0] ?? "";

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Track scroll position pour basculer le mode dark → white-glass
  useEffect(() => {
    if (!transparentTop) return;
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentTop]);

  // Mode actuel : dark (transparent + texte blanc) vs light (white-glass + texte sombre)
  const darkMode = transparentTop && !scrolled;

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-colors duration-300",
          darkMode
            ? // Dark mode: navy solid sans border ni blur → fusion totale avec le hero
              "bg-[#0E1535]"
            : // Light: white-glass classique avec border + blur
              "border-b border-neutral-200/60 bg-white/85 backdrop-blur-lg supports-[backdrop-filter]:bg-white/70"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[1300px] items-center justify-between gap-4 px-5 md:px-8">
          {/* Logo — variante white quand le navbar est en dark mode */}
          <Link
            href="/"
            aria-label="Accueil Sourcey"
            className="flex shrink-0 items-center rounded-md -m-1 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Logo variant={darkMode ? "white" : "full"} />
          </Link>

          {/* Center links — desktop */}
          <ul className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
            <li>
              <Link
                href="/"
                className={cn(
                  "rounded-md px-3 py-1.5 text-[13.5px] font-medium transition-colors",
                  darkMode
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                Accueil
              </Link>
            </li>
            <li>
              <V2NavFeaturesDropdown darkMode={darkMode} />
            </li>
            {LINKS.filter((l) => l.href !== "/").map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-[13.5px] font-medium transition-colors",
                    darkMode
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
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
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13.5px] font-semibold transition-colors",
                  darkMode
                    ? "bg-white text-neutral-900 hover:bg-white/90"
                    : "bg-neutral-900 text-white hover:bg-neutral-800"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    darkMode ? "bg-neutral-900/10" : "bg-white/15"
                  )}
                >
                  <User className="h-3 w-3" />
                </span>
                <span>Mon profil{firstName ? ` · ${firstName}` : ""}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "rounded-md border px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                    darkMode
                      ? "border-white/20 bg-white/5 text-white hover:bg-white/15"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  )}
                >
                  Connexion
                </Link>
                <Link
                  href="/signup"
                  className={cn(
                    "rounded-md px-3.5 py-2 text-[13.5px] font-semibold transition-colors",
                    darkMode
                      ? "bg-white text-neutral-900 hover:bg-white/90"
                      : "bg-neutral-900 text-white hover:bg-neutral-800"
                  )}
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
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors md:hidden",
              darkMode
                ? "border-white/20 bg-white/10 text-white"
                : "border-neutral-200 bg-white text-neutral-900"
            )}
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
                    <AnimatePresence>
                      {featuresOpen && (
                        <motion.ul
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
