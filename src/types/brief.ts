/**
 * Brief intake — schéma Zod + types TypeScript pour le formulaire multi-sections.
 *
 * Les valeurs des chips sont définies comme const arrays pour pouvoir les
 * réutiliser à la fois côté formulaire (rendre les options) et côté validation
 * (z.enum). Si tu ajoutes/retires une valeur, fais-le dans UN SEUL endroit.
 */

import { z } from "zod";

/* ============================================================
   SECTION 1 — PROFIL
   ============================================================ */

export const ECOM_LEVELS = [
  "Débutant",
  "Intermédiaire",
  "Confirmé",
  "Expert",
] as const;

export const MONTHLY_REVENUES = [
  "< 1 000 €",
  "1 000–3 000 €",
  "3 000–8 000 €",
  "8 000–20 000 €",
  "> 20 000 €",
] as const;

export const ACTIVITIES = [
  "Étudiant",
  "Salarié + side project",
  "Freelance",
  "E-commerçant à plein temps",
  "Autre",
] as const;

/* ============================================================
   SECTION 2 — OBJECTIFS
   ============================================================ */

export const MAIN_GOALS = [
  "Tester un produit rapidement",
  "Construire une marque long terme",
  "Remplacer mon revenu actuel",
  "Générer un revenu passif",
  "Scaler une boutique existante",
] as const;

export const TARGET_REVENUES = [
  "1 000–5 000 €/mois",
  "5 000–20 000 €/mois",
  "+ 20 000 €/mois",
] as const;

export const LAUNCH_DELAYS = [
  "ASAP (< 2 sem.)",
  "1 mois",
  "2–3 mois",
  "Pas de délai précis",
] as const;

export const BLOCKERS = [
  "Trouver un fournisseur fiable",
  "Négocier les prix",
  "Quel produit choisir",
  "Gérer la logistique",
  "Manque de budget",
  "Manque de temps",
] as const;

/* ============================================================
   SECTION 3 — PROJET
   ============================================================ */

export const PRODUCT_CATEGORIES = [
  "Mode / Accessoires",
  "Tech / High-tech",
  "Maison / Déco",
  "Beauté / Bien-être",
  "Sport / Outdoor",
  "Alimentaire",
  "Autre",
] as const;

export const TARGET_CLIENTS = [
  "Ados 13–18",
  "Jeunes adultes 18–30",
  "Adultes 30–50",
  "Femmes",
  "Hommes",
  "Niche passionnés",
] as const;

export const PROJECT_STAGES = [
  "Idée seulement",
  "Recherches en cours",
  "Boutique créée",
  "Déjà des ventes",
] as const;

export const SUPPLIER_HISTORY = [
  "Non, première fois",
  "Oui, mauvaise expérience",
  "Oui, ça s'est bien passé",
] as const;

export const SALES_PLATFORMS = [
  "Shopify",
  "WooCommerce",
  "Amazon FBA",
  "Etsy",
  "TikTok Shop",
  "Instagram Shopping",
  "Pas encore décidé",
] as const;

/* ============================================================
   SECTION 4 — BUDGET & SOURCING
   ============================================================ */

export const SOURCING_BUDGETS = [
  "< 300 €",
  "300–1 000 €",
  "1 000–5 000 €",
  "5 000–20 000 €",
  "> 20 000 €",
] as const;

export const MIN_QUANTITIES = [
  "1–50 unités (test)",
  "50–200",
  "200–1 000",
  "> 1 000",
] as const;

export const SELLING_PRICES = [
  "< 15 €",
  "15–30 €",
  "30–60 €",
  "60–150 €",
  "> 150 €",
] as const;

export const SUPPLIER_COUNTRIES = [
  "Chine",
  "Turquie",
  "Europe",
  "Inde",
  "Peu importe",
] as const;

export const DELIVERY_DELAYS = [
  "3–5 jours",
  "7–14 jours",
  "15–30 jours",
  "Peu importe",
] as const;

export const REQUIREMENTS = [
  "Packaging custom",
  "Certificat CE",
  "Label personnalisé",
  "Matières écologiques",
  "Dropshipping possible",
  "Échantillon avant commande",
] as const;

/* ============================================================
   SECTION 5 — RÉFÉRENCES
   ============================================================ */

export const COLOR_PALETTES = [
  "Noir / Blanc",
  "Coloris vifs",
  "Tons neutres",
  "Pastel",
  "Multicolore",
  "Peu importe",
] as const;

/* ============================================================
   SECTION 6 — CONTACT
   ============================================================ */

export const PREFERRED_CHANNELS = [
  "Email",
  "WhatsApp",
  "Email + WhatsApp",
] as const;

export const CALL_AVAILABILITIES = [
  "Matin 9h–12h",
  "Après-midi 14h–18h",
  "Soir 18h–21h",
  "Pas dispo",
] as const;

export const DISCOVERY_SOURCES = [
  "TikTok",
  "Instagram",
  "Bouche-à-oreille",
  "Google",
  "YouTube",
  "Autre",
] as const;

/* ============================================================
   SCHEMA ZOD COMPLET
   ============================================================ */

/** Une image uploadée par l'utilisateur, stockée en base64 dans le JSON */
const FileAttachment = z.object({
  name: z.string(),
  type: z.string(), // mime type
  size: z.number(), // bytes
  dataUrl: z.string(), // data:image/png;base64,...
});

export type FileAttachment = z.infer<typeof FileAttachment>;

export const BriefSchema = z.object({
  // SECTION 1 — Profil
  prenomNom: z.string().trim().min(2, "Prénom et nom requis"),
  marqueNom: z.string().trim().min(1, "Nom de marque requis"),
  ecomLevel: z.enum(ECOM_LEVELS),
  monthlyRevenue: z.enum(MONTHLY_REVENUES),
  activity: z.enum(ACTIVITIES),
  country: z.string().trim().min(2, "Pays requis"),

  // SECTION 2 — Objectifs
  mainGoal: z.enum(MAIN_GOALS),
  targetRevenue: z.enum(TARGET_REVENUES),
  launchDelay: z.enum(LAUNCH_DELAYS),
  blockers: z.array(z.enum(BLOCKERS)).default([]),

  // SECTION 3 — Projet
  productCategory: z.enum(PRODUCT_CATEGORIES),
  targetClients: z.array(z.enum(TARGET_CLIENTS)).min(1, "Choisis au moins une cible"),
  productDescription: z.string().trim().min(20, "Décris ton produit en quelques phrases"),
  projectStage: z.enum(PROJECT_STAGES),
  supplierHistory: z.enum(SUPPLIER_HISTORY),
  salesPlatforms: z.array(z.enum(SALES_PLATFORMS)).min(1, "Choisis au moins une plateforme"),

  // SECTION 4 — Budget & sourcing
  sourcingBudget: z.enum(SOURCING_BUDGETS),
  minQuantity: z.enum(MIN_QUANTITIES),
  sellingPrice: z.enum(SELLING_PRICES),
  supplierCountries: z.array(z.enum(SUPPLIER_COUNTRIES)).default([]),
  deliveryDelay: z.enum(DELIVERY_DELAYS),
  requirements: z.array(z.enum(REQUIREMENTS)).default([]),
  sourcingExtraInfo: z.string().trim().default(""),

  // SECTION 5 — Références
  productPhotos: z.array(FileAttachment).default([]),
  supplierDocs: z.array(FileAttachment).default([]),
  referenceUrls: z.array(z.string().trim()).default([]),
  colorPalettes: z.array(z.enum(COLOR_PALETTES)).default([]),

  // SECTION 6 — Contact
  email: z.string().trim().email("Email invalide"),
  whatsapp: z.string().trim().default(""),
  preferredChannel: z.enum(PREFERRED_CHANNELS),
  callAvailability: z.enum(CALL_AVAILABILITIES).optional(),
  discoverySource: z.enum(DISCOVERY_SOURCES).optional(),
  freeMessage: z.string().trim().default(""),
});

export type BriefData = z.infer<typeof BriefSchema>;

/* ============================================================
   STRUCTURE DES SECTIONS (pour la nav + progress)
   ============================================================ */

/** Champs requis par section — sert à calculer la complétion */
export const SECTION_REQUIRED_FIELDS: Record<number, (keyof BriefData)[]> = {
  1: ["prenomNom", "marqueNom", "ecomLevel", "monthlyRevenue", "activity", "country"],
  2: ["mainGoal", "targetRevenue", "launchDelay"],
  3: ["productCategory", "targetClients", "productDescription", "projectStage", "supplierHistory", "salesPlatforms"],
  4: ["sourcingBudget", "minQuantity", "sellingPrice", "deliveryDelay"],
  5: [], // Section optionnelle
  6: ["email", "preferredChannel"],
};

export const SECTION_LABELS: Record<number, string> = {
  1: "Profil",
  2: "Objectifs",
  3: "Projet",
  4: "Budget",
  5: "Références",
  6: "Contact",
};
