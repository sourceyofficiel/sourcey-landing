import Link from "next/link";

/**
 * Top promo banner. Full-width black bar with single-line message + link.
 * Mirrors HRFusion's banner pattern (subtle, dismissable-feeling, never noisy).
 */
export function V2TopBanner() {
  return (
    <div className="flex h-10 w-full items-center justify-center bg-neutral-900 px-4 text-center text-[12.5px] text-white">
      <span className="opacity-90">
        Démarrage gratuit, sans carte bancaire.{" "}
      </span>
      <Link
        href="/pricing"
        className="ml-1 font-semibold underline-offset-4 hover:underline"
      >
        En savoir plus
      </Link>
    </div>
  );
}
