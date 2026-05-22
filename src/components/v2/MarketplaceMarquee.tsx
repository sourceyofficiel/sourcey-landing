"use client";

/**
 * MarketplaceMarquee — bandeau infini des plateformes sourcées.
 *
 * 100% texte (pas de dépendance externe / CDN) pour garantir une
 * perf solide et zéro bug d'image cassée. L'animation CSS `marquee`
 * est définie dans globals.css.
 *
 * La liste est dupliquée dans le DOM pour que la boucle CSS
 * (translateX 0 → -50%) soit invisible (= seamless).
 */

const MARKETPLACES = [
  "Alibaba",
  "1688",
  "Taobao",
  "Made-in-China",
  "JD.com",
  "AliExpress",
  "DHgate",
];

export function MarketplaceMarquee() {
  return (
    <div
      aria-label="Plateformes que nous sourçons"
      className="relative w-full overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
    >
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap py-1 md:gap-14">
        {/* Liste dupliquée pour boucle seamless */}
        {[...MARKETPLACES, ...MARKETPLACES].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="shrink-0 text-[15px] font-extrabold tracking-tight text-white/45 transition-colors hover:text-white md:text-[17px]"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
