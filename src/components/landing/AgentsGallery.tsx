"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Star, MapPin, BadgeCheck, ArrowRight } from "lucide-react";
import { Container, Section, SectionHeading } from "@/components/ui/Container";
import { agents } from "@/lib/data/agents";
import { Button } from "@/components/ui/Button";
import { fadeUp, viewportOnce } from "@/lib/motion";

export function AgentsGallery() {
  return (
    <Section id="agents" className="bg-white">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            align="left"
            eyebrow="Nos agents"
            title={
              <>
                Des humains que tu peux{" "}
                <span className="text-primary-600">nommer</span>
              </>
            }
            description="Chaque agent est basé en Chine, parle français, et a été vérifié en personne par notre équipe."
          />
          <Button asChild variant="secondary" size="md">
            <Link href="/agents">
              Voir tous les agents
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Container>

      <div className="mask-fade-sides mt-12 overflow-x-auto scrollbar-hide">
        <motion.ul
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          className="flex w-max items-stretch gap-5 px-6 lg:px-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]"
        >
          {agents.map((agent, i) => (
            <motion.li
              key={agent.id}
              variants={fadeUp}
              custom={i * 0.3}
              className="w-[280px] shrink-0"
            >
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  <Image
                    src={agent.avatar}
                    alt={agent.fullName}
                    fill
                    sizes="280px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  {agent.verified && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-primary-700 backdrop-blur">
                      <BadgeCheck className="h-3 w-3" />
                      Vérifié
                    </span>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-1 text-xs font-medium opacity-90">
                      <MapPin className="h-3 w-3" />
                      {agent.city}, Chine
                    </div>
                    <p className="mt-1 text-xl font-extrabold leading-tight">
                      {agent.fullName}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{agent.rating.toFixed(1)}</span>
                      <span className="opacity-70">· {agent.missions} missions</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Spécialités
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {agent.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500">
                    <span>Parle :</span>
                    {agent.languages.map((l) => (
                      <span
                        key={l}
                        className="rounded bg-primary-50 px-1.5 py-0.5 text-primary-700"
                      >
                        {l.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </Section>
  );
}
