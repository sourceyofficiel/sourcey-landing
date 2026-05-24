import Link from "next/link";
import { Mail, Check, Sparkles, Truck, Inbox, BookOpen, Clock } from "lucide-react";

/**
 * Auth layout style Mailjet :
 *   - Colonne GAUCHE (50%) : pitch marketing + 5 features bullet + footer légal
 *   - Colonne DROITE (50%) : form rendu par {children}
 *
 * Sur mobile : single column, on cache la marketing column.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* === LEFT PANEL : marketing === */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-50/80 via-amber-50/40 to-emerald-100/50 px-10 py-10 lg:flex">
        {/* Decorative pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(6,95,70) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo top */}
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-amber-200">
              <Mail className="h-4 w-4" />
            </div>
            <span className="font-display text-[20px] font-extrabold tracking-tight text-neutral-900">
              AutoSAV
            </span>
          </Link>
        </div>

        {/* Center pitch */}
        <div className="relative max-w-[440px]">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-200/60">
            <Sparkles className="h-3 w-3" />
            Essai 14 jours gratuit
          </div>
          <h2 className="mt-5 font-display text-[clamp(28px,3.5vw,38px)] font-extrabold leading-[1.1] tracking-tight text-emerald-800">
            Pour automatiser ton SAV
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
            Les fonctionnalités essentielles et faciles à prendre en main pour
            répondre vite et bien à tes clients.
          </p>

          {/* Features bullet list */}
          <ul className="mt-8 space-y-4">
            {[
              { icon: Sparkles, label: "Drafts IA en français natif" },
              { icon: Truck, label: "Suivi Colissimo intégré dans les drafts" },
              { icon: Inbox, label: "Gmail, Outlook, IONOS — une seule inbox" },
              { icon: BookOpen, label: "Knowledge base personnalisable" },
              { icon: Clock, label: "Setup en 8 minutes, pas 3 jours" },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <li key={f.label} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-amber-100">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                  <span className="text-[14.5px] font-medium text-neutral-700">
                    {f.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer left */}
        <footer className="relative">
          <p className="text-[12px] text-neutral-500">
            © 2026 AutoSAV. Tous droits réservés
            <span className="mx-2">·</span>
            <Link href="#" className="hover:text-emerald-700">
              CGU
            </Link>
            <span className="mx-2">|</span>
            <Link href="#" className="hover:text-emerald-700">
              Confidentialité
            </Link>
            <span className="mx-2">|</span>
            <Link href="#" className="hover:text-emerald-700">
              Cookies
            </Link>
          </p>
        </footer>
      </aside>

      {/* === RIGHT PANEL : form (rendered by children) === */}
      <main className="flex flex-col bg-white">
        {/* Mobile-only header with logo */}
        <header className="border-b border-neutral-100 px-5 py-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-amber-200">
              <Mail className="h-4 w-4" />
            </div>
            <span className="font-display text-[17px] font-extrabold tracking-tight text-neutral-900">
              AutoSAV
            </span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 md:px-10">
          <div className="w-full max-w-[440px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
