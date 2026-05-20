"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Package,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PRESETS = [
  {
    label: "Bougie parfumée custom",
    text: "Bougies parfumées en cire de soja, contenant verre ambré 8cm, étiquette personnalisée avec mon logo, parfum vanille + bois de santal. 500 unités.",
  },
  {
    label: "Hoodie streetwear",
    text: "Hoodie oversize unisex en coton bio 350g, broderie sur la poitrine, étiquettes intérieures custom, sizing EU. 200 pièces sur 4 tailles.",
  },
  {
    label: "Chargeur USB-C 65W",
    text: "Chargeur USB-C 65W GaN compact pour ma marque DTC, finition mate, certif CE + FCC + RoHS. Packaging custom. 1000 unités.",
  },
  {
    label: "Bijoux acier inoxydable",
    text: "Collection de bijoux acier inoxydable 316L plaqué or 18k. 8 références (colliers, bagues, bracelets). Packaging individuel pochon coton.",
  },
];

interface Props {
  onSubmit: (description: string, quantity?: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function MatchForm({ onSubmit, loading, error }: Props) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");

  function applyPreset(text: string) {
    setDescription(text);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    onSubmit(description.trim(), quantity ? Number(quantity) : undefined);
  }

  const charCount = description.length;
  const canSubmit = charCount >= 10 && !loading;

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={handleSubmit}
      className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm md:p-8"
    >
      <label className="block">
        <span className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Sparkles className="h-3.5 w-3.5 text-primary-600" />
          Décris-nous ce que tu veux sourcer
        </span>
        <div className="mt-2 relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex : bougies parfumées en cire de soja, contenant verre ambré 8cm, étiquette personnalisée…"
            rows={5}
            className={cn(
              "w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4 text-[15px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 transition-all",
              "focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/60"
            )}
            disabled={loading}
          />
          <span
            className={cn(
              "absolute bottom-2 right-3 text-[11px] font-medium",
              charCount < 10 ? "text-neutral-400" : "text-primary-700"
            )}
          >
            {charCount}/2000
          </span>
        </div>
      </label>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end">
        <label className="block flex-1 md:max-w-[200px]">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
            <Package className="h-3 w-3" />
            Quantité cible (optionnel)
          </span>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="ex: 500"
            className="mt-1.5 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100/60"
            disabled={loading}
          />
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Pas d'inspi ? Essaie un de ces exemples
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.text)}
              disabled={loading}
              className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyse en cours…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Trouver mes agents
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        <div className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Powered by GPT-4 · gratuit, sans inscription
        </div>
      </div>
    </motion.form>
  );
}
