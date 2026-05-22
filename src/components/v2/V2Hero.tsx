"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ShieldCheck,
  Truck,
  FileText,
} from "lucide-react";

/**
 * V2Hero — banner sombre avec gradient bleu diagonal + image + cards
 * flottantes. Inspiré du style MySourcify, adapté DA Sourcey.
 *
 * Desktop : 2 cols (texte gauche + image avec floating cards à droite)
 * Mobile  : stack vertical, l'image se centre sous le texte, seules les
 *          cards essentielles (Vérifié + Brief validé) restent visibles.
 */
export function V2Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0E1535]">
      {/* === Diagonal blue gradient stripe à droite === */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute right-0 top-0 h-full w-[55%] bg-gradient-to-bl from-primary-500 via-primary-600/40 to-transparent"
          style={{
            clipPath:
              "polygon(35% 0%, 100% 0%, 100% 100%, 70% 100%, 50% 50%)",
          }}
        />
        {/* Subtle radial glow */}
        <div className="absolute right-[20%] top-[20%] h-[400px] w-[400px] rounded-full bg-primary-500/20 blur-[120px]" />
      </div>

      {/* === Contenu === */}
      <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* === LEFT : texte === */}
          <div className="text-white">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1 pl-1 pr-4 text-[11.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600">
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
              </span>
              Sourcing managé
            </div>

            {/* Title */}
            <h1 className="mt-6 font-display text-[clamp(34px,5.5vw,68px)] font-extrabold leading-[1.04] tracking-tight md:mt-8">
              Le sourcing en Chine,
              <br />
              <span className="text-primary-300">géré pour toi</span>.
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-[520px] text-[14.5px] leading-relaxed text-white/70 md:mt-7 md:text-[16px]">
              Trouver des fournisseurs fiables et assurer une production sans
              accroc peut s&apos;avérer complexe.{" "}
              <strong className="font-semibold text-white">
                Sourcey prend en charge l&apos;intégralité du processus
              </strong>
              , de la sélection des fournisseurs à la livraison internationale.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10">
              <Link
                href="/signup"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-primary-500 to-primary-700 py-3 pl-6 pr-2 text-[14.5px] font-semibold text-white shadow-[0_14px_30px_-8px_rgba(37,99,235,0.6),inset_0_1px_0_rgba(255,255,255,0.25)]"
              >
                Démarrer un brief
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-900">
                  <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                </span>
              </Link>
            </div>

            {/* Marketplace mentions (logos textuels) */}
            <div className="mt-10 md:mt-14">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-white/40">
                Plateformes sourcées
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                {["Alibaba", "1688", "Taobao", "Made-in-China", "JD"].map(
                  (name) => (
                    <span
                      key={name}
                      className="text-[13.5px] font-bold text-white/40 transition-colors hover:text-white/70 md:text-[15px]"
                    >
                      {name}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* === RIGHT : image + floating cards === */}
          <div className="relative">
            {/* Image principale */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-3xl bg-neutral-200 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] ring-1 ring-white/10 lg:max-w-none">
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85&auto=format&fit=crop"
                alt="Réception d'une commande Sourcey"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Floating card 1 — top-left pill "Brief validé" */}
            <div className="absolute left-2 top-6 hidden items-center gap-2 rounded-full border border-white/20 bg-white/95 px-3 py-2 text-[12px] font-semibold text-neutral-900 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.35)] backdrop-blur-md sm:flex lg:-left-6">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              Brief validé
            </div>

            {/* Floating card 2 — middle "Suivi commande" */}
            <div className="absolute bottom-[32%] left-2 hidden w-[225px] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md md:block lg:-left-10">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                  <Truck className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <span className="text-[12.5px] font-bold text-neutral-900">
                  Suivi commande
                </span>
              </div>
              <ul className="mt-3 space-y-1.5 text-[11.5px]">
                <li className="flex items-center gap-2 text-neutral-700">
                  <Check
                    className="h-3 w-3 text-primary-600"
                    strokeWidth={3}
                  />
                  Fournisseur sélectionné
                </li>
                <li className="flex items-center gap-2 text-neutral-700">
                  <Check
                    className="h-3 w-3 text-primary-600"
                    strokeWidth={3}
                  />
                  En production
                </li>
                <li className="flex items-center gap-2 text-neutral-400">
                  <span className="block h-3 w-3 rounded-full border border-neutral-300" />
                  Expédition à venir
                </li>
              </ul>
            </div>

            {/* Floating card 3 — bottom-right "Devis envoyé" */}
            <div className="absolute -bottom-2 right-2 hidden w-[215px] rounded-2xl border border-white/20 bg-white/95 p-4 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-md sm:block lg:-right-6 lg:bottom-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 text-white">
                  <FileText className="h-3.5 w-3.5" strokeWidth={2.2} />
                </span>
                <span className="text-[12.5px] font-bold text-neutral-900">
                  Devis envoyé
                </span>
              </div>
              <div className="mt-3 font-display text-[24px] font-extrabold leading-none text-neutral-900">
                2 100€
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-neutral-100 pt-2.5 text-[10.5px]">
                <div>
                  <div className="text-neutral-400">Délai</div>
                  <div className="font-semibold text-neutral-900">7 jours</div>
                </div>
                <div className="text-right">
                  <div className="text-neutral-400">Réf.</div>
                  <div className="font-mono font-semibold text-neutral-900">
                    SC-0487
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card 4 — top-right pill "Vérifié sur place" (visible mobile aussi) */}
            <div className="absolute right-2 top-6 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/95 px-3 py-1.5 text-[11px] font-bold text-neutral-900 shadow-md backdrop-blur-md lg:-right-4">
              <ShieldCheck className="h-3 w-3 text-primary-600" />
              Vérifié sur place
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
