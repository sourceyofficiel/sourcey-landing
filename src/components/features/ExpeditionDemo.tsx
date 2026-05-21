"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plane, Ship, Truck, Clock, Euro, Leaf, Check } from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

type Mode = "express" | "air" | "sea";

type Option = {
  id: Mode;
  label: string;
  icon: typeof Plane;
  duration: string;
  durationDays: number;
  pricePerKg: string;
  total500: string;
  co2: string;
  best: string;
  pros: string[];
};

const OPTIONS: Option[] = [
  {
    id: "express",
    label: "Express (DHL/FedEx)",
    icon: Plane,
    duration: "5-7 jours",
    durationDays: 6,
    pricePerKg: "6,80€",
    total500: "1 360€",
    co2: "élevé",
    best: "Lancements urgents, petits volumes",
    pros: ["Door to door", "Tracking minute", "Assurance incluse"],
  },
  {
    id: "air",
    label: "Aérien standard",
    icon: Plane,
    duration: "8-12 jours",
    durationDays: 10,
    pricePerKg: "4,20€",
    total500: "840€",
    co2: "moyen",
    best: "Bon compromis prix / délais",
    pros: ["Bon rapport temps/prix", "Idéal 50-500kg", "Dédouanement géré"],
  },
  {
    id: "sea",
    label: "Maritime LCL",
    icon: Ship,
    duration: "35-45 jours",
    durationDays: 40,
    pricePerKg: "0,90€",
    total500: "180€",
    co2: "faible",
    best: "Réassorts planifiés, gros volumes",
    pros: ["Le moins cher", "Empreinte carbone basse", "Stockable au port"],
  },
];

export function ExpeditionDemo() {
  const [mode, setMode] = useState<Mode>("air");
  const current = OPTIONS.find((o) => o.id === mode) ?? OPTIONS[1];
  const Icon = current.icon;

  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Comparateur transport</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          On choisit ensemble le bon mode.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Sur ton dashboard, tu vois les 3 options chiffrées pour ton lot.
          Tu choisis selon ton urgence et ton budget. On s'occupe du reste,
          DDP jusqu'à ton entrepôt.
        </p>
      </div>

      {/* Mode selector */}
      <div className="mx-auto mt-12 grid max-w-[860px] grid-cols-3 gap-2 md:gap-3">
        {OPTIONS.map((opt) => {
          const I = opt.icon;
          const isActive = opt.id === mode;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              className={`relative overflow-hidden rounded-2xl border p-3 text-left transition-all md:p-4 ${
                isActive
                  ? "border-primary-300 bg-white shadow-[0_10px_30px_-12px_rgba(37,99,235,0.25)]"
                  : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-mode-indicator"
                  className="absolute inset-x-0 top-0 h-0.5 bg-primary-500"
                />
              )}
              <I
                className={`h-5 w-5 ${
                  isActive ? "text-primary-600" : "text-neutral-400"
                }`}
                strokeWidth={2}
              />
              <div className="mt-2 text-[12.5px] font-semibold text-neutral-900 md:text-[13.5px]">
                {opt.label}
              </div>
              <div className="mt-0.5 text-[11px] text-neutral-500">
                {opt.duration}
              </div>
            </button>
          );
        })}
      </div>

      {/* Map + details */}
      <div className="mx-auto mt-8 grid max-w-[1100px] items-stretch gap-6 md:grid-cols-[1.3fr_1fr]">
        {/* Map */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-primary-50 to-white p-6 md:p-8">
          <RouteMap mode={mode} />

          {/* Bottom strip with cities + timing */}
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div>
              <div className="text-[10.5px] uppercase tracking-wider text-neutral-400">
                Départ
              </div>
              <div className="mt-0.5 text-[13px] font-semibold text-neutral-900">
                Shenzhen 🇨🇳
              </div>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <div className="h-px w-8 bg-neutral-200 md:w-16" />
              <div className="rounded-full bg-primary-50 px-3 py-1 text-[11.5px] font-semibold text-primary-700">
                {current.duration}
              </div>
              <div className="h-px w-8 bg-neutral-200 md:w-16" />
            </div>
            <div className="text-right">
              <div className="text-[10.5px] uppercase tracking-wider text-neutral-400">
                Arrivée
              </div>
              <div className="mt-0.5 text-[13px] font-semibold text-neutral-900">
                Paris 🇫🇷
              </div>
            </div>
          </div>
        </div>

        {/* Quote panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6 md:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-inset ring-primary-100">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-neutral-400">
                  Devis transport
                </div>
                <div className="text-[15px] font-bold text-neutral-900">
                  {current.label}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 gap-3 border-y border-neutral-100 py-4">
              <Stat
                icon={Clock}
                label="Durée"
                value={current.duration}
              />
              <Stat
                icon={Euro}
                label="Par kg"
                value={current.pricePerKg}
              />
              <Stat
                icon={Leaf}
                label="CO₂"
                value={current.co2}
                valueClass={
                  current.co2 === "faible"
                    ? "text-green-600"
                    : current.co2 === "moyen"
                      ? "text-amber-600"
                      : "text-rose-600"
                }
              />
            </div>

            {/* Total for 500 units example */}
            <div className="mt-5 rounded-2xl bg-primary-600/5 p-4 ring-1 ring-inset ring-primary-100">
              <div className="text-[11.5px] text-neutral-500">
                Pour 500 chouchous (~200 kg)
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-[28px] font-extrabold text-neutral-900">
                  {current.total500}
                </span>
                <span className="text-[11px] text-neutral-500">DDP Paris</span>
              </div>
            </div>

            {/* Best for */}
            <div className="mt-5">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Idéal pour
              </div>
              <div className="mt-1 text-[13px] text-neutral-700">
                {current.best}
              </div>
            </div>

            {/* Pros */}
            <ul className="mt-4 grid gap-2">
              {current.pros.map((p) => (
                <li
                  key={p}
                  className="flex items-start gap-2 text-[12.5px] text-neutral-600"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" strokeWidth={3} />
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-5 text-[11px] text-neutral-400">
              <Truck className="mb-1 inline h-3 w-3" /> Livraison camion final
              jusqu'à ton adresse incluse.
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ============================================================
   STAT — small icon+label+value column
   ============================================================ */

function Stat({
  icon: I,
  label,
  value,
  valueClass = "text-neutral-900",
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10.5px] uppercase tracking-wider text-neutral-400">
        <I className="h-2.5 w-2.5" />
        {label}
      </div>
      <div className={`mt-1 text-[14px] font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}

/* ============================================================
   ROUTE MAP — abstract world map with animated package
   ============================================================ */

function RouteMap({ mode }: { mode: Mode }) {
  // Cubic Bezier curve from Shenzhen (right) to Paris (left)
  // viewBox 0 0 600 280
  // Different curves per mode to emphasize the trajectory feel.
  const ROUTES: Record<Mode, { path: string; color: string; dash: string; speed: number }> = {
    express: {
      path: "M 480 180 C 380 30, 220 30, 130 110",
      color: "#DC2626",
      dash: "0",
      speed: 4,
    },
    air: {
      path: "M 480 180 C 360 60, 240 70, 130 110",
      color: "#2563EB",
      dash: "0",
      speed: 6,
    },
    sea: {
      path: "M 480 180 C 400 240, 260 220, 130 110",
      color: "#0D9488",
      dash: "6 6",
      speed: 12,
    },
  };
  const r = ROUTES[mode];
  const Icon = mode === "sea" ? Ship : Plane;

  return (
    <div className="relative">
      <svg viewBox="0 0 600 280" className="w-full" aria-hidden>
        <defs>
          <radialGradient id="ocean-bg" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#DBEAFE" />
            <stop offset="100%" stopColor="#EFF6FF" />
          </radialGradient>
        </defs>

        {/* Background "land" blobs (abstract) */}
        <rect width="600" height="280" fill="url(#ocean-bg)" rx="20" />
        {/* Europe-ish blob */}
        <path
          d="M 50 80 Q 110 60, 180 90 Q 220 130, 170 160 Q 100 170, 60 140 Z"
          fill="#E0E7FF"
          opacity="0.7"
        />
        {/* Asia-ish blob */}
        <path
          d="M 380 100 Q 470 70, 560 110 Q 580 170, 530 210 Q 420 220, 380 180 Z"
          fill="#E0E7FF"
          opacity="0.7"
        />

        {/* Grid dots (decorative) */}
        {Array.from({ length: 8 }).map((_, i) =>
          Array.from({ length: 4 }).map((_, j) => (
            <circle
              key={`${i}-${j}`}
              cx={50 + i * 70}
              cy={40 + j * 60}
              r="0.8"
              fill="#94A3B8"
              opacity="0.4"
            />
          ))
        )}

        {/* Route */}
        <motion.path
          key={`route-${mode}`}
          d={r.path}
          stroke={r.color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={r.dash}
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.3 },
          }}
        />

        {/* Origin pin (Shenzhen) */}
        <g transform="translate(480 180)">
          <circle r="9" fill={r.color} opacity="0.15" />
          <circle r="5" fill={r.color} />
          <circle r="2" fill="#fff" />
        </g>

        {/* Destination pin (Paris) */}
        <g transform="translate(130 110)">
          <circle r="9" fill="#16A34A" opacity="0.15" />
          <circle r="5" fill="#16A34A" />
          <circle r="2" fill="#fff" />
        </g>

        {/* Animated vehicle along the route */}
        <motion.g
          key={`vehicle-${mode}`}
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{
            duration: r.speed,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            offsetPath: `path("${r.path}")`,
            offsetRotate: "auto",
          }}
        >
          <g transform="translate(-10 -10)">
            <circle cx="10" cy="10" r="11" fill={r.color} opacity="0.18" />
            <circle cx="10" cy="10" r="9" fill={r.color} />
            <foreignObject x="3" y="3" width="14" height="14">
              <Icon
                className="text-white"
                style={{ width: 14, height: 14 }}
                strokeWidth={2.2}
              />
            </foreignObject>
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
