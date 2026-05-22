"use client";

import { Percent, TrendingDown } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * Section "Réductions sur commandes".
 * Affiche les 4 taux par plan + un exemple chiffré concret sur 2 000€.
 */

const EXAMPLE_GROSS = 2000;

export function OrderDiscountSection() {
  return (
    <section className="relative mx-auto max-w-[1100px] px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Réductions sur commandes</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Ton abonnement{" "}
          <span className="text-primary-600">se rembourse vite.</span>
        </h2>
        <p className="mt-4 text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Chaque commande passée via Sourcey bénéficie d&apos;une réduction
          appliquée au prix fournisseur que nous avons négocié pour toi.
          Plus ton plan est élevé, plus la réduction est forte.
        </p>
      </div>

      {/* Grid des 4 taux */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.slug}
            className="rounded-2xl border border-neutral-200 bg-white p-5 text-center"
          >
            <div className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
              {p.name}
            </div>
            <div className="mt-3 font-display text-[36px] font-extrabold leading-none text-neutral-900">
              {p.orderDiscount > 0 ? `−${p.orderDiscount}%` : "0%"}
            </div>
            <div className="mt-1.5 text-[11.5px] text-neutral-500">
              {p.orderDiscount > 0
                ? "sur chaque commande"
                : "prix fournisseur standard"}
            </div>
          </div>
        ))}
      </div>

      {/* Exemple chiffré */}
      <div className="mt-10 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
              <TrendingDown className="h-6 w-6" />
            </span>
            <div>
              <div className="text-[11.5px] font-bold uppercase tracking-wider text-primary-700">
                Exemple
              </div>
              <div className="mt-0.5 font-display text-[20px] font-extrabold leading-tight text-neutral-900 md:text-[22px]">
                Commande de {EXAMPLE_GROSS.toLocaleString("fr-FR")}€
              </div>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {PLANS.filter((p) => p.orderDiscount > 0).map((p) => {
              const saved = (EXAMPLE_GROSS * p.orderDiscount) / 100;
              return (
                <li
                  key={p.slug}
                  className="rounded-xl border border-neutral-200 bg-white p-3 text-center"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Avec {p.name}
                  </div>
                  <div className="mt-1 font-display text-[20px] font-extrabold text-primary-600">
                    −{saved.toLocaleString("fr-FR")}€
                  </div>
                  <div className="text-[10.5px] text-neutral-500">économisés</div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 flex items-start gap-2.5 border-t border-primary-100 pt-5 text-[12.5px] text-neutral-600 md:text-[13px]">
          <Percent className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600" />
          <span>
            Pro se rembourse dès une commande de{" "}
            <strong className="text-neutral-900">790 €</strong>. La réduction
            s&apos;applique au prix fournisseur négocié par Sourcey, pas au
            prix catalogue public.
          </span>
        </div>
      </div>
    </section>
  );
}
