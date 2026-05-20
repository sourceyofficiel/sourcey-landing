"use client";

import { motion } from "motion/react";
import {
  UserCircle2,
  Briefcase,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    icon: UserCircle2,
    title: "Onboarding personnalisé",
    description:
      "Votre account manager vous contacte sous 24h. Audit de vos besoins, catégories prioritaires, volumes cibles, contraintes qualité.",
  },
  {
    n: "02",
    icon: Briefcase,
    title: "Agent dédié assigné",
    description:
      "On vous attribue un agent 100% pour vous, basé dans la ville chinoise la plus pertinente pour vos catégories. Vous ne le partagez avec personne.",
  },
  {
    n: "03",
    icon: ClipboardCheck,
    title: "SLA contractuel",
    description:
      "Délais de devis sous 24h, QC vidéo systématique, garantie qualité sur lot. Pénalités contractuelles si non-respect. On signe ce qu'on s'engage à faire.",
  },
  {
    n: "04",
    icon: BarChart3,
    title: "Reporting mensuel",
    description:
      "Rapport personnalisé chaque mois : économies réalisées vs marché, performance qualité, KPIs logistiques, recommandations stratégiques.",
  },
];

export function EnterpriseHow() {
  return (
    <Section className="bg-neutral-50">
      <Container>
        <SectionHeading
          eyebrow="Comment ça marche"
          eyebrowVariant="enterprise"
          title={
            <>
              Un parcours en{" "}
              <span className="text-enterprise-600">4 étapes</span>, sans
              friction
            </>
          }
          description="De la prise de contact à la livraison de votre premier conteneur, on vous accompagne à chaque étape."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4"
        >
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              variants={fadeUp}
              custom={i}
              className="relative rounded-3xl border border-neutral-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-enterprise-100 text-enterprise-700">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-neutral-300">
                  {step.n}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-neutral-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
