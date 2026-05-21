"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardList,
  SearchCheck,
  FileSignature,
  Factory,
  Camera,
  ShieldCheck,
  Plane,
  PackageCheck,
  type LucideIcon,
  Bell,
  Clock,
  MapPin,
} from "lucide-react";
import { V2SectionLabel } from "@/components/v2/V2SectionLabel";

type Milestone = {
  id: string;
  date: string;
  icon: LucideIcon;
  title: string;
  description: string;
  whatsapp: string;
  status: "done" | "current" | "todo";
  location?: string;
};

const TIMELINE: Milestone[] = [
  {
    id: "brief",
    date: "10 mai",
    icon: ClipboardList,
    title: "Brief reçu",
    description:
      "Tu nous as soumis ta demande : chouchous velours côtelé, MOQ 500, budget 5€/unité.",
    whatsapp:
      "Bien reçu Marie ! On lance la recherche aujourd'hui, on revient vers toi sous 72h avec 3-5 options.",
    status: "done",
  },
  {
    id: "sourcing",
    date: "13 mai",
    icon: SearchCheck,
    title: "Fournisseurs trouvés",
    description:
      "3 fournisseurs vérifiés présentés avec photos d'échantillons et prix négociés.",
    whatsapp:
      "Voici tes 3 options 👀 Shenzhen Velvet est notre recommandation. Tu valides quelle ?",
    status: "done",
    location: "Shenzhen, Yiwu, Guangzhou",
  },
  {
    id: "devis",
    date: "14 mai",
    icon: FileSignature,
    title: "Devis envoyé",
    description:
      "Devis final négocié à 4,20€/unité, MOQ 500, échantillons gratuits, paiement 30/70.",
    whatsapp:
      "Devis prêt : 4,20€ × 500 = 2 100€ + transport. Si OK, on lance la prod cette semaine.",
    status: "done",
  },
  {
    id: "prod-start",
    date: "16 mai",
    icon: Factory,
    title: "Production lancée",
    description:
      "Acompte 30% versé, l'usine a démarré la production. Délai annoncé : 21 jours.",
    whatsapp:
      "🏭 Production en cours chez Yiwu Textile. Date de fin estimée : 6 juin.",
    status: "done",
    location: "Yiwu Textile Group",
  },
  {
    id: "prod-mid",
    date: "26 mai",
    icon: Camera,
    title: "Photos mi-production",
    description:
      "L'usine nous a envoyé 25 photos du lot en cours. Tu peux les voir dans ton app.",
    whatsapp:
      "📸 Photos mi-prod dispos. Couleur conforme, finitions propres. RAS.",
    status: "current",
    location: "Atelier Yiwu",
  },
  {
    id: "qc",
    date: "5 juin",
    icon: ShieldCheck,
    title: "Inspection qualité",
    description:
      "Notre agent QC inspecte le lot sur place. Rapport sous 24h.",
    whatsapp: "",
    status: "todo",
  },
  {
    id: "shipping",
    date: "8 juin",
    icon: Plane,
    title: "Expédition",
    description: "Mode aérien standard, durée 10 jours. DDP Paris.",
    whatsapp: "",
    status: "todo",
  },
  {
    id: "delivered",
    date: "18 juin",
    icon: PackageCheck,
    title: "Livré chez toi",
    description: "Camion à ton adresse de fulfillment. Tu signes, c'est tout.",
    whatsapp: "",
    status: "todo",
  },
];

export function TrackingDemo() {
  const defaultIndex = TIMELINE.findIndex((m) => m.status === "current");
  const [activeIdx, setActiveIdx] = useState(defaultIndex >= 0 ? defaultIndex : 0);
  const active = TIMELINE[activeIdx];

  return (
    <section className="relative mx-auto max-w-[1200px] px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-[760px] text-center">
        <V2SectionLabel>Aperçu dashboard</V2SectionLabel>
        <h2 className="mt-4 font-display text-[clamp(26px,3.5vw,42px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
          Tu vois tout en direct.
        </h2>
        <p className="mx-auto mt-4 max-w-[560px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]">
          Clique sur n'importe quel jalon pour voir ce qui se passe à ce moment-là.
          À droite, la notification WhatsApp que tu reçois en vrai.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-[1100px] items-start gap-8 md:grid-cols-[1fr_360px] md:gap-10">
        {/* Timeline */}
        <div className="relative rounded-3xl border border-neutral-200 bg-white p-6 md:p-8">
          {/* Brief recap card on top */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-5">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400">
                Brief #SC-2026-0487
              </div>
              <div className="mt-1 text-[16px] font-bold text-neutral-900">
                Chouchous velours côtelé × 500
              </div>
              <div className="mt-0.5 text-[12px] text-neutral-500">
                Yiwu Textile Group · 4,20€/unité
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] uppercase tracking-wider text-neutral-400">
                Progression
              </div>
              <div className="mt-1 font-display text-[22px] font-extrabold text-primary-600">
                {Math.round(
                  ((TIMELINE.filter((m) => m.status === "done").length + 0.5) /
                    TIMELINE.length) *
                    100
                )}
                %
              </div>
            </div>
          </div>

          {/* Vertical timeline */}
          <ol className="relative mt-6 space-y-1">
            {/* Vertical line */}
            <div
              aria-hidden
              className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-neutral-200"
            />

            {TIMELINE.map((m, i) => {
              const Icon = m.icon;
              const isActive = i === activeIdx;
              const isDone = m.status === "done";
              const isCurrent = m.status === "current";
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`group relative flex w-full items-start gap-4 rounded-xl p-2.5 text-left transition-colors ${
                      isActive ? "bg-primary-50/60" : "hover:bg-neutral-50"
                    }`}
                  >
                    {/* Dot */}
                    <span
                      className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 transition-all ${
                        isDone
                          ? "bg-primary-600 text-white ring-white"
                          : isCurrent
                            ? "bg-white text-primary-600 ring-primary-200"
                            : "bg-neutral-100 text-neutral-400 ring-white"
                      } ${isActive ? "scale-110" : ""}`}
                    >
                      {isCurrent && (
                        <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-primary-400/40" />
                      )}
                      <Icon className="relative h-4 w-4" strokeWidth={2.2} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <div
                          className={`text-[13.5px] font-semibold ${
                            isDone || isCurrent
                              ? "text-neutral-900"
                              : "text-neutral-400"
                          }`}
                        >
                          {m.title}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-primary-700">
                              <Clock className="h-2.5 w-2.5" />
                              En cours
                            </span>
                          )}
                        </div>
                        <div
                          className={`shrink-0 text-[11px] font-mono ${
                            isDone || isCurrent
                              ? "text-neutral-500"
                              : "text-neutral-300"
                          }`}
                        >
                          {m.date}
                        </div>
                      </div>
                      {m.location && (isDone || isCurrent) && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11.5px] text-neutral-400">
                          <MapPin className="h-2.5 w-2.5" />
                          {m.location}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* WhatsApp notification mockup (sticky on desktop) */}
        <div className="md:sticky md:top-24">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Bell className="h-3.5 w-3.5" />
              </span>
              <span className="text-[12.5px] font-semibold text-neutral-900">
                Notification WhatsApp
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="p-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M20.5 3.5A11.6 11.6 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.4-8.3zM12 21.9c-1.8 0-3.6-.5-5.2-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 0 1 15.4-11.7 9.8 9.8 0 0 1 3 7c0 5.4-4.5 9.9-9.9 9.9z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-neutral-900">
                      Sourcey · Marc
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {active.date} · {active.title}
                    </div>
                  </div>
                </div>

                {active.whatsapp ? (
                  <div className="mt-4 rounded-2xl rounded-tl-sm bg-[#DCF8C6] px-3.5 py-2.5 text-[13px] leading-snug text-neutral-900">
                    {active.whatsapp}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-3.5 text-center text-[12px] text-neutral-400">
                    Pas encore atteint — notification déclenchée le {active.date}.
                  </div>
                )}

                {/* Description */}
                <div className="mt-5 rounded-xl bg-neutral-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Ce qu'il se passe
                  </div>
                  <div className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">
                    {active.description}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <p className="mt-4 text-center text-[11.5px] text-neutral-400">
            Tu choisis les notifs à recevoir dans tes réglages.
          </p>
        </div>
      </div>
    </section>
  );
}
