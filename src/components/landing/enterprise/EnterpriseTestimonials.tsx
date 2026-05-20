"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Quote, TrendingUp } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const ENTREPRISE_TESTIMONIALS = [
  {
    quote:
      "Avant Sourcey, on gérait 4 prestataires différents : usine, contrôleur indépendant, transitaire, 3PL. Aujourd'hui, on a un seul interlocuteur. Le gain en charge mentale est inestimable.",
    name: "Élise Marchand",
    role: "COO, Nordic Apparel",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    result: "4 prestataires → 1 partenaire",
    company: "Nordic Apparel · DTC mode",
  },
  {
    quote:
      "Le SLA contractuel a été décisif. Quand vous fournissez 200 boutiques en France et que vos délais glissent, c'est rédhibitoire. Sourcey tient ses engagements, même sur des volumes inhabituels.",
    name: "Antoine Renaud",
    role: "Directeur Achats, Atelier France",
    avatar: "https://randomuser.me/api/portraits/men/57.jpg",
    result: "0 rupture en 18 mois",
    company: "Atelier France · Distribution B2B",
  },
  {
    quote:
      "L'entrepôt EU intégré nous a permis de passer en J+1 sur toute l'Europe. Pour notre conversion e-com, c'est un changement de paradigme.",
    name: "Yasmine Berrada",
    role: "CEO, Studio Hause",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    result: "Délais EU divisés par 3",
    company: "Studio Hause · Décoration DTC",
  },
];

export function EnterpriseTestimonials() {
  return (
    <Section className="bg-neutral-50">
      <Container>
        <SectionHeading
          eyebrow="Ils nous font confiance"
          eyebrowVariant="enterprise"
          title={
            <>
              Des marques qui scalent{" "}
              <span className="text-enterprise-600">sereinement</span>
            </>
          }
          description="Trois retours d'expérience de nos clients Entreprise actuels."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-14 grid gap-5 md:grid-cols-3"
        >
          {ENTREPRISE_TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              variants={fadeUp}
              custom={i}
              className="group relative flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-enterprise-100" />

              <blockquote className="text-[15px] leading-relaxed text-neutral-700">
                « {t.quote} »
              </blockquote>

              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-enterprise-50/60 p-3">
                <TrendingUp className="h-4 w-4 shrink-0 text-enterprise-700" />
                <p className="text-sm font-bold text-enterprise-700">
                  {t.result}
                </p>
              </div>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 rounded-3xl border border-dashed border-neutral-300 bg-white/50 p-6 text-center"
        >
          <p className="text-sm text-neutral-500">
            <strong className="text-neutral-700">Logos clients</strong> :
            disponibles sur demande après NDA. Une dizaine de marques DTC
            françaises et européennes nous font déjà confiance.
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}
