"use client";

import { PackageSearch, ClipboardCheck, Plane, type LucideIcon } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * Steps — 3 étapes du flux Sourcing/Achat.
 * Grid 3 cols sur desktop, stack sur mobile.
 */

type Step = {
  n: string;
  icon: LucideIcon;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    icon: PackageSearch,
    title: "Sourcing produit",
    body: "On identifie 3-5 fabricants vérifiés pour ton produit, on négocie prix, MOQ et conditions. Tu reçois un rapport comparatif sous 3-7 jours.",
  },
  {
    n: "02",
    icon: ClipboardCheck,
    title: "Production & contrôle qualité",
    body: "Acompte versé, production lancée. À mi-production et avant expédition, notre agent terrain inspecte le lot. Rapport photo + vidéo détaillé.",
  },
  {
    n: "03",
    icon: Plane,
    title: "Livraison internationale",
    body: "Choix du mode (express, aérien, maritime), dédouanement, taxes, assurance. Livraison DDP à ton entrepôt — pas de surcoûts à la réception.",
  },
];

export function Steps() {
  return (
    <section className="relative bg-neutral-50/60">
      <div className="mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[760px] text-center">
          <V2SectionLabel>Comment ça marche</V2SectionLabel>
          <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
            3 étapes,{" "}
            <span className="text-primary-600">un seul interlocuteur.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="relative rounded-3xl border border-neutral-200 bg-white p-6 md:p-7"
              >
                {/* Step number */}
                <div className="absolute -top-3 right-6 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-[11px] font-bold text-white shadow-md">
                  {step.n}
                </div>

                {/* Icon */}
                <span
                  className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700"
                  style={{
                    boxShadow: [
                      "inset 0 1px 0 rgba(255,255,255,0.35)",
                      "inset 0 -2px 0 rgba(15,40,100,0.4)",
                      "0 10px 20px -6px rgba(37,99,235,0.45)",
                    ].join(", "),
                  }}
                >
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </span>

                <h3 className="mt-5 text-[18px] font-bold leading-tight tracking-tight text-neutral-900 md:text-[20px]">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-neutral-500 md:text-[14px]">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
