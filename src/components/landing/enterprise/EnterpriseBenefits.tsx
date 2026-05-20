"use client";

import { motion } from "motion/react";
import {
  Warehouse,
  Receipt,
  Cable,
  ShieldCheck,
  Plane,
  HeadphonesIcon,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { NumberTicker } from "@/components/ui/number-ticker";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const BENEFITS = [
  {
    icon: Warehouse,
    title: "Entrepôt EU intégré",
    description:
      "Stockage en Pays-Bas + Allemagne. Livraison J+1 dans toute l'UE. 3PL inclus.",
  },
  {
    icon: Receipt,
    title: "TVA EU + IOSS",
    description:
      "On gère toute la fiscalité : déclaration TVA, IOSS sur envois <150€, droits de douane.",
  },
  {
    icon: Cable,
    title: "API privée",
    description:
      "Intégration directe à votre ERP ou WMS. Webhooks, REST, batch CSV. Documentation complète.",
  },
  {
    icon: Plane,
    title: "Visites d'usine",
    description:
      "1 à 2 visites organisées par an sur place en Chine, accompagnement bilingue inclus.",
  },
  {
    icon: ShieldCheck,
    title: "SLA contractuel",
    description:
      "Devis sous 24h, QC vidéo garanti, taux de qualité ≥95%. Engagements sur le papier.",
  },
  {
    icon: HeadphonesIcon,
    title: "Support 24/7",
    description:
      "WhatsApp dédié + ligne d'urgence. Astreinte le weekend pour les comptes Entreprise.",
  },
];

export function EnterpriseBenefits() {
  return (
    <Section className="bg-white">
      <Container>
        <SectionHeading
          eyebrow="Bénéfices"
          eyebrowVariant="enterprise"
          title={
            <>
              Tout ce dont une marque a besoin,{" "}
              <span className="text-enterprise-600">centralisé</span>
            </>
          }
          description="Pas de patchwork de prestataires. Un seul partenaire, un seul interlocuteur, une seule facture."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              custom={i}
              className="group relative rounded-3xl border border-neutral-200 bg-white p-7 transition-all hover:border-enterprise-200 hover:shadow-lg"
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-enterprise-100/40 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-enterprise-50 text-enterprise-700">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="relative mt-5 text-lg font-bold text-neutral-900">
                {b.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-neutral-600">
                {b.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-12 grid gap-4 rounded-3xl border border-enterprise-100 bg-gradient-to-br from-enterprise-50/60 via-white to-white p-8 md:grid-cols-4"
        >
          {[
            { value: 38, suffix: "%", label: "Économie moyenne" },
            { value: 11, suffix: " j", label: "Délai EU moyen" },
            { value: 98, suffix: "%", label: "Taux QC validé" },
            { value: 14, suffix: "", label: "Agents en Chine" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i}
              className="text-center md:border-r md:border-neutral-200 md:last:border-r-0"
            >
              <p className="font-display text-4xl font-extrabold tracking-tight text-enterprise-700">
                <NumberTicker value={s.value} className="text-enterprise-700" />
                {s.suffix}
              </p>
              <p className="mt-1 text-sm text-neutral-600">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
