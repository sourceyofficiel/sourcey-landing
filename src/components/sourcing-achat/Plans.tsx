"use client";

import Link from "next/link";
import {
  Crown,
  Handshake,
  Check,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * 2 cards d'offres : Premium (sourcing complet) vs Basic (coordination).
 * Layout split 50/50 sur desktop, stack sur mobile.
 */

type Plan = {
  slug: "premium" | "basic";
  icon: LucideIcon;
  badgeLabel: string;
  badgeColor: string;
  title: string;
  pricing: string;
  pricingNote: string;
  description: string;
  bullets: string[];
  ctaLabel: string;
  highlighted: boolean;
};

const PLANS: Plan[] = [
  {
    slug: "premium",
    icon: Crown,
    badgeLabel: "Recommandé",
    badgeColor: "bg-gradient-to-r from-primary-500 to-primary-700",
    title: "Sourcing complet",
    pricing: "0% commission",
    pricingNote: "tu paies juste l'abonnement",
    description:
      "On gère tout pour toi : identification des fabricants, négociation, supervision de la production de masse et garanties qualité. Tu te concentres sur ta marque, on s'occupe de la chaîne d'approvisionnement.",
    bullets: [
      "Identification des fabricants vérifiés",
      "Négociation des prix en mandarin",
      "Supervision de la production de masse",
      "Contrôle qualité à chaque étape",
      "Garanties écrites sur les défauts",
      "Account manager dédié",
    ],
    ctaLabel: "Parler à un expert",
    highlighted: true,
  },
  {
    slug: "basic",
    icon: Handshake,
    badgeLabel: "Tu as déjà ton fournisseur",
    badgeColor: "bg-neutral-900",
    title: "Coordination",
    pricing: "5% de commission",
    pricingNote: "sur la valeur de tes commandes",
    description:
      "Tu as déjà un fournisseur en Chine ? On t'aide à le piloter : coordination des productions, inspections sur place, gestion de la logistique. Pas d'abonnement, juste une commission sur le volume.",
    bullets: [
      "Coordination avec ton fournisseur existant",
      "Inspection physique avant expédition",
      "Gestion des non-conformités",
      "Suivi logistique (transport, douane)",
      "Reporting régulier",
      "Pas d'abonnement, paiement à la commande",
    ],
    ctaLabel: "Démarrer une coordination",
    highlighted: false,
  },
];

export function Plans() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>2 façons de bosser ensemble</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(28px,3.8vw,44px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Choisis l&apos;option qui colle{" "}
          <span className="text-primary-600">à ta situation.</span>
        </h2>
        <p className="mt-4 text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Tu pars de zéro ? Le plan Sourcing complet est fait pour toi.
          Tu as déjà tes contacts ? On peut juste coordonner.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:gap-6 lg:grid-cols-2">
        {PLANS.map((plan) => (
          <PlanCard key={plan.slug} plan={plan} />
        ))}
      </div>
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const Icon = plan.icon;
  return (
    <div className="relative">
      {/* Gradient offset behind (style MySourcify) */}
      {plan.highlighted && (
        <div
          aria-hidden
          className="absolute -bottom-3 -right-3 inset-0 rounded-3xl bg-gradient-to-br from-primary-400 via-primary-500 to-violet-500"
        />
      )}

      <div
        className={`relative flex h-full flex-col rounded-3xl border bg-white p-6 md:p-8 ${
          plan.highlighted
            ? "border-white shadow-[0_30px_60px_-20px_rgba(15,23,42,0.18)]"
            : "border-neutral-200 shadow-sm"
        }`}
      >
        {/* Badge */}
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow ${plan.badgeColor}`}
        >
          {plan.slug === "premium" && (
            <Crown className="h-3 w-3" strokeWidth={2.5} />
          )}
          {plan.badgeLabel}
        </span>

        {/* Title + icon */}
        <div className="mt-5 flex items-center gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
              plan.highlighted
                ? "bg-gradient-to-br from-primary-500 to-primary-700"
                : "bg-neutral-900"
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <h3 className="font-display text-[22px] font-extrabold tracking-tight text-neutral-900 md:text-[26px]">
            {plan.title}
          </h3>
        </div>

        {/* Pricing */}
        <div className="mt-5 border-y border-neutral-100 py-4">
          <div className="font-display text-[28px] font-extrabold leading-none text-neutral-900 md:text-[34px]">
            {plan.pricing}
          </div>
          <div className="mt-1.5 text-[12.5px] text-neutral-500">
            {plan.pricingNote}
          </div>
        </div>

        {/* Description */}
        <p className="mt-5 text-[13.5px] leading-relaxed text-neutral-600 md:text-[14.5px]">
          {plan.description}
        </p>

        {/* Bullets */}
        <ul className="mt-5 space-y-2.5">
          {plan.bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-2 text-[13px] leading-snug text-neutral-700"
            >
              <Check
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-600"
                strokeWidth={3}
              />
              {b}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/signup"
          className={`mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-full pt-7 text-[13.5px] font-semibold transition-colors ${
            plan.highlighted
              ? "bg-gradient-to-b from-primary-500 to-primary-700 text-white hover:from-primary-400"
              : "border border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-50"
          }`}
          style={{
            marginTop: "auto",
            paddingTop: 0,
          }}
        >
          <span className="flex h-11 w-full items-center justify-center gap-2">
            {plan.ctaLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
