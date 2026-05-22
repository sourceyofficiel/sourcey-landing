"use client";

import Image from "next/image";

/**
 * MarketplaceMarquee — bandeau infini des plateformes sourcées.
 *
 * Utilise Simple Icons CDN (cdn.simpleicons.org) pour les logos qui y existent,
 * et un wordmark stylé custom pour ceux qui n'y sont pas (1688, Made-in-China).
 *
 * Animation : keyframe CSS `marquee` qui translate X de 0 à -50% en boucle.
 * La liste est dupliquée dans le DOM pour que la boucle soit invisible.
 */

type Marketplace = {
  name: string;
  /** slug Simple Icons (ex: "alibabadotcom") — null si pas dispo */
  simpleIconSlug: string | null;
  /** Couleur d'accent du wordmark fallback (utilisée si pas de slug) */
  accentColor?: string;
};

const MARKETPLACES: Marketplace[] = [
  { name: "Alibaba", simpleIconSlug: "alibabadotcom" },
  { name: "1688", simpleIconSlug: null, accentColor: "#FF6A00" },
  { name: "Taobao", simpleIconSlug: "taobao" },
  { name: "Made-in-China", simpleIconSlug: null, accentColor: "#E60012" },
  { name: "JD", simpleIconSlug: "jd" },
  { name: "AliExpress", simpleIconSlug: "aliexpress" },
];

export function MarketplaceMarquee() {
  // On duplique la liste 2x pour que la boucle CSS (translate -50%) soit fluide
  const doubled = [...MARKETPLACES, ...MARKETPLACES];

  return (
    <div
      aria-label="Plateformes que nous sourçons"
      className="relative overflow-hidden"
      style={{
        // Fade-out sur les bords pour que les logos arrivent/partent en douceur
        maskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <div className="animate-marquee flex w-max items-center gap-10 md:gap-14">
        {doubled.map((m, i) => (
          <MarketplaceItem key={`${m.name}-${i}`} marketplace={m} />
        ))}
      </div>
    </div>
  );
}

function MarketplaceItem({ marketplace }: { marketplace: Marketplace }) {
  if (marketplace.simpleIconSlug) {
    return (
      <div
        className="flex h-8 shrink-0 items-center"
        title={marketplace.name}
      >
        <Image
          src={`https://cdn.simpleicons.org/${marketplace.simpleIconSlug}/ffffff`}
          alt={marketplace.name}
          width={120}
          height={32}
          className="h-7 w-auto opacity-60 transition-opacity hover:opacity-100"
          style={{ width: "auto" }}
          unoptimized
        />
      </div>
    );
  }

  // Fallback : wordmark texte stylé
  return (
    <span
      className="shrink-0 text-[18px] font-extrabold tracking-tight text-white/60 transition-colors hover:text-white md:text-[20px]"
      title={marketplace.name}
    >
      {marketplace.name}
    </span>
  );
}
