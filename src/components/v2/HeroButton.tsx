"use client";

import Link from "next/link";

/**
 * HeroButton — CTA primaire du hero, style MySourcify.
 *
 * - Background : gradient bleu clair (90deg, #3771ff → #accfea)
 * - Icon box : carré blanc 36px avec flèche up-right en navy
 * - Hover : un overlay navy slide-up depuis le bas, l'icône tourne 90°,
 *   et la flèche se "duplique" (la 1ère part en haut-droite, la 2e
 *   arrive du bas-gauche)
 *
 * Implémenté en CSS-in-JS / Tailwind plutôt qu'en classes utilitaires
 * Tailwind pures parce que l'effet morph d'arrow nécessite plusieurs
 * pseudo-éléments coordonnés.
 */
export function HeroButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Link href={href} className="hero-cta">
        <span className="hero-cta__text">
          <span className="hero-cta__label">{children}</span>
        </span>
        <span className="hero-cta__icon">
          <span className="hero-cta__arrows">
            <span className="hero-cta__arrow" />
            <span className="hero-cta__arrow" />
          </span>
        </span>
      </Link>

      <style jsx>{`
        .hero-cta {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 8px 8px 24px;
          color: #fff;
          font-size: 14.5px;
          font-weight: 600;
          text-decoration: none;
          border-radius: 14px;
          overflow: hidden;
          background: linear-gradient(90deg, #3771ff -7.5%, #accfea 180%);
          transition: transform 0.3s ease;
          isolation: isolate;
        }
        .hero-cta:hover {
          transform: translateY(-1px);
        }

        /* Overlay navy qui slide-up au hover */
        .hero-cta::before {
          content: "";
          position: absolute;
          inset: 0;
          background: #000029;
          transform: translateY(100%);
          transition: transform 0.5s ease;
          z-index: 1;
        }
        .hero-cta:hover::before {
          transform: translateY(0);
        }

        .hero-cta__text {
          position: relative;
          z-index: 2;
          height: 20px;
          overflow: hidden;
          display: block;
        }
        .hero-cta__label {
          display: block;
          transition: transform 0.4s ease;
        }
        .hero-cta:hover .hero-cta__label {
          transform: translateY(-50%);
        }

        /* Icon box blanc */
        .hero-cta__icon {
          position: relative;
          z-index: 2;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: transform 0.5s ease;
        }
        .hero-cta:hover .hero-cta__icon {
          transform: rotate(0deg);
        }

        /* Container des 2 flèches qui se relaient */
        .hero-cta__arrows {
          position: relative;
          width: 12px;
          height: 12px;
        }
        .hero-cta__arrow {
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' fill='none'%3E%3Cpath fill='%23000029' fill-rule='evenodd' d='M2.54.406h-.657V1.72h5.469L.597 8.474l-.464.464.929.928.464-.464L8.28 2.647v5.47h1.313V.406H2.539Z' clip-rule='evenodd'/%3E%3C/svg%3E")
            no-repeat center / contain;
          transition:
            transform 0.5s ease,
            opacity 0.5s ease;
        }
        /* Flèche 1 : visible au repos, s'envole en haut-droite au hover */
        .hero-cta__arrow:nth-child(1) {
          opacity: 1;
          transform: translate(0, 0);
        }
        .hero-cta:hover .hero-cta__arrow:nth-child(1) {
          opacity: 0;
          transform: translate(14px, -14px);
        }
        /* Flèche 2 : cachée bas-gauche au repos, arrive au hover */
        .hero-cta__arrow:nth-child(2) {
          opacity: 0;
          transform: translate(-10px, 10px);
        }
        .hero-cta:hover .hero-cta__arrow:nth-child(2) {
          opacity: 1;
          transform: translate(0, 0);
        }
      `}</style>
    </>
  );
}
