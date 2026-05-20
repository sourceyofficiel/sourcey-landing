import Link from "next/link";
import Image from "next/image";

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
          {/* Logo centré en haut */}
          <div className="mb-6 flex justify-center sm:mb-8">
            <Link
              href="/"
              aria-label="Accueil Sourcey"
              className="inline-flex items-center rounded-lg p-1 -m-1"
            >
              <Image
                src="/logo/sourcey-mark.png"
                alt="Sourcey"
                width={56}
                height={56}
                className="h-11 w-11 sm:h-12 sm:w-12"
                priority
              />
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
