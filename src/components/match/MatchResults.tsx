"use client";

import { motion } from "motion/react";
import { RotateCcw, Tags, Layers, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AgentMatchCard } from "./AgentMatchCard";
import type { AgentMatch, BriefAnalysis } from "@/lib/agent-matching";

interface Props {
  analysis: BriefAnalysis;
  matches: AgentMatch[];
  totalCandidates: number;
  onReset: () => void;
}

export function MatchResults({
  analysis,
  matches,
  totalCandidates,
  onReset,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Analysis summary */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-neutral-200 bg-gradient-to-br from-primary-50/40 via-white to-white p-5 md:flex-row md:items-center md:p-6">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Brief analysé
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px]">
            <Pill icon={Tags} label="Catégorie" value={analysis.categoryLabel} />
            <Pill
              icon={Layers}
              label="Complexité"
              value={"●".repeat(analysis.complexity) + "○".repeat(5 - analysis.complexity)}
            />
            {analysis.keywords.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">
                  Mots-clés détectés :
                </span>
                <div className="flex flex-wrap gap-1">
                  {analysis.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-md bg-primary-100/80 px-1.5 py-0.5 text-[11px] font-medium text-primary-800"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Nouvelle recherche
        </Button>
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-extrabold text-neutral-900">
          Top {matches.length} agents pour ton projet
        </h2>
        <p className="text-xs text-neutral-500">
          Sur {totalCandidates} agents évalués
        </p>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {matches.map((m, i) => (
          <AgentMatchCard key={m.agent.id} match={m} rank={i + 1} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-8 rounded-2xl border border-primary-100 bg-primary-50/40 p-5 text-center"
      >
        <p className="text-sm text-neutral-700">
          <strong className="text-neutral-900">Le saviez-vous ?</strong>{" "}
          Nos clients gardent en moyenne <strong>le même agent pendant 8 mois</strong>{" "}
          après la 1ʳᵉ commande. Choisis-en un — il deviendra ton bras droit en Chine.
        </p>
      </motion.div>
    </motion.div>
  );
}

function Pill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-neutral-400" />
      <span className="text-xs font-semibold text-neutral-500">{label} :</span>
      <span className="text-[13.5px] font-bold text-neutral-900">{value}</span>
    </div>
  );
}
