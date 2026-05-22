"use client";

import { Check, Minus, Crown, Handshake } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * Compare — tableau comparatif des 2 offres (Sourcing complet vs Coordination).
 * 10 lignes de features × 2 colonnes (premium, basic), check ou tiret.
 */

type Row = {
  label: string;
  premium: boolean | string;
  basic: boolean | string;
};

const ROWS: Row[] = [
  { label: "Identification des fabricants", premium: true, basic: false },
  { label: "Négociation des prix", premium: true, basic: false },
  { label: "Pilotage de la production", premium: true, basic: true },
  { label: "Inspection avant expédition", premium: true, basic: true },
  { label: "Gestion des non-conformités", premium: true, basic: true },
  { label: "Logistique & dédouanement", premium: true, basic: true },
  { label: "Account manager dédié", premium: true, basic: false },
  { label: "Échantillons gratuits négociés", premium: true, basic: false },
  { label: "Accès aux fournisseurs exclusifs", premium: true, basic: false },
  {
    label: "Modèle économique",
    premium: "Abonnement, 0% commission",
    basic: "5% commission sans abo",
  },
];

export function Compare() {
  return (
    <section className="relative mx-auto max-w-[1100px] px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Comparatif</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Sourcing complet ou Coordination&nbsp;:{" "}
          <span className="text-primary-600">quelle option ?</span>
        </h2>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.1)]">
        {/* Header row */}
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 border-b border-neutral-200 bg-neutral-50/60 px-5 py-4 md:gap-4 md:px-7">
          <div className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
            Feature
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-primary-700">
            <Crown className="h-3 w-3" />
            Sourcing complet
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wider text-neutral-700">
            <Handshake className="h-3 w-3" />
            Coordination
          </div>
        </div>

        {/* Rows */}
        <ul className="divide-y divide-neutral-100">
          {ROWS.map((row, i) => (
            <li
              key={row.label}
              className={`grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 px-5 py-3.5 md:gap-4 md:px-7 ${
                i % 2 === 1 ? "bg-neutral-50/30" : ""
              }`}
            >
              <div className="text-[13px] font-medium text-neutral-700 md:text-[13.5px]">
                {row.label}
              </div>
              <div className="flex justify-center">
                <Cell value={row.premium} highlighted />
              </div>
              <div className="flex justify-center">
                <Cell value={row.basic} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Cell({
  value,
  highlighted = false,
}: {
  value: boolean | string;
  highlighted?: boolean;
}) {
  if (typeof value === "string") {
    return (
      <span
        className={`text-center text-[11.5px] font-semibold leading-tight md:text-[12.5px] ${
          highlighted ? "text-primary-700" : "text-neutral-700"
        }`}
      >
        {value}
      </span>
    );
  }
  if (value) {
    return (
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full ${
          highlighted ? "bg-primary-100 text-primary-600" : "bg-green-50 text-green-600"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
      <Minus className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );
}
