export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  jobToBeDone: string;
  priceMonthly: number;
  priceYearly: number;
  /** Negotiation discount applied to the FOB factory unit price. 0 = no discount. */
  unitDiscount: number;
  /** Short label shown under the price (e.g. "Rentabilisé dès 290€ de commande"). */
  breakEvenLabel?: string;
  cta: string;
  href: string;
  features: string[];
  notIncluded?: string[];
  featured?: boolean;
}

export const b2cPlans: PricingPlan[] = [
  {
    id: "decouverte",
    name: "Découverte",
    tagline: "Goûte Sourcey, sans engagement",
    jobToBeDone: "Tester avant d'investir",
    priceMonthly: 0,
    priceYearly: 0,
    unitDiscount: 0,
    cta: "Commencer gratuitement",
    href: "/signup?plan=decouverte",
    features: [
      "Prix usine standard (sans négociation)",
      "1 demande de sourcing active",
      "Accès complet au catalogue",
      "Match IA + Visual Search (3 fois / mois)",
      "Brand Coach IA (1 session)",
      "Communauté Discord",
    ],
    notIncluded: [
      "Tarifs négociés par Sourcey",
      "Chat illimité avec un agent",
      "Sample gratuit",
    ],
  },
  {
    id: "lancement",
    name: "Lancement",
    tagline: "Tu lances ton premier produit",
    jobToBeDone: "Du rêve à la première vente",
    priceMonthly: 29,
    priceYearly: 23,
    unitDiscount: 0.1,
    featured: true,
    breakEvenLabel: "Rentabilisé dès 290€ d'achat",
    cta: "Lancer mon premier produit",
    href: "/signup?plan=lancement",
    features: [
      "−10 % sur tous les prix usine",
      "3 demandes de sourcing en parallèle",
      "Chat illimité avec ton agent francophone",
      "1 sample gratuit par mois",
      "Match IA + Visual Search illimités",
      "Brand Coach + génération fiches Shopify",
      "Tracking commandes temps réel",
      "Support email sous 24h",
    ],
  },
  {
    id: "scaling",
    name: "Scaling",
    tagline: "Tu multiplies les produits qui gagnent",
    jobToBeDone: "3 à 10 SKUs en parallèle",
    priceMonthly: 79,
    priceYearly: 63,
    unitDiscount: 0.2,
    breakEvenLabel: "Rentabilisé dès 395€ d'achat",
    cta: "Passer en Scaling",
    href: "/signup?plan=scaling",
    features: [
      "−20 % sur tous les prix usine",
      "10 demandes actives en parallèle",
      "Agent dédié 1-to-1",
      "Samples illimités (jusqu'à 3 / mois)",
      "Vidéo QC systématique",
      "Traduction temps réel FR ↔ ZH",
      "Import auto Shopify / WooCommerce",
      "Coaching mensuel 30min",
      "Support WhatsApp prioritaire",
    ],
  },
  {
    id: "marque",
    name: "Marque",
    tagline: "Tu deviens une vraie marque",
    jobToBeDone: "10+ SKUs, vers 100k€/an",
    priceMonthly: 149,
    priceYearly: 119,
    unitDiscount: 0.3,
    breakEvenLabel: "Rentabilisé dès 497€ d'achat",
    cta: "Devenir une marque",
    href: "/signup?plan=marque",
    features: [
      "−30 % sur tous les prix usine",
      "Demandes illimitées",
      "2 agents dédiés en parallèle",
      "Samples illimités sans frais",
      "1 photoshoot pro inclus par trimestre",
      "1 visite virtuelle d'usine par trimestre",
      "Account Manager côté France",
      "Coaching mensuel 60min",
      "Reporting analytics mensuel",
      "API + Support WhatsApp 24/7",
    ],
  },
];

export const enterprisePlan: PricingPlan = {
  id: "enterprise",
  name: "Entreprise",
  tagline: "Pour les marques et les gros volumes",
  jobToBeDone: "Au-delà de 100k€/an d'achats",
  priceMonthly: 0,
  priceYearly: 0,
  unitDiscount: 0.4,
  cta: "Parler à un commercial",
  href: "/entreprise",
  features: [
    "−40 % et plus sur les prix usine",
    "Agent dédié 1-to-1 non partagé",
    "Demandes illimitées",
    "Visites d'usine organisées sur place",
    "Entrepôt EU intégré + 3PL",
    "Gestion TVA EU + IOSS",
    "API privée pour intégration ERP",
    "Account manager dédié côté Sourcey",
    "Reporting mensuel personnalisé",
    "SLA contractuel",
  ],
};

export function computeSavings(
  monthlyOrderValueEur: number
): { planId: string; savings: number; net: number; recommended: boolean }[] {
  const rows = b2cPlans.map((plan) => {
    const savings = monthlyOrderValueEur * plan.unitDiscount;
    const net = savings - plan.priceMonthly;
    return { planId: plan.id, savings, net, recommended: false };
  });
  const bestId = rows.reduce((best, x) => (x.net > best.net ? x : best), rows[0]).planId;
  return rows.map((r) => ({ ...r, recommended: r.planId === bestId }));
}
