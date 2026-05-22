"use client";

import { Coins, Repeat, CalendarClock } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * Section "Comment Sourcey se rémunère" — transparence sur le modèle éco.
 * 3 blocs : commission fournisseur · réassorts · MRR abos.
 */

const PILLARS = [
  {
    icon: Coins,
    title: "Commission sur commandes",
    body: "3 à 6% perçus auprès du fournisseur grâce au volume que nous lui apportons. Tu ne paies jamais cette commission — elle est intégrée au prix qu'il nous accorde.",
  },
  {
    icon: Repeat,
    title: "Réassorts récurrents",
    body: "Chaque client qui réassort le même produit génère une commission automatique. Ça aligne nos intérêts : on cherche des fournisseurs avec qui tu vas rester longtemps.",
  },
  {
    icon: CalendarClock,
    title: "MRR abonnements",
    body: "Les plans 29€, 79€ et 149€/mois constituent notre revenu prévisible. C'est ce qui nous permet d'avoir une équipe terrain en Chine en permanence.",
  },
];

export function PassiveRevenueSection() {
  return (
    <section className="relative mx-auto max-w-[1100px] px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Notre modèle</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(24px,3.2vw,36px)] font-extrabold leading-[1.15] tracking-tight text-neutral-900">
          Pas de coûts cachés.{" "}
          <span className="text-primary-600">Voilà comment on gagne.</span>
        </h2>
      </div>

      <ul className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <li
              key={p.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-5 text-[15.5px] font-bold tracking-tight text-neutral-900 md:text-[16.5px]">
                {p.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-neutral-500 md:text-[13.5px]">
                {p.body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
