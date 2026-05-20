"use client";

import { motion } from "motion/react";
import { Sparkles, Store, Warehouse } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { MagicCard } from "@/components/ui/magic-card";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const CASES = [
  {
    icon: Sparkles,
    name: "Marques DTC",
    volume: "5 000 – 30 000 unités / mois",
    description:
      "Vous lancez ou pilotez une marque direct-to-consumer en pleine croissance. Vous avez besoin de production fiable, de packaging custom et d'un partenaire qui suit votre rythme.",
    benefits: [
      "Packaging et étiquettes à vos couleurs",
      "Drop schedules synchronisés avec vos lancements",
      "Échantillonnage pré-production gratuit",
    ],
  },
  {
    icon: Store,
    name: "Distributeurs B2B",
    volume: "10 000 – 100 000 unités / mois",
    description:
      "Vous fournissez d'autres marques ou retailers. Marges serrées, gros volumes, exigences qualité strictes. Sourcey négocie pour vous au juste prix.",
    benefits: [
      "Audits qualité bi-mensuels",
      "Négociation contrats annuels",
      "Stock tampon dans notre entrepôt EU",
    ],
  },
  {
    icon: Warehouse,
    name: "Retailers omnicanal",
    volume: "30 000+ unités / mois",
    description:
      "Vous distribuez en boutique physique + e-com. Logistique complexe, déclinaisons régionales, traçabilité requise. On s'occupe de toute la chaîne.",
    benefits: [
      "Traçabilité unitaire (sérigraphie, RFID)",
      "Pre-pack pour magasins (par taille / variant)",
      "Reporting mensuel personnalisé",
    ],
  },
];

export function EnterpriseUseCases() {
  return (
    <Section id="cas-usage" className="bg-white">
      <Container>
        <SectionHeading
          eyebrow="Cas d'usage"
          eyebrowVariant="enterprise"
          title={
            <>
              Pensé pour les{" "}
              <span className="text-enterprise-600">structures qui scalent</span>
            </>
          }
          description="Trois profils de clients Entreprise, trois accompagnements taillés sur mesure."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {CASES.map((c, i) => (
            <motion.div key={c.name} variants={fadeUp} custom={i}>
              <MagicCard
                className="h-full rounded-3xl p-7"
                gradientFrom="#9333EA"
                gradientTo="#A855F7"
                gradientColor="#9333EA"
                gradientOpacity={0.08}
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-enterprise-50 text-enterprise-700">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-extrabold text-neutral-900">
                  {c.name}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-enterprise-700">
                  {c.volume}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                  {c.description}
                </p>

                <ul className="mt-5 space-y-2 border-t border-neutral-100 pt-5">
                  {c.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-enterprise-500" />
                      {b}
                    </li>
                  ))}
                </ul>
              </MagicCard>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
