"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Camera,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

type Hotspot = {
  id: string;
  /** position in % from top-left of the image */
  x: number;
  y: number;
  status: "ok" | "warn";
  title: string;
  detail: string;
};

const HOTSPOTS: Hotspot[] = [
  {
    id: "stitching",
    x: 32,
    y: 28,
    status: "ok",
    title: "Coutures conformes",
    detail:
      "Surjet 4 fils, 12 points/cm, fil 60/3. Aucun défaut détecté sur les 50 pièces inspectées.",
  },
  {
    id: "color",
    x: 62,
    y: 22,
    status: "ok",
    title: "Couleur Pantone 19-4052",
    detail:
      "ΔE = 1.2 vs. référence Pantone. Lot homogène, pas de variation entre pièces.",
  },
  {
    id: "label",
    x: 78,
    y: 56,
    status: "warn",
    title: "Étiquette mal cousue (2 pièces)",
    detail:
      "Sur 50 pièces inspectées, 2 ont l'étiquette de composition décousue d'un côté. Re-couture demandée à l'usine.",
  },
  {
    id: "size",
    x: 40,
    y: 70,
    status: "ok",
    title: "Dimensions conformes",
    detail:
      "Longueur 142 cm ±1 cm, largeur 28 cm ±0.5 cm. Tolérance respectée sur 100% du lot.",
  },
  {
    id: "packaging",
    x: 18,
    y: 50,
    status: "ok",
    title: "Packaging individuel OK",
    detail:
      "Polybag transparent 60µm avec sticker barcode. Conforme aux specs Amazon FBA.",
  },
];

const CHECKLIST = [
  { label: "Couture & finitions", count: 42, ok: 42 },
  { label: "Couleur & teinture", count: 18, ok: 18 },
  { label: "Dimensions", count: 12, ok: 12 },
  { label: "Étiquetage", count: 8, ok: 6 },
  { label: "Packaging", count: 14, ok: 14 },
  { label: "Tests fonctionnels", count: 10, ok: 10 },
];

export function QualityDemo() {
  const [activeId, setActiveId] = useState<string>("label");
  const active = HOTSPOTS.find((h) => h.id === activeId) ?? HOTSPOTS[0];
  const totalCriteria = CHECKLIST.reduce((s, c) => s + c.count, 0);
  const totalOk = CHECKLIST.reduce((s, c) => s + c.ok, 0);
  const passRate = ((totalOk / totalCriteria) * 100).toFixed(1);

  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Exemple de rapport</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Voilà à quoi ressemble un contrôle.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Survole les pastilles sur la photo. Chaque point représente un
          critère vérifié physiquement par notre agent. Tu reçois le rapport
          complet dans ton app sous 24h après l'inspection.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1100px] items-start gap-6 md:grid-cols-[1.2fr_1fr]">
        {/* Image with hotspots */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80&auto=format&fit=crop"
              alt="Inspection produit textile"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 55vw, 100vw"
              unoptimized
            />
            {/* Slight overlay so hotspots pop */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/15" />

            {/* Hotspots */}
            {HOTSPOTS.map((h) => {
              const isActive = h.id === activeId;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setActiveId(h.id)}
                  onMouseEnter={() => setActiveId(h.id)}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  aria-label={h.title}
                >
                  {/* Pulsing ring */}
                  <span
                    className={`absolute inset-0 -m-1 animate-ping rounded-full ${
                      h.status === "ok" ? "bg-green-500/30" : "bg-amber-500/40"
                    }`}
                  />
                  {/* Dot */}
                  <span
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md transition-transform ${
                      isActive ? "scale-110" : ""
                    } ${
                      h.status === "ok"
                        ? "bg-green-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {h.status === "ok" ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
                    )}
                  </span>
                </button>
              );
            })}

            {/* Image footer info */}
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between">
              <div className="rounded-xl bg-white/95 px-3 py-2 text-[11px] backdrop-blur-sm">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-700">
                  <Camera className="h-3 w-3" />
                  Photo brute · inspection AQL 2.5
                </div>
                <div className="mt-0.5 text-neutral-500">
                  Lot #SC-2026-0487 · 500 unités · 22 mai 2026
                </div>
              </div>
            </div>
          </div>

          {/* Hotspot detail card under image (mobile) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="border-t border-neutral-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    active.status === "ok"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {active.status === "ok" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-bold text-neutral-900">
                    {active.title}
                  </div>
                  <div className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">
                    {active.detail}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Inspection report panel */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-7">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-bold text-primary-700">
              <FileText className="h-3 w-3" />
              Rapport d'inspection
            </span>
            <span className="text-[11px] text-neutral-400">PDF · 2.4 Mo</span>
          </div>

          <h3 className="mt-4 font-display text-[20px] font-extrabold leading-tight text-neutral-900">
            Chouchous velours côtelé
          </h3>
          <div className="mt-0.5 text-[12px] text-neutral-500">
            Yiwu Textile Group · 500 unités
          </div>

          {/* Pass rate ring */}
          <div className="mt-6 flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0">
              <svg
                viewBox="0 0 36 36"
                className="h-full w-full -rotate-90 transform"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${parseFloat(passRate)} 100`}
                  pathLength="100"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-display text-[16px] font-extrabold text-neutral-900">
                  {passRate}%
                </div>
                <div className="text-[9px] uppercase tracking-wider text-neutral-400">
                  conforme
                </div>
              </div>
            </div>
            <div>
              <div className="text-[12px] text-neutral-500">Conclusion</div>
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-[12px] font-bold text-green-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                ACCEPTÉ avec correctif
              </div>
              <div className="mt-2 text-[11.5px] leading-snug text-neutral-500">
                2 étiquettes à recoudre par l'usine avant expédition.
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="mt-6 space-y-2">
            {CHECKLIST.map((c) => {
              const pct = (c.ok / c.count) * 100;
              const allOk = c.ok === c.count;
              return (
                <div
                  key={c.label}
                  className="flex items-center gap-3"
                >
                  <div className="min-w-[140px] text-[12.5px] text-neutral-700">
                    {c.label}
                  </div>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <motion.div
                      className={`absolute inset-y-0 left-0 ${
                        allOk ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />
                  </div>
                  <div className="min-w-[44px] text-right text-[11.5px] font-semibold text-neutral-500">
                    {c.ok}/{c.count}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-neutral-100 pt-4 text-[11.5px] text-neutral-500">
            Inspection réalisée par <strong className="text-neutral-700">Liu W., agent QC Sourcey</strong>,
            le 22 mai 2026 à Yiwu (Zhejiang).
          </div>
        </div>
      </div>
    </section>
  );
}
