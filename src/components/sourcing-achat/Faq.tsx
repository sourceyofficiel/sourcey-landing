"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

const FAQ = [
  {
    q: "Quel est le MOQ minimum que vous gérez ?",
    a: "Ça dépend du produit, mais on travaille régulièrement avec des MOQs à partir de 50 unités pour les tests, jusqu'à plusieurs containers pour les commandes établies. On t'aide aussi à négocier le MOQ le plus bas possible avec les fournisseurs.",
  },
  {
    q: "Comment garantissez-vous la qualité des produits ?",
    a: "Notre équipe terrain inspecte physiquement chaque lot avant expédition selon la norme AQL 2.5. Tu reçois un rapport photo + vidéo détaillé, et si des défauts sont identifiés, l'usine reprend les pièces concernées sans surcoût — clause négociée à l'avance.",
  },
  {
    q: "Pouvez-vous gérer le packaging custom et l'étiquetage ?",
    a: "Oui. On gère le packaging custom (boîte, polybag, étiquette FNSKU pour Amazon FBA, etc.) et le marquage CE/origine. On valide une maquette avec toi avant de lancer la production de l'emballage.",
  },
  {
    q: "Faites-vous du OEM/ODM (produits sur mesure) ?",
    a: "Oui. Que tu apportes des specs précises (OEM) ou que tu veuilles co-développer un nouveau produit (ODM), on a les ateliers partenaires pour le faire. Compte 4-8 semaines supplémentaires pour le développement et le sample final.",
  },
  {
    q: "Quelle est la différence concrète entre Sourcing complet et Coordination ?",
    a: "Sourcing complet : tu pars de zéro, on trouve les fournisseurs, on négocie pour toi, on pilote tout. Pas de commission, juste l'abonnement. Coordination : tu as déjà un fournisseur en Chine, on fait juste les inspections + logistique. 5% de commission sur la valeur, sans abonnement.",
  },
  {
    q: "Combien de temps avant de recevoir ma marchandise en France ?",
    a: "Compte 3-7 jours pour le sourcing initial, 2-6 semaines pour la production selon la complexité, et 5-45 jours pour le transport selon le mode choisi. Total : 6-14 semaines de bout en bout pour un produit standard.",
  },
];

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="relative mx-auto max-w-[860px] px-5 py-20 md:px-8 md:py-24">
      <div className="text-center">
        <V2SectionLabel>FAQ</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Les questions{" "}
          <span className="text-primary-600">qu&apos;on nous pose souvent.</span>
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
