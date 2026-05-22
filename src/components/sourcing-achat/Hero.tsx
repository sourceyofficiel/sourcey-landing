"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/**
 * Hero "Sourcing & Achat" — title centered + 2 photos produits côte à côte
 * sous le texte. Fond navy sombre cohérent avec le hero de la home.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0E1535] pt-24 md:pt-32">
      {/* Background gradient stripe + glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-0 top-0 h-full w-[55%] bg-gradient-to-bl from-primary-500 via-primary-600/40 to-transparent"
          style={{
            clipPath: "polygon(35% 0%, 100% 0%, 100% 100%, 70% 100%, 50% 50%)",
          }}
        />
        <div className="absolute right-[20%] top-[10%] h-[400px] w-[400px] rounded-full bg-primary-500/25 blur-[140px]" />
        <div className="absolute left-[10%] bottom-[10%] h-[300px] w-[300px] rounded-full bg-primary-400/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-5 pb-16 text-center md:px-8 md:pb-20">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
          Service
        </div>

        {/* Title */}
        <h1 className="mx-auto mt-6 max-w-[860px] font-display text-[clamp(36px,5.5vw,68px)] font-extrabold leading-[1.04] tracking-tight text-white">
          Sourcing &amp;{" "}
          <span className="bg-gradient-to-r from-primary-300 to-white bg-clip-text text-transparent">
            Achat en Chine
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-relaxed text-white/70 md:text-[16.5px]">
          Importer depuis la Chine n&apos;a jamais été aussi simple. Notre
          équipe terrain gère ton sourcing, négocie tes prix, contrôle la
          production et organise la livraison —{" "}
          <strong className="font-semibold text-white">de A à Z</strong>.
        </p>

        {/* CTA */}
        <div className="mt-9 flex justify-center">
          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl py-2 pl-6 pr-2 text-[14.5px] font-semibold text-white"
            style={{
              background: "linear-gradient(90deg, #3771ff -7.5%, #accfea 180%)",
              boxShadow:
                "0 10px 24px -8px rgba(55,113,255,0.5), inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 translate-y-full bg-[#000029] transition-transform duration-500 ease-out group-hover:translate-y-0"
            />
            <span className="relative z-10">Parler à un expert</span>
            <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white">
              <ArrowUpRight
                className="h-4 w-4 text-[#000029]"
                strokeWidth={2.5}
              />
            </span>
          </Link>
        </div>

        {/* 2 photos produits côte à côte */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 md:mt-16 md:gap-6">
          <HeroImage
            src="/images/sourcing/method-agent.png"
            alt="Pilotage de la production en Chine"
            tilt="-1deg"
          />
          <HeroImage
            src="/images/sourcing/trust-handshake.png"
            alt="Inspection qualité et échantillons fournisseurs"
            tilt="1deg"
          />
        </div>
      </div>
    </section>
  );
}

function HeroImage({
  src,
  alt,
  tilt,
}: {
  src: string;
  alt: string;
  tilt: string;
}) {
  return (
    <div
      className="relative"
      style={{ transform: `rotate(${tilt})` }}
    >
      {/* Gradient offset bleu → violet derrière */}
      <div
        aria-hidden
        className="absolute -bottom-3 -right-3 inset-0 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-violet-500"
      />
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-2 border-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
