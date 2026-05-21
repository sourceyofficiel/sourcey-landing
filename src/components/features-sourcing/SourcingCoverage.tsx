"use client";

import { motion } from "motion/react";
import {
  Shirt,
  Sparkles,
  Home,
  Cpu,
  Dumbbell,
  PawPrint,
  Pencil,
  Gift,
  Tv,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

/**
 * Section "Ce qu'on couvre" — catégories produits + villes Chine.
 * Layout : grid de catégories à gauche, badges villes à droite.
 */

type Category = {
  icon: LucideIcon;
  label: string;
};

const CATEGORIES: Category[] = [
  { icon: Shirt, label: "Mode & Accessoires" },
  { icon: Sparkles, label: "Beauté & Cosmétique" },
  { icon: Home, label: "Maison & Déco" },
  { icon: Cpu, label: "Électronique grand public" },
  { icon: Dumbbell, label: "Sport & Outdoor" },
  { icon: PawPrint, label: "Animalerie" },
  { icon: Pencil, label: "Papeterie & Bureau" },
  { icon: Gift, label: "Goodies & Cadeaux" },
  { icon: Tv, label: "Gadgets tech" },
  { icon: HelpCircle, label: "Autre — on étudie" },
];

const CITIES = [
  { name: "Shenzhen", specialty: "Tech, électronique, IoT" },
  { name: "Yiwu", specialty: "Accessoires, gadgets, goodies" },
  { name: "Guangzhou", specialty: "Textile, maroquinerie" },
  { name: "Shanghai", specialty: "Cosméto, mode, premium" },
  { name: "Hangzhou", specialty: "E-com, packaging" },
  { name: "Dongguan", specialty: "Plastique, jouets" },
  { name: "Ningbo", specialty: "Logistique, export" },
];

export function SourcingCoverage() {
  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Couverture</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Les catégories et villes{" "}
          <span className="text-primary-600">qu'on maîtrise.</span>
        </h2>
        <p className="mt-4 text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          On ne fait pas tout. Mais sur ces verticales, on connaît les usines,
          les MOQs réalistes et les bons prix.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
        {/* === Catégories grid === */}
        <div>
          <h3 className="mb-5 text-[12px] font-bold uppercase tracking-wider text-neutral-500">
            Catégories produits
          </h3>
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.04, delayChildren: 0.1 },
              },
              hidden: {},
            }}
            className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3"
          >
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <motion.li
                  key={c.label}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 transition-colors hover:border-primary-200 hover:bg-primary-50/30"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="text-[12.5px] font-semibold text-neutral-800 md:text-[13.5px]">
                    {c.label}
                  </span>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* === Villes Chine === */}
        <div>
          <h3 className="mb-5 text-[12px] font-bold uppercase tracking-wider text-neutral-500">
            Hubs Chine où on opère
          </h3>
          <motion.ul
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.05, delayChildren: 0.15 },
              },
              hidden: {},
            }}
            className="space-y-2"
          >
            {CITIES.map((c) => (
              <motion.li
                key={c.name}
                variants={{
                  hidden: { opacity: 0, x: 8 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[11px] font-bold text-white">
                    {c.name[0]}
                  </span>
                  <span className="text-[13px] font-bold text-neutral-900">
                    {c.name}
                  </span>
                </div>
                <span className="text-[11.5px] text-neutral-500">
                  {c.specialty}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
