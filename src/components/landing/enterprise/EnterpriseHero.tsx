"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, ShieldCheck, Sparkles, Building2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AuroraText } from "@/components/ui/aurora-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function EnterpriseHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-enterprise-50/40 via-white to-white pt-10 md:pt-16 lg:pt-20">
      <AnimatedGridPattern
        numSquares={24}
        maxOpacity={0.1}
        duration={4}
        repeatDelay={0.8}
        className={cn(
          "[mask-image:radial-gradient(560px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[160%] skew-y-12 text-enterprise-500/40"
        )}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-enterprise-200/30 blur-[120px]" />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-enterprise-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-enterprise-700 shadow-sm backdrop-blur"
            >
              <Building2 className="h-3.5 w-3.5" />
              Offre dédiée aux marques et gros volumes
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="mt-6 font-display text-[clamp(36px,5.5vw,60px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900"
            >
              Votre supply chain Chine,{" "}
              <AuroraText
                colors={["#9333EA", "#7E22CE", "#3B82F6", "#A855F7"]}
              >
                gérée par des humains
              </AuroraText>{" "}
              qui parlent votre langue.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease }}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-neutral-600"
            >
              Sourcey Entreprise met à votre disposition un agent dédié basé en
              Chine, un account manager côté France, et un entrepôt EU intégré.
              Tout est négocié, contrôlé et expédié pour vous.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild variant="enterprise" size="xl">
                <Link href="#contact">
                  Demander un devis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl">
                <Link href="#cas-usage">Voir les cas d'usage</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.75, ease }}
              className="mt-8 grid grid-cols-3 gap-4 border-t border-neutral-200 pt-6"
            >
              <Metric value="< 24h" label="Devis garanti" />
              <Metric value="-38%" label="Coût moyen vs Alibaba" />
              <Metric value="98%" label="Taux QC validé" />
            </motion.div>
          </div>

          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-extrabold leading-none tracking-tight text-enterprise-700">
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease }}
      className="relative z-0 mx-auto w-full max-w-xl lg:max-w-none"
    >
      <div className="relative">
        <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-enterprise-200/40 via-primary-100/40 to-transparent blur-2xl" />

        <div className="relative overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-lg">
          <BorderBeam
            size={130}
            duration={10}
            colorFrom="#9333EA"
            colorTo="#3B82F6"
          />

          <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-enterprise-50/60 to-white">
            <Image
              src="https://images.unsplash.com/photo-1494412519320-aa613dfb7738?w=1000&q=85&auto=format&fit=crop"
              alt="Entrepôt logistique"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-90"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/30 via-transparent to-transparent" />

            <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-enterprise-700 shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-enterprise-500 animate-pulse-soft" />
              Compte Entreprise · DTC
            </div>

            <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/30 bg-white/80 p-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Agent dédié
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <Image
                    src="https://i.pravatar.cc/64?img=47"
                    alt="Chen Mei"
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full"
                  />
                  <span className="text-sm font-bold text-neutral-900">
                    Chen Mei
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-white/30 bg-white/80 p-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  Volume mensuel
                </p>
                <p className="mt-1.5 text-sm font-bold text-neutral-900">
                  12 400 unités
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100 bg-white">
            {[
              { label: "Délai prod", value: "8 j" },
              { label: "Lead time EU", value: "11 j" },
              { label: "Statut SLA", value: "OK", emerald: true },
            ].map((m) => (
              <div key={m.label} className="p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                  {m.label}
                </p>
                <p
                  className={`mt-1 text-base font-bold ${
                    m.emerald ? "text-emerald-600" : "text-neutral-900"
                  }`}
                >
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-6 top-12 hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:flex md:items-center md:gap-2"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-enterprise-50">
            <Sparkles className="h-4 w-4 text-enterprise-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-neutral-500">
              Account manager
            </p>
            <p className="text-sm font-bold text-neutral-900">100% dédié</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [6, -6, 6] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-6 bottom-12 hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:flex md:items-center md:gap-2"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-neutral-500">
              SLA
            </p>
            <p className="text-sm font-bold text-neutral-900">Garanti 24h</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
