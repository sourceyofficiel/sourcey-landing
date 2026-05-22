/**
 * Source unique des 4 plans Sourcey (Découvrir / Essentiel / Pro / Premium).
 *
 * Utilisé par :
 *   - /pricing (cards, toggle mensuel/annuel)
 *   - /api/orders/create (calcul de la réduction selon le plan actif)
 *   - /api/webhooks/stripe (mapping Stripe Price ID → notre code interne)
 *   - /app/orders (total économisé)
 *
 * Pour ajouter/modifier un plan, fais-le ici en premier — tous les composants
 * et l'API en découlent.
 */

export type PlanSlug = "free" | "essential" | "pro" | "premium";

export type Period = "monthly" | "yearly";

export type Plan = {
  slug: PlanSlug;
  name: string;
  /** Tagline courte affichée sous le nom */
  tagline: string;
  /** Prix en euros TTC */
  priceMonthly: number;
  /** Prix mensuel facturé sur engagement annuel (= priceYearlyTotal / 12) */
  priceYearlyMonthly: number;
  /** Total facturé en une fois sur l'année */
  priceYearlyTotal: number;
  /** Réduction sur chaque commande passée via Sourcey (% appliqué au prix
   * fournisseur négocié) */
  orderDiscount: number;
  /** Plan mis en avant ("populaire" / "recommandé") dans la grille */
  highlighted: boolean;
  /** Liste des features qui apparaissent dans la card */
  features: string[];
  /** Texte du CTA principal sur la card */
  ctaLabel: string;
};

export const PLANS: Plan[] = [
  /* ============================================================ */
  {
    slug: "free",
    name: "Découvrir",
    tagline: "Pour tester Sourcey sans engagement",
    priceMonthly: 0,
    priceYearlyMonthly: 0,
    priceYearlyTotal: 0,
    orderDiscount: 0,
    highlighted: false,
    features: [
      "1 brief de sourcing par mois",
      "Accès au dashboard client",
      "Réponse de l'équipe sous 72h",
      "Pas de messagerie directe avec un agent",
      "Pas de fiches fournisseurs PDF",
      "Pas de négociation fournisseur",
      "Pas de réduction sur les commandes",
    ],
    ctaLabel: "Commencer gratuitement",
  },
  /* ============================================================ */
  {
    slug: "essential",
    name: "Essentiel",
    tagline: "Pour les e-commerçants qui démarrent",
    priceMonthly: 29,
    priceYearlyMonthly: 23,
    priceYearlyTotal: 278,
    orderDiscount: 5,
    highlighted: false,
    features: [
      "3 briefs de sourcing par mois",
      "Messagerie directe avec un agent",
      "Réponse sous 48h",
      "Fiches fournisseurs PDF téléchargeables",
      "Suivi du statut de la recherche en temps réel",
      "−5% sur chaque commande via Sourcey",
    ],
    ctaLabel: "Choisir Essentiel",
  },
  /* ============================================================ */
  {
    slug: "pro",
    name: "Pro",
    tagline: "Le plus choisi pour scaler ton sourcing",
    priceMonthly: 79,
    priceYearlyMonthly: 63,
    priceYearlyTotal: 756,
    orderDiscount: 10,
    highlighted: true,
    features: [
      "Briefs de sourcing illimités",
      "Négociation des prix fournisseur incluse",
      "Réponse prioritaire sous 24h",
      "Comparatif multi-fournisseurs par brief",
      "Contrôle qualité à réception inclus",
      "Accès aux fournisseurs exclusifs Sourcey",
      "Relance auto du fournisseur sous 48h",
      "−10% sur chaque commande via Sourcey",
    ],
    ctaLabel: "Choisir Pro",
  },
  /* ============================================================ */
  {
    slug: "premium",
    name: "Premium",
    tagline: "Avec un agent dédié et une garantie de résultat",
    priceMonthly: 149,
    priceYearlyMonthly: 119,
    priceYearlyTotal: 1428,
    orderDiscount: 15,
    highlighted: false,
    features: [
      "Tout Pro inclus",
      "Agent dédié nommé (même interlocuteur)",
      "Accès WhatsApp direct à ton agent",
      "1 appel stratégique par mois",
      "Sourcing multi-pays en simultané",
      "Gestion logistique complète",
      "Rapport mensuel personnalisé",
      "Réponse sous 12h garantie",
      "Garantie satisfaction : remboursé si aucun fournisseur sous 7j",
      "−15% sur chaque commande via Sourcey",
    ],
    ctaLabel: "Choisir Premium",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

/** Récupère un plan par son slug */
export function getPlan(slug: string | null | undefined): Plan | undefined {
  if (!slug) return undefined;
  return PLANS.find((p) => p.slug === slug);
}

/**
 * Récupère le % de réduction sur commande pour un plan.
 * Accepte aussi les slugs annuels (`essential_annual`, `pro_annual`, etc.)
 */
export function getOrderDiscount(stripePlan: string | null | undefined): number {
  if (!stripePlan) return 0;
  // Normalise les variantes annuelles vers leur slug de base
  const base = stripePlan.replace("_annual", "") as PlanSlug;
  return getPlan(base)?.orderDiscount ?? 0;
}

/**
 * Normalise un stripePlan (free | essential | essential_annual | pro | ...)
 * vers le slug de base utilisé par PLANS.
 */
export function normalizePlanSlug(stripePlan: string | null | undefined): PlanSlug {
  if (!stripePlan) return "free";
  const base = stripePlan.replace("_annual", "");
  if (base === "essential" || base === "pro" || base === "premium") return base;
  return "free";
}

/**
 * Calcule le montant économisé + le montant net pour une commande.
 *   savedAmount = grossAmount × discountPct / 100
 *   netAmount   = grossAmount − savedAmount
 */
export function computeOrderAmounts(grossAmount: number, discountPct: number) {
  const savedAmount = Math.round((grossAmount * discountPct) / 100);
  const netAmount = grossAmount - savedAmount;
  return { savedAmount, netAmount };
}
