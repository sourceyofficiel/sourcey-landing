"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * V2WhoFor — 2 colonnes Solo vs Marque DTC.
 * Chaque visiteur choisit son camp et se sent adressé.
 */

const PROFILES = [
  {
    badge: "Solo e-commerçant",
    title: "Tu testes des produits sans te ruiner",
    accent: "primary",
    items: [
      "MOQ accessibles à partir de 50 unités",
      "Pas besoin d'être enregistré SARL",
      "Tu gardes le contrôle de ton stock",
      "Catalogue déjà négocié, prêt à dropshipper",
      "Service client dispo 6j/7 en français",
    ],
    cta: "Voir Plan Starter (gratuit)",
    href: "/signup?plan=starter",
  },
  {
    badge: "Marque DTC",
    title: "Tu scales ta marque sans casser la chaîne",
    accent: "neutral",
    items: [
      "Production custom à partir de 500 unités",
      "Packaging, étiquettes, marquage à ta marque",
      "Multi-fournisseurs gérés par ton agent",
      "Intégration Shopify/Wordpress synchronisée",
      "Account manager dédié + reportings mensuels",
    ],
    cta: "Voir Plan Pro",
    href: "/signup?plan=pro",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export function V2WhoFor() {
  return (
    <section
      id="for-who"
      className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28"
    >
      <V2SectionLabel>Pour qui</V2SectionLabel>

      {/* Title */}
      <motion.h2
        className="mx-auto max-w-[760px] text-center font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Que tu sois solo ou DTC,
        <br className="hidden md:block" />{" "}
        <span className="italic text-primary-600">tu as ta place ici.</span>
      </motion.h2>

      {/* 2 columns */}
      <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {PROFILES.map((profile, i) => {
          const isPrimary = profile.accent === "primary";
          return (
            <motion.article
              key={profile.badge}
              className={`group relative flex flex-col gap-5 overflow-hidden rounded-3xl border p-7 transition-all duration-300 md:p-9 ${
                isPrimary
                  ? "border-primary-200 bg-gradient-to-br from-primary-50/60 via-white to-white shadow-[0_30px_60px_-30px_rgba(37,99,235,0.25)]"
                  : "border-neutral-200 bg-white"
              }`}
            >
              {/* Decorative corner accent */}
              {isPrimary && (
                <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-gradient-to-br from-primary-100/60 to-transparent" />
              )}

              {/* Subtle blue glow background — radial blob top-left */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-12 -top-12 h-48 w-48 transition-opacity duration-300 group-hover:opacity-80"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, #DBEAFE 0%, transparent 70%)",
                  opacity: 0.5,
                  mixBlendMode: "multiply",
                }}
              />

              {/* Badge */}
              <div className="relative">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-wider ${
                    isPrimary
                      ? "bg-primary-600 text-white"
                      : "bg-neutral-900 text-white"
                  }`}
                >
                  {profile.badge}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-[22px] font-bold leading-tight tracking-tight text-neutral-900 md:text-[26px]">
                {profile.title}
              </h3>

              {/* List */}
              <ul className="grid gap-3">
                {profile.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        isPrimary
                          ? "bg-primary-100 text-primary-700"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    <span className="text-[14.5px] leading-relaxed text-neutral-700">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={profile.href}
                className={`mt-auto inline-flex items-center justify-center rounded-full px-5 py-3 text-[14px] font-semibold transition-all ${
                  isPrimary
                    ? "bg-gradient-to-b from-primary-500 to-primary-700 text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                    : "border border-neutral-300 bg-white text-neutral-900 hover:border-neutral-400 hover:-translate-y-0.5"
                }`}
              >
                {profile.cta} →
              </a>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
