import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs particuliers", href: "#pricing" },
      { label: "Offre Entreprise", href: "/entreprise" },
      { label: "Agents en Chine", href: "#agents" },
      { label: "Comparaisons", href: "#comparison" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Centre d'aide", href: "/help" },
      { label: "Guide du sourcing", href: "/blog/guide" },
      { label: "Communauté Discord", href: "#" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/about" },
      { label: "Pour les marques", href: "/entreprise" },
      { label: "Devenir agent", href: "/agents/join" },
      { label: "Contact", href: "/contact" },
      { label: "Carrières", href: "/careers" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "CGV", href: "/legal/terms" },
      { label: "Confidentialité", href: "/legal/privacy" },
      { label: "Mentions légales", href: "/legal/mentions" },
      { label: "Cookies", href: "/legal/cookies" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-32 bg-neutral-900 text-neutral-300">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-neutral-700 to-transparent" />
      <Container className="py-20">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <Logo variant="mark" height={32} />
              <span className="text-[19px] font-extrabold text-white">
                Sourcey
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Le sourcing depuis la Chine, géré par des agents francophones.
              Pour les particuliers, les e-commerçants et les marques.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <SocialLink href="#" label="X (Twitter)">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialLink>
              <SocialLink href="#" label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </SocialLink>
              <SocialLink href="#" label="YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialLink>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 sm:flex-row">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Sourcey. Tous droits réservés. Fait avec
            ❤️ pour les e-commerçants francophones.
          </p>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-soft" />
            Tous les systèmes opérationnels
          </div>
        </div>
      </Container>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900 text-neutral-400 transition-all hover:border-neutral-700 hover:bg-neutral-800 hover:text-white"
    >
      {children}
    </Link>
  );
}
