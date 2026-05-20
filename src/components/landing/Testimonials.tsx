"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Star, TrendingUp, Quote } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { testimonials } from "@/lib/data/testimonials";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function Testimonials() {
  return (
    <Section className="bg-neutral-50">
      <Container>
        <SectionHeading
          eyebrow="Témoignages"
          title={
            <>
              Ils ont arrêté de{" "}
              <span className="text-primary-600">stresser</span> sur leur
              sourcing
            </>
          }
          description="Des e-commerçants français qui scalent avec Sourcey."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={stagger}
          className="mt-14 grid gap-5 md:grid-cols-3"
        >
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.id}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4 }}
              transition={{
                opacity: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
                y: { type: "spring", stiffness: 250, damping: 22 },
              }}
              className="group relative flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-lg"
            >
              <Quote className="absolute right-6 top-6 h-8 w-8 text-primary-100" />

              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>

              <blockquote className="mt-5 text-[15px] leading-relaxed text-neutral-700">
                « {t.quote} »
              </blockquote>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-primary-50/60 p-3">
                <TrendingUp className="h-4 w-4 shrink-0 text-primary-700" />
                <p className="text-sm font-bold text-primary-700">{t.result}</p>
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
      </Container>
    </Section>
  );
}
