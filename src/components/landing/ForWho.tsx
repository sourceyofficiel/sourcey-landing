"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  User,
  Building2,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MagicCard } from "@/components/ui/magic-card";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function ForWho() {
  return (
    <Section className="bg-neutral-50">
      <Container>
        <SectionHeading
          eyebrow="Pour qui ?"
          title={
            <>
              Que tu démarres ou que tu{" "}
              <span className="text-primary-600">scales</span>, on est là
            </>
          }
          description="Deux offres distinctes pour deux besoins différents. Tu peux commencer petit et grandir avec nous."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            className="rounded-3xl"
          >
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 250, damping: 22 }}
              className="rounded-3xl"
            >
            <MagicCard
              className="rounded-3xl p-8 lg:p-10"
              gradientFrom="#3B82F6"
              gradientTo="#60A5FA"
              gradientColor="#3B82F6"
              gradientOpacity={0.1}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary-200/30 blur-3xl" />

              <div className="flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-600 text-white shadow-brand">
                  <User className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  À partir de 0€
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-extrabold text-neutral-900">
                Particuliers & e-commerçants
              </h3>
              <p className="mt-2 text-neutral-600">
                Tu démarres ton e-com ou tu testes des produits. On
                t'accompagne sans engagement, à ton rythme.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Petites quantités OK (à partir de 10 unités)",
                  "Sans engagement, annulation 1 clic",
                  "Tarif à partir de 29€/mois",
                  "Plan gratuit pour démarrer",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-100">
                      <Check
                        className="h-3 w-3 text-primary-700"
                        strokeWidth={3}
                      />
                    </span>
                    <span className="text-[15px] text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant="primary" size="lg" className="mt-8">
                <Link href="#pricing">
                  Voir les plans particuliers
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </MagicCard>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={fadeUp}
            custom={1}
            className="rounded-3xl"
          >
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 250, damping: 22 }}
              className="rounded-3xl"
            >
            <MagicCard
              className="rounded-3xl p-8 lg:p-10"
              gradientFrom="#9333EA"
              gradientTo="#C084FC"
              gradientColor="#9333EA"
              gradientOpacity={0.1}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-enterprise-200/30 blur-3xl" />

              <div className="flex items-start justify-between">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-enterprise-600 text-white shadow-enterprise">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-enterprise-50 px-3 py-1 text-xs font-semibold text-enterprise-700">
                  <Sparkles className="h-3 w-3" />
                  Sur devis
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-extrabold text-neutral-900">
                Entreprises & marques
              </h3>
              <p className="mt-2 text-neutral-600">
                Tu gères une marque DTC ou tu fais du gros volume. On te dédie
                un agent 100% et un account manager.
              </p>

              <ul className="mt-6 space-y-3">
                {[
                  "Agent 100% dédié, pas partagé",
                  "Visites d'usine organisées sur demande",
                  "Entrepôt EU inclus + 3PL",
                  "Tarif sur devis personnalisé",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-enterprise-100">
                      <Check
                        className="h-3 w-3 text-enterprise-700"
                        strokeWidth={3}
                      />
                    </span>
                    <span className="text-[15px] text-neutral-700">{item}</span>
                  </li>
                ))}
              </ul>

              <Button asChild variant="enterprise" size="lg" className="mt-8">
                <Link href="/entreprise">
                  Voir l'offre Entreprise
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </MagicCard>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
