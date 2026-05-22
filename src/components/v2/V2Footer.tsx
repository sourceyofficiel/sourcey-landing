import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
} from "lucide-react";

/**
 * V2Footer — clean flat footer en dark blue Sourcey.
 * Inspiration : style "Clause" footer (dark, multi-cols, contact à gauche,
 * socials à droite). Adapté à la palette primary Sourcey.
 *
 * Layout :
 *   - Top : Logo + contact (gauche) | 3 colonnes de liens (centre/droite)
 *   - Bottom (séparé par un trait subtle) : © (gauche) | social icons (droite)
 *
 * Pas de card arrondie — full width, flat, fonds dark slate-blue.
 */

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Comment ça marche", href: "/#how-it-works" },
      { label: "Fonctionnalités", href: "/#features" },
      { label: "Tarifs", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Compte",
    links: [
      { label: "Créer un compte", href: "/signup" },
      { label: "Connexion", href: "/login" },
      { label: "Mon profil", href: "/app/profile" },
      { label: "Mes commandes", href: "/app/orders" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "mailto:hello@sourcey.fr" },
      { label: "Messagerie", href: "/app/inbox" },
      { label: "Témoignages", href: "/#testimonials" },
    ],
  },
];

const SOCIALS = [
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
];

export function V2Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0E1535] text-white">
      <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-20">
        {/* === TOP : Brand + contact + Link columns === */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-5 md:gap-10">
          {/* Brand + contact block (spans 2 cols on desktop) */}
          <div className="md:col-span-2">
            {/* Logo */}
            <Link
              href="/"
              aria-label="Accueil Sourcey"
              className="inline-flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                <Image
                  src="/logo/sourcey-mark.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
              </span>
              <span className="font-display text-[20px] font-extrabold tracking-tight text-white">
                Sourcey
              </span>
            </Link>

            {/* Contact info */}
            <div className="mt-6 grid gap-3">
              <a
                href="mailto:hello@sourcey.fr"
                className="inline-flex items-center gap-2.5 text-[13px] text-white/70 transition-colors hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Mail className="h-3.5 w-3.5" />
                </span>
                hello@sourcey.fr
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2.5 text-[13px] text-white/70 transition-colors hover:text-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <MessageCircle className="h-3.5 w-3.5" />
                </span>
                Rejoindre le Discord
              </a>
            </div>
          </div>

          {/* Link columns wrapper :
              - Mobile : 2 colonnes pour Produit + Entreprise, Ressources sur sa propre ligne (full width)
              - Desktop : `contents` → rejoint la grille parent md:grid-cols-5 */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:contents">
            {COLUMNS.map((col, i) => (
              <div
                key={col.title}
                // Sur mobile : la 3e colonne (Ressources) prend toute la largeur
                className={i === 2 ? "col-span-2 md:col-span-1" : ""}
              >
                <h4 className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white md:text-[12px]">
                  {col.title}
                </h4>
                <ul className="mt-4 grid gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[13px] text-white/65 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* === BOTTOM : © + Social icons === */}
        <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-6 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-white/50">
            <span>© 2026 Sourcey · Tous droits réservés</span>
            <span className="hidden h-3 w-px bg-white/20 md:block" />
            <Link
              href="#"
              className="transition-colors hover:text-white"
            >
              Mentions légales
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-white"
            >
              CGU
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-white"
            >
              Confidentialité
            </Link>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ label, icon: Icon, href }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
