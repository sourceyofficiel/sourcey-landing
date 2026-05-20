"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Check,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { ServiceTier, ServiceType } from "@/lib/data/services";

interface Props {
  type: ServiceType;
  tiers: ServiceTier[];
}

type TierKey = ServiceTier["key"];

export function ServiceOrderForm({ type, tiers }: Props) {
  const router = useRouter();
  const initialTier: TierKey =
    tiers.find((t) => t.popular)?.key ?? tiers[0].key;
  const [tier, setTier] = useState<TierKey>(initialTier);
  const [brief, setBrief] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/services/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, tier, brief }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      setStatus("success");
      setTimeout(() => router.push("/app/services/orders"), 1500);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  const selectedTier = tiers.find((t) => t.key === tier);

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-3xl border border-emerald-200 bg-emerald-50/30 p-10 text-center"
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg">
          <Check className="h-6 w-6" strokeWidth={3} />
        </div>
        <h3 className="mt-5 font-display text-2xl font-extrabold text-neutral-900">
          Commande reçue 🎉
        </h3>
        <p className="mt-2 max-w-md text-neutral-600">
          On t'envoie un devis précis sous 24h dans ta{" "}
          <strong>messagerie Sourcey</strong>. Tu seras redirigé vers tes
          commandes…
        </p>
        <Loader2 className="mt-5 h-4 w-4 animate-spin text-neutral-400" />
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div>
        <span className="text-sm font-semibold text-neutral-700">
          1. Choisis ton tier
        </span>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {tiers.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTier(t.key)}
              className={cn(
                "relative flex flex-col items-start gap-1 rounded-2xl border px-4 py-3 text-left transition-all",
                tier === t.key
                  ? "border-primary-300 bg-primary-50/60 ring-2 ring-primary-100"
                  : "border-neutral-200 bg-white hover:border-neutral-300"
              )}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                {t.name}
              </span>
              <span className="font-display text-xl font-extrabold text-neutral-900">
                {t.price}€
              </span>
              <span className="text-[11px] text-neutral-500">
                {t.deliveryDays}j de délai
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block">
          <span className="text-sm font-semibold text-neutral-700">
            2. Décris ton projet (min. 20 caractères)
          </span>
          <textarea
            required
            minLength={20}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={6}
            placeholder={getPlaceholder(type)}
            className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 bg-neutral-50/40 p-4 text-[14.5px] leading-relaxed text-neutral-900 placeholder:text-neutral-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/60"
          />
          <p className="mt-1 text-right text-[11px] text-neutral-500">
            {brief.length}/2000
          </p>
        </label>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-7 flex flex-col items-stretch justify-between gap-4 border-t border-neutral-100 pt-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Estimation
          </p>
          <p className="font-display text-2xl font-extrabold text-neutral-900">
            {selectedTier?.price}€ <span className="text-base font-medium text-neutral-500">HT</span>
          </p>
          <p className="text-[11px] text-neutral-500">
            Facturation après validation du devis · Aucun paiement maintenant
          </p>
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "loading" || brief.trim().length < 20}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Demander un devis précis
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function getPlaceholder(type: string): string {
  switch (type) {
    case "photoshoot":
      return "Ex : 12 photos de mon nouveau bougie parfumée, fond beige + ambiance déco scandinave. Style des photos Maison Margiela Replica. Échantillon déjà chez Chen Mei à Guangzhou.";
    case "packaging":
      return "Ex : Box pliante kraft pour ma marque de café (Atelier Brûlé). Direction artistique : minimaliste, terre cuite, typo serif. Tirage de 1000 pièces à prévoir avec usine Yiwu.";
    case "logo":
      return "Ex : Marque DTC de cosmétiques bio « Lune ». Cible femmes 25-40 urbaines. Univers : doux, naturel, sophistiqué. Pas de tropes (feuilles, lunes littérales). J'aime Aesop, Le Labo, Glossier.";
    default:
      return "Décris ton projet en détail : objectif, références, contraintes…";
  }
}
