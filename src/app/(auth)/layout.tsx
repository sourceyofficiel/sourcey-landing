import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, ShieldCheck, Users } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/**
 * Auth layout — split design pro.
 *
 *  Mobile : formulaire pleine largeur, panneau marketing caché
 *  Desktop : 2 colonnes 1:1 → form left, marketing right (dark blue)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ===========================================================
          LEFT — Form
          =========================================================== */}
      <div className="relative flex min-h-screen flex-col bg-white">
        {/* Subtle grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            backgroundImage: `
              linear-gradient(to right, #f0f0f0 1px, transparent 1px),
              linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
            `,
            backgroundSize: "1.5rem 1.5rem",
            maskImage:
              "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, transparent 30%, transparent 70%, black 100%)",
          }}
        />

        {/* Header : logo + back link */}
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <Link
            href="/"
            aria-label="Accueil Sourcey"
            className="inline-flex items-center gap-2 rounded-lg p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-semibold text-neutral-600 shadow-sm transition-colors hover:border-neutral-300 hover:text-neutral-900"
          >
            <ArrowLeft className="h-3 w-3" />
            Retour
          </Link>
        </header>

        {/* Form container */}
        <main className="flex flex-1 items-center justify-center px-6 pb-10 md:px-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>

        {/* Footer mini */}
        <footer className="px-6 pb-6 text-center text-[11.5px] text-neutral-400 md:px-10">
          © 2026 Sourcey ·{" "}
          <Link href="#" className="underline-offset-2 hover:underline">
            Mentions légales
          </Link>{" "}
          ·{" "}
          <Link href="#" className="underline-offset-2 hover:underline">
            Confidentialité
          </Link>
        </footer>
      </div>

      {/* ===========================================================
          RIGHT — Marketing panel (desktop only)
          =========================================================== */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Decorative glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-primary-400/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-500/25 blur-3xl"
        />

        {/* Top — Trust badge */}
        <div className="relative inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          Plateforme sécurisée · RGPD
        </div>

        {/* Center — Main pitch */}
        <div className="relative">
          <h2 className="font-display text-[clamp(28px,3vw,40px)] font-extrabold leading-[1.15] tracking-tight text-white">
            Le sourcing en Chine,
            <br />
            <span className="italic text-primary-200">enfin sans stress.</span>
          </h2>

          <p className="mt-5 max-w-[440px] text-[15px] leading-relaxed text-white/70">
            Un agent humain francophone gère ta commande de A à Z. Négociation,
            QC vidéo, logistique. Tu reçois exactement ce que tu as validé.
          </p>

          {/* Feature checklist */}
          <ul className="mt-8 grid gap-3">
            {[
              "Agent dédié sur place en Chine",
              "Vidéo QC obligatoire avant expédition",
              "Paiement sécurisé escrow",
              "Livraison porte-à-porte en 10 jours",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2.5 text-[14px] text-white/85"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom — Social proof */}
        <div className="relative">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            {/* Stacked avatars */}
            <div className="flex -space-x-2">
              {[
                "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=faces&q=80",
                "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop&crop=faces&q=80",
                "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop&crop=faces&q=80",
              ].map((src, i) => (
                <Image
                  key={i}
                  src={src}
                  alt=""
                  width={56}
                  height={56}
                  className="h-8 w-8 rounded-full border-2 border-primary-700 object-cover"
                />
              ))}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white">
                <Users className="h-3.5 w-3.5" />
                500+ marques DTC
              </div>
              <p className="text-[12px] text-white/60">
                Sourcent déjà avec Sourcey
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
