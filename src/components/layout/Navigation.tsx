"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "@/components/ui/Logo";
import { Button, buttonVariants } from "@/components/ui/Button";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { useScroll } from "@/components/ui/use-scroll";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/catalog", label: "Catalogue", highlight: false },
  { href: "/visual-search", label: "Visual Search", highlight: true },
  { href: "/match", label: "Match IA", highlight: false },
  { href: "/entreprise", label: "Entreprise", highlight: false },
  { href: "#pricing", label: "Tarifs", highlight: false },
];

export function Navigation() {
  const [open, setOpen] = useState(false);
  const scrolled = useScroll(10);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full border-b border-transparent transition-[max-width,top,padding,box-shadow] duration-300 ease-out",
        "md:max-w-[1100px] md:rounded-2xl md:border",
        {
          // Scrolled state on desktop: pill effect, smaller, floats with margin-top
          "bg-white/85 supports-[backdrop-filter]:bg-white/65 border-neutral-200/60 backdrop-blur-xl md:top-4 md:max-w-[920px] md:shadow-lg md:shadow-neutral-900/5":
            scrolled && !open,
          "bg-white/90 backdrop-blur-xl": open,
        }
      )}
    >
      <nav
        className={cn(
          "flex h-16 w-full items-center justify-between px-5 transition-[height,padding] duration-300 ease-out",
          "md:h-14 md:px-4",
          {
            "md:h-12 md:px-2": scrolled,
          }
        )}
      >
        <Link
          href="/"
          aria-label="Accueil Sourcey"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-lg -m-1 p-1"
        >
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "px-3 text-[13.5px] font-medium text-neutral-700",
                  link.highlight &&
                    "text-primary-700 hover:text-primary-800 [&_svg]:text-primary-500"
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-1.5 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Connexion</Link>
          </Button>
          <Button asChild variant="primary" size="sm" className="px-4">
            <Link href="/signup">Commencer</Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 md:hidden"
        >
          <MenuToggleIcon open={open} className="h-5 w-5" duration={300} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col overflow-hidden border-t border-neutral-200/60 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-full w-full flex-col justify-between gap-y-4 p-5"
            >
              <motion.ul
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
                className="grid gap-1.5"
              >
                {NAV_LINKS.map((link) => (
                  <motion.li
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="block rounded-2xl px-4 py-4 text-[17px] font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="flex flex-col gap-2"
              >
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Connexion
                  </Link>
                </Button>
                <Button asChild variant="primary" size="lg" className="w-full">
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Commencer gratuitement
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
