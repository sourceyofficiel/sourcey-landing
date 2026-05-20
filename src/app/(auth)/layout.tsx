import Link from "next/link";
import Image from "next/image";

/**
 * Auth layout — minimaliste, centré (style Notion / Linear).
 *  - Single column
 *  - Logo en haut centré
 *  - Beaucoup d'espace blanc
 *  - Pas de panneau marketing
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      <main className="relative flex flex-1 items-center justify-center px-5 py-12 md:py-16">
        <div className="w-full max-w-[400px]">
          {/* Logo centré en haut */}
          <div className="mb-8 flex justify-center">
            <Link
              href="/"
              aria-label="Accueil Sourcey"
              className="inline-flex items-center rounded-lg p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <Image
                src="/logo/sourcey-mark.png"
                alt="Sourcey"
                width={56}
                height={56}
                className="h-12 w-12"
                priority
              />
            </Link>
          </div>

          {children}
        </div>
      </main>

      {/* Footer legal */}
      <footer className="px-5 pb-8 text-center text-[11.5px] leading-relaxed text-neutral-400">
        En continuant, vous reconnaissez avoir compris et accepté les{" "}
        <Link
          href="#"
          className="text-neutral-500 underline-offset-2 hover:underline"
        >
          Conditions générales
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
