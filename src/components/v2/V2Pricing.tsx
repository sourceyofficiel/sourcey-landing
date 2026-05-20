"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * V2Pricing — 3 plans côte à côte. Pro mis en avant.
 */

type Plan = {
  name: string;
  price: string;
  period?: string;
  description: string;
  badge?: string;
  highlight?: boolean;
  features: string[];
  cta: string;
  href: string;
};

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "0€",
    period: "/mois",
    description:
      "Pour découvrir Sourcey et tester ton premier produit sans engagement.",
    features: [
      "1 demande de sourcing/mois",
      "Accès au catalogue négocié",
      "Messagerie avec agent",
      "Vidéo QC standard",
      "Support email",
    ],
    cta: "Commencer gratuitement",
    href: "/signup?plan=starter",
  },
  {
    name: "Pro",
    price: "79€",
    period: "/mois",
    badge: "Plus populaire",
    highlight: true,
    description: "Pour les marques en croissance qui sourcent régulièrement.",
    features: [
      "10 demandes de sourcing/mois",
      "Agent dédié francophone",
      "Vidéo QC + photos HD",
      "Traduction FR ↔ ZH illimitée",
      "Intégration Shopify + WooCommerce",
      "Account manager dédié",
      "Support prioritaire 6j/7",
    ],
    cta: "Passer Pro",
    href: "/signup?plan=pro",
  },
  {
    name: "Business",
    price: "Sur devis",
    description:
      "Pour les marques établies avec des volumes importants et besoins custom.",
    features: [
      "Sourcing illimité",
      "Équipe d'agents multi-villes",
      "Audit fournisseurs sur place",
      "Compliance & certifications custom",
      "API & intégrations sur mesure",
      "SLA et reporting mensuel",
    ],
    cta: "Nous contacter",
    href: "mailto:hello@sourcey.fr?subject=Plan Business Sourcey",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function V2Pricing() {
  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
    >
      <V2SectionLabel>Tarifs</V2SectionLabel>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Choisis ton plan,
        <br className="hidden md:block" />{" "}
        <span className="italic text-primary-600">change-le quand tu veux.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto mt-5 max-w-[580px] text-center text-[15px] text-neutral-500"
      >
        Sans engagement. Sans frais cachés. Tu paies ce que tu utilises.
      </motion.p>

      {/* Plans */}
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {PLANS.map((plan, i) => (
          <motion.article
            key={plan.name}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`group relative flex flex-col gap-6 rounded-3xl p-7 md:p-8 ${
              plan.highlight
                ? "border-2 border-primary-600 bg-gradient-to-br from-primary-50/40 via-white to-white shadow-[0_30px_60px_-30px_rgba(37,99,235,0.4)] md:scale-[1.03]"
                : "border border-neutral-200/80 bg-white"
            }`}
          >
            {/* Subtle blue glow background — contained inside the card */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-36 w-36 overflow-hidden rounded-tl-3xl transition-opacity duration-300 group-hover:opacity-80"
              style={{
                backgroundImage:
                  "radial-gradient(circle at top left, #DBEAFE 0%, transparent 70%)",
                opacity: 0.55,
                mixBlendMode: "multiply",
              }}
            />

            {/* Most popular badge */}
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                  {plan.badge}
                </span>
              </div>
            )}

            {/* Header */}
            <div>
              <h3 className="text-[20px] font-bold text-neutral-900">
                {plan.name}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-500">
                {plan.description}
              </p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-1">
              <span className="font-display text-[42px] font-extrabold leading-none tracking-tight text-neutral-900">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-[14px] font-medium text-neutral-500">
                  {plan.period}
                </span>
              )}
            </div>

            {/* CTA */}
            <Link
              href={plan.href}
              className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-[14px] font-semibold transition-all ${
                plan.highlight
                  ? "bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                  : "border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 hover:-translate-y-0.5"
              }`}
            >
              {plan.cta}
            </Link>

            {/* Features */}
            <ul className="flex flex-col gap-2.5 border-t border-neutral-100 pt-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                      plan.highlight
                        ? "bg-primary-600 text-white"
                        : "bg-neutral-100 text-neutral-700"
                    }`}
                  >
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  <span className="text-[13.5px] leading-relaxed text-neutral-700">
                    {f}
                  </span>
                </li>
              ))}
            </ul>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
