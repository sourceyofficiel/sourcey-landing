"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import { Factory, UserCheck, PackageCheck } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Usine",
    role: "On trouve",
    description:
      "On identifie la bonne usine en Chine, on négocie le prix au juste, on vérifie la fiabilité (audit qualité, certifs, historique).",
    icon: Factory,
    image:
      "https://images.unsplash.com/photo-1567789884554-0b844b597180?w=800&q=80&auto=format&fit=crop",
    color: "bg-primary-50 text-primary-700 border-primary-100",
  },
  {
    n: "02",
    title: "Agent",
    role: "On contrôle",
    description:
      "Notre agent francophone va sur place, contrôle la qualité, filme une vidéo QC complète, et organise l'expédition.",
    icon: UserCheck,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    n: "03",
    title: "Toi",
    role: "Tu reçois",
    description:
      "Le colis arrive chez toi ou direct chez ton client. Tracking en temps réel. Sans stress, sans intermédiaire douteux.",
    icon: PackageCheck,
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80&auto=format&fit=crop",
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
];

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  return (
    <Section id="how-it-works" className="bg-white">
      <Container>
        <SectionHeading
          eyebrow="Comment ça marche"
          title={
            <>
              Le sourcing en{" "}
              <span className="text-primary-600">3 étapes simples</span>
            </>
          }
          description="Tu choisis le produit. On gère absolument tout le reste, de l'usine jusqu'à ta porte."
        />

        <div ref={containerRef} className="relative mt-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={stagger}
            className="grid gap-6 md:grid-cols-3 md:gap-5"
          >
            {STEPS.map((step, i) => {
              const refs = [step1Ref, step2Ref, step3Ref];
              return (
                <motion.div
                  key={step.n}
                  variants={fadeUp}
                  custom={i}
                  className="relative"
                >
                  <motion.div
                    ref={refs[i]}
                    whileHover={{ y: -6 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 22,
                    }}
                    className="group relative h-full overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <span
                        className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${step.color}`}
                      >
                        <step.icon className="h-3.5 w-3.5" />
                        {step.title}
                      </span>
                      <span className="absolute right-4 top-4 font-mono text-[11px] font-bold text-white/80">
                        {step.n}
                      </span>
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        {step.role}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-neutral-900">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="pointer-events-none absolute inset-0 hidden md:block">
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step1Ref}
              toRef={step2Ref}
              gradientStartColor="#3B82F6"
              gradientStopColor="#10B981"
              pathColor="#cbd5e1"
              pathOpacity={0.4}
              duration={3}
              curvature={-40}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={step2Ref}
              toRef={step3Ref}
              gradientStartColor="#10B981"
              gradientStopColor="#F59E0B"
              pathColor="#cbd5e1"
              pathOpacity={0.4}
              duration={3}
              delay={0.6}
              curvature={-40}
            />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center text-sm text-neutral-500"
        >
          C'est la simplicité radicale qui fait la valeur. ✦
        </motion.p>
      </Container>
    </Section>
  );
}
