"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import {
  ArrowRight,
  PlayCircle,
  Star,
  ShieldCheck,
  Video,
  Globe2,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AuroraText } from "@/components/ui/aurora-text";
import { BorderBeam } from "@/components/ui/border-beam";
import { ease, wordReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TITLE_WORDS = ["Trouve", "ton", "produit."];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-10 md:pt-16 lg:pt-20">
      <AnimatedGridPattern
        numSquares={28}
        maxOpacity={0.12}
        duration={3.5}
        repeatDelay={0.6}
        className={cn(
          "[mask-image:radial-gradient(560px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[160%] skew-y-12 text-primary-500/40"
        )}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary-200/30 blur-[120px]" />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-soft rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Sourcing direct depuis la Chine · Agents francophones
            </motion.div>

            <h1 className="mt-6 font-display text-[clamp(38px,6vw,68px)] font-extrabold leading-[1.04] tracking-tight text-neutral-900">
              <span className="block">
                {TITLE_WORDS.map((word, i) => (
                  <span key={i} className="hero-word">
                    <motion.span
                      variants={wordReveal}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                    >
                      {word}
                      {i < TITLE_WORDS.length - 1 && " "}
                    </motion.span>
                  </span>
                ))}
              </span>
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease }}
                className="block"
              >
                On s'occupe{" "}
                <AuroraText
                  colors={["#3B82F6", "#2563EB", "#9333EA", "#60A5FA"]}
                >
                  du reste.
                </AuroraText>
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease }}
              className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-neutral-600"
            >
              Sourcey te connecte à un réseau d'agents en Chine qui sourcent,
              contrôlent et expédient les meilleurs produits pour ton
              e-commerce. Particuliers comme entreprises, on s'adapte.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1, ease }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Button asChild variant="primary" size="xl">
                <Link href="/signup">
                  Commencer gratuitement
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="xl">
                <Link href="#demo">
                  <PlayCircle className="h-5 w-5" />
                  Voir la démo
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 1.2, ease }}
              className="mt-8 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {[12, 47, 23, 33, 65].map((id) => (
                  <Image
                    key={id}
                    src={`https://i.pravatar.cc/64?img=${id}`}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-1 font-semibold text-neutral-900">
                    5.0
                  </span>
                </div>
                <p className="text-neutral-600">
                  <strong className="text-neutral-900">247+</strong> inscrits
                  sur la waitlist
                </p>
              </div>
            </motion.div>
          </div>

          <HeroVisual />
        </div>
      </Container>
    </section>
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
        <div className="absolute -inset-8 rounded-[40px] bg-gradient-to-br from-primary-200/40 via-primary-100/40 to-transparent blur-2xl" />

        <div className="relative overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-lg">
          <BorderBeam
            size={130}
            duration={9}
            colorFrom="#3B82F6"
            colorTo="#9333EA"
          />
          <BorderBeam
            size={130}
            duration={9}
            delay={4.5}
            reverse
            colorFrom="#60A5FA"
            colorTo="#3B82F6"
          />

          <div className="flex items-center gap-1.5 border-b border-neutral-100 bg-neutral-50/50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
            <div className="ml-3 h-5 flex-1 rounded-md bg-neutral-100" />
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                  Ma demande
                </p>
                <p className="mt-0.5 text-[15px] font-bold text-neutral-900">
                  Bougie parfumée custom · 500 unités
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                En cours
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: "Sourcing", done: true },
                { label: "Devis", done: true },
                { label: "QC", done: false },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`rounded-xl border p-3 text-center text-xs font-semibold ${
                    s.done
                      ? "border-primary-200 bg-primary-50 text-primary-700"
                      : "border-neutral-200 bg-neutral-50 text-neutral-500"
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Agents proposés
              </p>
              {[
                {
                  name: "Chen Mei",
                  city: "Guangzhou",
                  img: "https://i.pravatar.cc/120?img=47",
                  match: 98,
                },
                {
                  name: "Li Wei",
                  city: "Yiwu",
                  img: "https://i.pravatar.cc/120?img=12",
                  match: 94,
                },
              ].map((a) => (
                <motion.div
                  key={a.name}
                  whileHover={{ y: -2, scale: 1.005 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
                >
                  <Image
                    src={a.img}
                    alt={a.name}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900">
                      {a.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {a.city} · 4.9 ★ · FR/ZH
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Match</p>
                    <p className="text-sm font-bold text-primary-600">
                      {a.match}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl bg-neutral-900 p-4 text-white">
              <div>
                <p className="text-xs text-neutral-400">Économie estimée</p>
                <p className="text-xl font-extrabold text-emerald-400">-42%</p>
              </div>
              <button className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-900 transition-transform hover:scale-105">
                Voir →
              </button>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-6 top-24 hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:flex md:items-center md:gap-2"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50">
            <ShieldCheck className="h-4 w-4 text-primary-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-neutral-500">
              Garanti
            </p>
            <p className="text-sm font-bold text-neutral-900">Devis sous 48h</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [8, -8, 8] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-6 top-56 hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:flex md:items-center md:gap-2"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50">
            <Video className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-neutral-500">
              Qualité
            </p>
            <p className="text-sm font-bold text-neutral-900">QC vidéo HD</p>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [-6, 6, -6] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 left-12 hidden rounded-2xl border border-neutral-200 bg-white p-3 shadow-lg md:flex md:items-center md:gap-2"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50">
            <Globe2 className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-neutral-500">
              Livraison
            </p>
            <p className="text-sm font-bold text-neutral-900">7-12 jours</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
