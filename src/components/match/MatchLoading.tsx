"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  Scale,
  Sparkles,
  Check,
} from "lucide-react";

const STEPS = [
  {
    icon: Search,
    label: "Identification du produit & catégorie…",
    color: "bg-primary-50 text-primary-700 border-primary-100",
  },
  {
    icon: MapPin,
    label: "Sélection de la région chinoise optimale…",
    color: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    icon: Scale,
    label: "Comparaison des 14 agents disponibles…",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    icon: Sparkles,
    label: "Calcul du match score & ranking final…",
    color: "bg-enterprise-50 text-enterprise-700 border-enterprise-100",
  },
];

export function MatchLoading() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length - 1) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), 750);
    return () => clearTimeout(t);
  }, [current]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-enterprise-600 text-white shadow-brand">
          <Sparkles className="h-5 w-5" />
          <span className="absolute -inset-1 rounded-2xl border-2 border-primary-300/50 animate-ping" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-neutral-900">
            Sourcey IA travaille…
          </p>
          <p className="text-xs text-neutral-500">
            Analyse en temps réel de ton brief, ne ferme pas la page
          </p>
        </div>
      </div>

      <div className="mt-7 space-y-2.5">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const pending = i > current;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                active
                  ? step.color
                  : done
                  ? "bg-neutral-50 border-neutral-200 opacity-90"
                  : "bg-white border-neutral-100 opacity-40"
              }`}
            >
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-white text-current shadow-sm"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 18,
                      }}
                    >
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </motion.span>
                  ) : active ? (
                    <motion.span
                      key="active"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.span>
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </AnimatePresence>
              </div>
              <p
                className={`flex-1 text-[14px] font-semibold ${
                  pending ? "text-neutral-400" : "text-neutral-900"
                }`}
              >
                {step.label}
              </p>
              {active && (
                <span className="flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-current opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500">
        Temps moyen d'analyse : ~3 secondes · 14 agents évalués sur 8 critères
      </p>
    </motion.div>
  );
}
