"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * FAQ accordéon — 5 questions classiques du pricing.
 * Une seule réponse ouverte à la fois pour rester clean.
 */

const FAQ = [
  {
    q: "Peut-on changer de plan à tout moment ?",
    a: "Oui. Tu peux passer à un plan supérieur ou inférieur depuis ton dashboard à tout moment. Le changement est appliqué immédiatement et le pro-rata est calculé automatiquement.",
  },
  {
    q: "Qu'est-ce qu'un brief de sourcing ?",
    a: "Un brief, c'est une demande de recherche de fournisseur que tu nous soumets via le dashboard : type de produit, quantité visée, budget, délais, certifications nécessaires. Notre équipe terrain identifie et te propose 3-5 options vérifiées.",
  },
  {
    q: "Comment fonctionne la réduction sur les commandes ?",
    a: "Après identification du fournisseur, tu peux passer ta commande directement via Sourcey. La réduction de ton plan (5%, 10% ou 15%) s'applique sur le prix fournisseur négocié. La réduction est visible avant validation, le total final apparaît dans ton dashboard.",
  },
  {
    q: "Que se passe-t-il si je ne suis pas satisfait ?",
    a: "Sur le plan Premium, si aucun fournisseur pertinent n'est trouvé sous 7 jours ouvrés, le mois en cours est remboursé. Sur tous les plans payants, tu peux résilier en 1 clic sans engagement.",
  },
  {
    q: "Quel plan choisir quand on débute ?",
    a: "Si tu testes une idée : Découvrir (gratuit) suffit pour 1 brief. Si tu lances ta première gamme produit : Essentiel à 29€ est le bon départ. Pour scaler avec plusieurs gammes et de la négo : Pro à 79€ est le plus rentable dès la première commande.",
  },
];

export function PricingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative mx-auto max-w-[860px] px-5 py-20 md:px-8 md:py-24">
      <div className="text-center">
        <V2SectionLabel>FAQ</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(24px,3.2vw,36px)] font-extrabold leading-[1.15] tracking-tight text-neutral-900">
          Les questions{" "}
          <span className="text-primary-600">qu&apos;on nous pose.</span>
        </h2>
      </div>

      <ul className="mt-10 space-y-3">
        {FAQ.map((item, i) => {
          const isOpen = openIdx === i;
          return (
            <li
              key={item.q}
              className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left md:px-6"
              >
                <span className="text-[14.5px] font-bold tracking-tight text-neutral-900 md:text-[15.5px]">
                  {item.q}
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-200",
                    isOpen && "rotate-180 text-primary-600"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="min-h-0">
                  <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-neutral-600 md:px-6 md:text-[14px]">
                    {item.a}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
