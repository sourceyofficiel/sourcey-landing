import Link from "next/link";
import { Mail } from "lucide-react";

/**
 * Auth layout — minimaliste, centré, mobile-first.
 *  - Single column
 *  - Logo en haut centré
 *  - Pas d'animation lourde
 *  - Inputs h-12 avec text-[16px] (anti-iOS-zoom)
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 items-start justify-center px-5 pb-8 pt-8 sm:items-center sm:py-12">
        <div className="w-full max-w-[400px]">
          {/* Logo centré en haut — AutoSAV */}
          <div className="mb-6 flex justify-center sm:mb-8">
            <Link
              href="/"
              aria-label="Accueil AutoSAV"
              className="inline-flex items-center gap-2 rounded-lg p-1 -m-1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-amber-200 sm:h-12 sm:w-12">
                <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="font-display text-[20px] font-extrabold tracking-tight text-neutral-900 sm:text-[22px]">
                AutoSAV
              </span>
            </Link>
          </div>

          {children}
        </div>
      </main>

      {/* Footer legal */}
      <footer className="px-5 pb-6 pt-4 text-center text-[11px] leading-relaxed text-neutral-400 sm:text-[11.5px]">
        En continuant, vous reconnaissez avoir compris et accepté les{" "}
        <Link
          href="#"
          className="text-neutral-500 underline-offset-2 hover:underline"
        >
          CGU
        </Link>{" "}
        et la{" "}
        <Link
          href="#"
          className="text-neutral-500 underline-offset-2 hover:underline"
        >
          Politique de confidentialité
        </Link>
        .
      </footer>
    </div>
  );
}
