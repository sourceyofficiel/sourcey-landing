"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Plus,
  SearchCheck,
  MessageSquare,
  ShieldCheck,
  PackageSearch,
  Star,
  MapPin,
  Check,
  CheckCheck,
  Camera,
  Factory,
  Plane,
  type LucideIcon,
} from "lucide-react";

/**
 * V2Features — section "Fonctionnalités" en split view interactif.
 *
 * Gauche : liste cliquable des 4 features clés Sourcey (icône colorée +
 *          titre + description courte).
 * Droite : mini-preview qui swap selon la feature active (AnimatePresence).
 *
 * Layout inspiré d'un design vu ailleurs, adapté DA Sourcey (bleu primary
 * + accents colorés pour différencier les features).
 */

type Feature = {
  slug: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    slug: "sourcing",
    icon: SearchCheck,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    title: "Recherche de fournisseurs",
    description:
      "On vérifie les usines sur place et on te présente 3-5 options comparées.",
  },
  {
    slug: "negociation",
    icon: MessageSquare,
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    title: "Négociation en mandarin",
    description:
      "Notre équipe négo le prix, MOQ, et conditions en ton nom.",
  },
  {
    slug: "controle-qualite",
    icon: ShieldCheck,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    title: "Contrôle qualité",
    description:
      "Inspection physique de chaque lot avant expédition, rapport détaillé.",
  },
  {
    slug: "suivi-colis",
    icon: PackageSearch,
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    title: "Suivi temps réel",
    description:
      "Notifications WhatsApp à chaque étape, de la production à la livraison.",
  },
];

export function V2Features() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = FEATURES[activeIdx];

  return (
    <section className="relative mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
      {/* Titre principal */}
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-[760px] font-display text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900"
      >
        Un service géré <span className="text-primary-600">de A à Z.</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-3 max-w-[600px] text-[14.5px] leading-relaxed text-neutral-500 md:text-[16px]"
      >
        Quatre piliers couvrent l&apos;intégralité de ton parcours sourcing.
        Clique sur une fonctionnalité pour voir comment ça marche concrètement.
      </motion.p>

      {/* === Card principale === */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="mt-10 overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.08)]"
      >
        <div className="grid lg:grid-cols-[minmax(0,380px)_1fr]">
          {/* === LEFT : header + liste === */}
          <div className="border-b border-neutral-100 p-6 md:p-8 lg:border-b-0 lg:border-r">
            {/* Top header */}
            <div className="text-[12px] font-semibold text-neutral-500">
              Service complet
            </div>
            <h3 className="mt-2 font-display text-[22px] font-extrabold leading-tight tracking-tight text-neutral-900 md:text-[26px]">
              On orchestre ton sourcing à ta place.
            </h3>
            <Link
              href="/signup"
              aria-label="Démarrer un brief"
              className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white transition-all hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Feature list */}
            <ul className="mt-8 divide-y divide-neutral-100">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                const isActive = i === activeIdx;
                return (
                  <li key={f.slug}>
                    <button
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className="group flex w-full items-start gap-3 py-4 text-left transition-colors"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${f.iconBg} ${f.iconColor} ring-1 ring-inset ring-white/40`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-[14px] font-bold transition-colors ${
                            isActive
                              ? "text-neutral-900"
                              : "text-neutral-700 group-hover:text-neutral-900"
                          }`}
                        >
                          {isActive ? (
                            <span className="rounded bg-neutral-100 px-1.5 py-0.5">
                              {f.title}
                            </span>
                          ) : (
                            f.title
                          )}
                        </div>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ duration: 0.25 }}
                            className="mt-2 text-[12.5px] leading-relaxed text-neutral-500"
                          >
                            {f.description}
                          </motion.p>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}

              {/* "Voir toutes" final item */}
              <li>
                <Link
                  href="/features/sourcing"
                  className="group flex w-full items-center gap-3 py-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 ring-1 ring-inset ring-white/40">
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-[14px] font-bold text-neutral-700 group-hover:text-neutral-900">
                    Voir toutes les fonctionnalités
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* === RIGHT : preview live === */}
          <div className="relative min-h-[420px] overflow-hidden bg-neutral-50/50 p-6 md:min-h-[480px] md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="h-full"
              >
                <FeaturePreview slug={active.slug} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================================================
   FEATURE PREVIEWS — un mini-mockup par feature
   ============================================================ */

function FeaturePreview({ slug }: { slug: string }) {
  switch (slug) {
    case "sourcing":
      return <SourcingPreview />;
    case "negociation":
      return <NegociationPreview />;
    case "controle-qualite":
      return <QualityPreview />;
    case "suivi-colis":
      return <TrackingPreview />;
    default:
      return null;
  }
}

/* ----------- 1. Sourcing ----------- */
function SourcingPreview() {
  const SUPPLIERS = [
    {
      name: "Shenzhen Velvet Co.",
      city: "Shenzhen",
      price: "4,20€",
      rating: 4.8,
      tag: "Top choix",
      tagBg: "bg-green-100",
      tagColor: "text-green-700",
    },
    {
      name: "Yiwu Textile Group",
      city: "Yiwu",
      price: "3,80€",
      rating: 4.6,
      tag: "Bon marché",
      tagBg: "bg-primary-100",
      tagColor: "text-primary-700",
    },
    {
      name: "Guangzhou Premium",
      city: "Guangzhou",
      price: "5,60€",
      rating: 4.9,
      tag: "Premium",
      tagBg: "bg-amber-100",
      tagColor: "text-amber-700",
    },
  ];
  return (
    <div className="h-full">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-200">
        <Factory className="h-3 w-3 text-orange-500" />
        3 fournisseurs vérifiés
      </div>
      <h4 className="font-display text-[20px] font-extrabold text-neutral-900">
        Chouchous velours côtelé
      </h4>
      <div className="mt-0.5 text-[12px] text-neutral-500">
        Brief #SC-2026-0487 · MOQ 500
      </div>
      <ul className="mt-5 space-y-2.5">
        {SUPPLIERS.map((s, i) => (
          <motion.li
            key={s.name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-sm"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200 text-[12px] font-bold text-primary-700">
              {s.city[0]}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate text-[13px] font-bold text-neutral-900">
                  {s.name}
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${s.tagBg} ${s.tagColor}`}
                >
                  {s.tag}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-neutral-500">
                <MapPin className="h-2.5 w-2.5" />
                {s.city}
                <span>·</span>
                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                {s.rating}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-display text-[16px] font-extrabold text-neutral-900">
                {s.price}
              </div>
              <div className="text-[10px] text-neutral-500">/ unité</div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ----------- 2. Négociation ----------- */
function NegociationPreview() {
  return (
    <div className="h-full">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-200">
        <MessageSquare className="h-3 w-3 text-violet-500" />
        WhatsApp · Sourcey ↔ Wang
      </div>
      <h4 className="font-display text-[20px] font-extrabold text-neutral-900">
        5,10€ → 4,20€
      </h4>
      <div className="mt-0.5 text-[12px] text-green-600">
        ↓ -17,6% obtenus en 6 minutes
      </div>

      <div className="mt-5 space-y-2">
        <BubbleRight delay={0.1}>你好 Wang. 500 件 @ 3.80€ ?</BubbleRight>
        <BubbleLeft delay={0.25}>您好！最低 5.10€。</BubbleLeft>
        <BubbleRight delay={0.4}>On a 4.20€ ailleurs. Coop longue ?</BubbleRight>
        <BubbleLeft delay={0.55}>可以 4.20€。MOQ 500. 成交！</BubbleLeft>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="mt-3 flex justify-center"
        >
          <div className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-semibold text-green-800">
            Deal validé · 4,20€ × 500 = 2 100€
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function BubbleRight({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex justify-end"
    >
      <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-[#DCF8C6] px-3 py-2 text-[12.5px] leading-snug text-neutral-900 shadow-sm">
        {children}
        <div className="mt-0.5 flex justify-end">
          <CheckCheck className="h-2.5 w-2.5 text-[#4FC3F7]" />
        </div>
      </div>
    </motion.div>
  );
}

function BubbleLeft({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="flex justify-start"
    >
      <div className="max-w-[78%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[12.5px] leading-snug text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-100">
        {children}
      </div>
    </motion.div>
  );
}

/* ----------- 3. Quality ----------- */
function QualityPreview() {
  const CHECKS = [
    { label: "Couture & finitions", count: 42, ok: 42 },
    { label: "Couleur & teinture", count: 18, ok: 18 },
    { label: "Dimensions", count: 12, ok: 12 },
    { label: "Étiquetage", count: 8, ok: 6 },
    { label: "Packaging", count: 14, ok: 14 },
  ];
  const total = CHECKS.reduce((s, c) => s + c.count, 0);
  const totalOk = CHECKS.reduce((s, c) => s + c.ok, 0);
  const passRate = ((totalOk / total) * 100).toFixed(1);

  return (
    <div className="h-full">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-200">
        <Camera className="h-3 w-3 text-teal-500" />
        Inspection AQL 2.5
      </div>
      <h4 className="font-display text-[20px] font-extrabold text-neutral-900">
        Rapport de contrôle
      </h4>
      <div className="mt-0.5 text-[12px] text-neutral-500">
        Lot #SC-2026-0487 · 500 unités
      </div>

      {/* Pass rate */}
      <div className="mt-5 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="-rotate-90 transform">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="3" />
            <motion.circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${parseFloat(passRate)} 100`}
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: `${passRate} 100` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              pathLength="100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-display text-[13px] font-extrabold text-neutral-900">
            {passRate}%
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-700">
            <Check className="h-3 w-3" strokeWidth={3} />
            Accepté avec correctif
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            2 étiquettes à recoudre avant expédition
          </div>
        </div>
      </div>

      {/* Checklist */}
      <ul className="mt-3 space-y-1.5">
        {CHECKS.map((c, i) => {
          const pct = (c.ok / c.count) * 100;
          const allOk = c.ok === c.count;
          return (
            <li key={c.label} className="flex items-center gap-2 text-[11.5px]">
              <span className="min-w-[110px] text-neutral-700">{c.label}</span>
              <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                  className={`absolute inset-y-0 left-0 ${
                    allOk ? "bg-green-500" : "bg-amber-500"
                  }`}
                />
              </div>
              <span className="min-w-[40px] text-right font-semibold text-neutral-500">
                {c.ok}/{c.count}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ----------- 4. Tracking ----------- */
function TrackingPreview() {
  const MILESTONES = [
    { date: "13 mai", label: "Brief reçu", done: true, active: false },
    { date: "16 mai", label: "Fournisseurs présentés", done: true, active: false },
    { date: "18 mai", label: "Devis validé", done: true, active: false },
    { date: "20 mai", label: "Production lancée", done: true, active: false },
    { date: "26 mai", label: "Photos mi-prod", done: false, active: true },
    { date: "5 juin", label: "Inspection qualité", done: false, active: false },
    { date: "8 juin", label: "Expédition", done: false, active: false },
    { date: "18 juin", label: "Livré chez toi", done: false, active: false },
  ];
  return (
    <div className="h-full">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-600 ring-1 ring-inset ring-neutral-200">
        <Plane className="h-3 w-3 text-pink-500" />
        Suivi temps réel
      </div>
      <h4 className="font-display text-[20px] font-extrabold text-neutral-900">
        Ta commande, étape par étape
      </h4>
      <div className="mt-0.5 text-[12px] text-neutral-500">
        Brief #SC-2026-0487 · 50% complété
      </div>

      <ol className="relative mt-5 space-y-2.5">
        <div
          aria-hidden
          className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200"
        />
        {MILESTONES.map((m, i) => (
          <motion.li
            key={m.label}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * i }}
            className="relative flex items-center gap-3"
          >
            <span
              className={`relative z-10 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ring-2 ring-white ${
                m.done
                  ? "bg-primary-600"
                  : m.active
                    ? "bg-white ring-pink-300"
                    : "bg-neutral-200"
              }`}
            >
              {m.active && (
                <span className="absolute inset-0 -m-0.5 animate-ping rounded-full bg-pink-300/60" />
              )}
              {m.done && <Check className="h-2 w-2 text-white" strokeWidth={4} />}
            </span>
            <span
              className={`flex-1 text-[12.5px] ${
                m.done || m.active
                  ? "font-semibold text-neutral-900"
                  : "text-neutral-400"
              }`}
            >
              {m.label}
              {m.active && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-pink-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-pink-700">
                  En cours
                </span>
              )}
            </span>
            <span className="font-mono text-[10.5px] text-neutral-400">
              {m.date}
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
