"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Star,
  ShieldCheck,
  Factory,
  Calendar,
  Box,
  Check,
  X,
  TrendingDown,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

type Supplier = {
  id: string;
  name: string;
  city: string;
  province: string;
  founded: number;
  staff: string;
  rating: number;
  reviews: number;
  certifications: string[];
  unitPrice: number;
  moq: number;
  leadTime: string;
  photo: string;
  highlights: string[];
  redFlags: string[];
  scoreLabel: string;
  scoreColor: "green" | "blue" | "amber";
  recommended: boolean;
};

const SUPPLIERS: Supplier[] = [
  {
    id: "shenzhen",
    name: "Shenzhen Velvet Co.",
    city: "Shenzhen",
    province: "Guangdong",
    founded: 2008,
    staff: "50-100",
    rating: 4.8,
    reviews: 217,
    certifications: ["ISO 9001", "BSCI", "OEKO-TEX"],
    unitPrice: 4.2,
    moq: 200,
    leadTime: "28 jours",
    photo:
      "https://images.unsplash.com/photo-1581094289810-adf5d25690e3?w=800&q=80&auto=format&fit=crop",
    highlights: [
      "Usine vérifiée sur place par notre équipe",
      "Exporte déjà en Europe (clients confirmés)",
      "Acceptent les échantillons gratuits",
    ],
    redFlags: [],
    scoreLabel: "Top choix",
    scoreColor: "green",
    recommended: true,
  },
  {
    id: "yiwu",
    name: "Yiwu Textile Group",
    city: "Yiwu",
    province: "Zhejiang",
    founded: 2012,
    staff: "100-300",
    rating: 4.6,
    reviews: 432,
    certifications: ["ISO 9001", "BSCI"],
    unitPrice: 3.8,
    moq: 500,
    leadTime: "35 jours",
    photo:
      "https://images.unsplash.com/photo-1565793979206-6d599e4f3ad7?w=800&q=80&auto=format&fit=crop",
    highlights: [
      "Prix le plus bas",
      "Capacité de production élevée",
    ],
    redFlags: ["MOQ plus élevé", "Délais plus longs"],
    scoreLabel: "Bon marché",
    scoreColor: "blue",
    recommended: false,
  },
  {
    id: "guangzhou",
    name: "Guangzhou Premium Mfg.",
    city: "Guangzhou",
    province: "Guangdong",
    founded: 2005,
    staff: "20-50",
    rating: 4.9,
    reviews: 89,
    certifications: ["ISO 9001", "BSCI", "OEKO-TEX", "GRS"],
    unitPrice: 5.6,
    moq: 100,
    leadTime: "21 jours",
    photo:
      "https://images.unsplash.com/photo-1567361808960-dec9cb578182?w=800&q=80&auto=format&fit=crop",
    highlights: [
      "MOQ très bas (idéal pour test)",
      "Délais courts",
      "Certifs supplémentaires (GRS, recyclage)",
    ],
    redFlags: ["Prix plus élevé"],
    scoreLabel: "Premium",
    scoreColor: "amber",
    recommended: false,
  },
];

export function SourcingDemo() {
  const [selected, setSelected] = useState<string>("shenzhen");
  const current = SUPPLIERS.find((s) => s.id === selected) ?? SUPPLIERS[0];

  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Exemple concret</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Voici ce que tu reçois après ton brief.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Tu nous demandes des chouchous en velours côtelé, MOQ 200, budget 5€.
          On revient avec 3 options vérifiées, photos d'usine, prix négocié.
          Tu cliques sur celle qui t'intéresse.
        </p>
      </div>

      {/* Tabs to switch supplier */}
      <div className="mx-auto mt-12 grid max-w-[860px] grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {SUPPLIERS.map((s) => {
          const isActive = s.id === selected;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s.id)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? "border-primary-300 bg-white shadow-[0_10px_30px_-12px_rgba(37,99,235,0.25)]"
                  : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-supplier-indicator"
                  className="absolute inset-x-0 top-0 h-0.5 bg-primary-500"
                />
              )}

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${
                    s.scoreColor === "green"
                      ? "bg-green-50 text-green-700"
                      : s.scoreColor === "blue"
                        ? "bg-primary-50 text-primary-700"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {s.recommended && <Star className="h-2.5 w-2.5 fill-current" />}
                  {s.scoreLabel}
                </span>
                <span className="text-[11px] text-neutral-400">#{s.id}</span>
              </div>

              <h3 className="mt-3 text-[14px] font-bold text-neutral-900">
                {s.name}
              </h3>

              <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-neutral-500">
                <MapPin className="h-3 w-3" />
                {s.city}, {s.province}
              </div>

              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="font-display text-[20px] font-extrabold text-neutral-900">
                  {s.unitPrice.toFixed(2)}€
                </span>
                <span className="text-[11px] text-neutral-500">/ unité</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-8 max-w-[1000px] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]"
        >
          <div className="grid md:grid-cols-[1.1fr_1fr]">
            {/* Image side */}
            <div className="relative h-[280px] md:h-auto md:min-h-[460px]">
              <Image
                src={current.photo}
                alt={`Usine ${current.name}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              {/* City badge */}
              <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11.5px] font-semibold text-neutral-900 backdrop-blur-sm">
                <MapPin className="h-3 w-3 text-primary-600" />
                {current.city}, {current.province}
              </div>
              {/* Footer info on image */}
              <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 text-white">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider opacity-70">
                    Fondée
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold">
                    <Calendar className="h-3 w-3" />
                    {current.founded}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider opacity-70">
                    Effectif
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold">
                    <Factory className="h-3 w-3" />
                    {current.staff}
                  </div>
                </div>
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider opacity-70">
                    Note
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {current.rating} ({current.reviews})
                  </div>
                </div>
              </div>
            </div>

            {/* Content side */}
            <div className="p-6 md:p-7">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-[20px] font-extrabold leading-tight text-neutral-900 md:text-[22px]">
                  {current.name}
                </h3>
                {current.recommended && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700 ring-1 ring-inset ring-green-200">
                    <ShieldCheck className="h-3 w-3" />
                    Recommandé
                  </span>
                )}
              </div>

              {/* Price stack */}
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400">
                    Prix unitaire
                  </div>
                  <div className="mt-1 font-display text-[22px] font-extrabold text-neutral-900">
                    {current.unitPrice.toFixed(2)}€
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400">
                    MOQ
                  </div>
                  <div className="mt-1 flex items-center gap-1 font-display text-[18px] font-extrabold text-neutral-900">
                    <Box className="h-4 w-4 text-neutral-400" />
                    {current.moq}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400">
                    Délai
                  </div>
                  <div className="mt-1 text-[15px] font-bold text-neutral-900">
                    {current.leadTime}
                  </div>
                </div>
              </div>

              {/* Certifications */}
              <div className="mt-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Certifications
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {current.certifications.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 text-[11px] font-semibold text-primary-700"
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights / red flags */}
              <ul className="mt-5 grid gap-2">
                {current.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-[13px] text-neutral-700"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" strokeWidth={3} />
                    {h}
                  </li>
                ))}
                {current.redFlags.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 text-[13px] text-neutral-500"
                  >
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={3} />
                    {r}
                  </li>
                ))}
              </ul>

              {/* Negotiated savings banner */}
              {current.recommended && (
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-[12.5px]">
                  <TrendingDown className="h-4 w-4 shrink-0 text-green-600" />
                  <span className="text-green-800">
                    <strong className="font-bold">-32%</strong> négocié par
                    rapport au prix initial annoncé (6,15€).
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
