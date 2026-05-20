"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Star,
  MapPin,
  CheckCircle2,
  Languages,
  Briefcase,
  Wrench,
  Zap,
  AlertTriangle,
  ArrowRight,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import type { AgentMatch } from "@/lib/agent-matching";

const REASON_ICONS = {
  specialty: Wrench,
  location: MapPin,
  experience: Briefcase,
  rating: Star,
  languages: Languages,
  availability: Zap,
  complexity: CheckCircle2,
};

const AVAILABILITY_STYLES = {
  available: {
    label: "Disponible",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  busy: {
    label: "Charge modérée",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  stretched: {
    label: "Très occupé",
    badge: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
} as const;

interface Props {
  match: AgentMatch;
  rank: number; // 1, 2, 3
}

export function AgentMatchCard({ match, rank }: Props) {
  const { agent, score, reasons, availability, estimatedDevisDays, load } =
    match;
  const isTop = rank === 1;
  const av = AVAILABILITY_STYLES[availability];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.55,
        delay: (rank - 1) * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn(
        "relative flex flex-col rounded-3xl border bg-white p-6 transition-all",
        isTop
          ? "border-primary-200 shadow-brand ring-1 ring-primary-100"
          : "border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {isTop && (
        <>
          <BorderBeam
            size={70}
            duration={9}
            colorFrom="#3B82F6"
            colorTo="#9333EA"
          />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-brand">
            <Crown className="h-3 w-3" />
            Best match
          </span>
        </>
      )}

      {/* Top: avatar + score */}
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={agent.avatar}
            alt={agent.fullName}
            width={64}
            height={64}
            className="h-full w-full object-cover"
          />
          {agent.verified && (
            <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-primary-600 text-white ring-2 ring-white">
              <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-extrabold leading-tight text-neutral-900">
            {agent.fullName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="h-3 w-3" />
            {agent.city}, Chine
          </p>
          <div className="mt-2 flex items-center gap-1 text-xs">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-neutral-900">
              {agent.rating.toFixed(1)}
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-500">{agent.missions} missions</span>
          </div>
        </div>
        <div className="text-right">
          <ScoreGauge value={score} highlight={isTop} />
        </div>
      </div>

      {/* Why this agent */}
      <div className="mt-5 space-y-2 rounded-2xl bg-neutral-50/60 p-4">
        <p className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
          Pourquoi cet agent
        </p>
        <ul className="space-y-1.5">
          {reasons.map((r, i) => {
            const Icon = REASON_ICONS[r.icon];
            const isWarning = r.icon === "availability" && availability === "stretched";
            return (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 text-[13px] leading-snug",
                  isWarning ? "text-amber-700" : "text-neutral-700"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                    isWarning
                      ? "bg-amber-100 text-amber-700"
                      : "bg-primary-100 text-primary-700"
                  )}
                >
                  {isWarning ? (
                    <AlertTriangle className="h-2.5 w-2.5" />
                  ) : (
                    <Icon className="h-2.5 w-2.5" />
                  )}
                </span>
                <span>{r.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Specialties tags */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {agent.specialties.map((s) => (
          <span
            key={s}
            className="rounded-full bg-white border border-neutral-200 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700"
          >
            {s}
          </span>
        ))}
      </div>

      {/* Footer: availability + devis ETA */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
            av.badge
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", av.dot)} />
          {av.label}
        </span>
        <p className="text-[11px] text-neutral-500">
          Devis sous{" "}
          <strong className="text-neutral-700">{estimatedDevisDays}j</strong>
        </p>
      </div>

      {/* CTA */}
      <Button
        asChild
        variant={isTop ? "primary" : "secondary"}
        size="lg"
        className="mt-4 w-full"
      >
        <Link href={`/signup?agent=${agent.slug}`}>
          {isTop ? "Démarrer avec" : "Choisir"} {agent.fullName.split(" ")[0]}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  );
}

function ScoreGauge({ value, highlight }: { value: number; highlight: boolean }) {
  const angle = (value / 100) * 360;
  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className="relative grid h-14 w-14 place-items-center rounded-full"
        style={{
          background: `conic-gradient(${
            highlight ? "#3B82F6" : "#64748B"
          } ${angle}deg, #E2E8F0 ${angle}deg)`,
        }}
      >
        <div className="grid h-11 w-11 place-items-center rounded-full bg-white">
          <span
            className={cn(
              "font-display text-base font-extrabold tabular-nums",
              highlight ? "text-primary-700" : "text-neutral-700"
            )}
          >
            {value}
          </span>
        </div>
      </div>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        Match
      </p>
    </div>
  );
}
