import {
  Camera,
  Box,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type ServiceType = "photoshoot" | "packaging" | "logo";

export interface ServiceTier {
  key: "basic" | "standard" | "premium";
  name: string;
  price: number; // euros
  popular?: boolean;
  deliveryDays: number;
  includes: string[];
}

export interface ServiceDefinition {
  type: ServiceType;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind color tokens used for the hero gradient + badges */
  accent: "amber" | "primary" | "enterprise";
  benefits: string[];
  tiers: ServiceTier[];
  examples: string[]; // image URLs (Unsplash)
  faqs: { q: string; a: string }[];
}

export const SERVICES: Record<ServiceType, ServiceDefinition> = {
  photoshoot: {
    type: "photoshoot",
    name: "Photoshoot produit en Chine",
    tagline:
      "Ton agent organise un shoot photo en studio pour ton catalogue e-com.",
    description:
      "Plutôt que de te débrouiller avec des photos d'usine moches, on prend en charge un shoot photo pro en Chine, direct dans un studio partenaire à Guangzhou ou Shenzhen. Tu reçois des visuels d'e-commerce premium prêts à uploader sur Shopify, parfait pour ta page produit, tes ads Meta et ton Insta.",
    icon: Camera,
    accent: "amber",
    benefits: [
      "Studio pro à Guangzhou ou Shenzhen — pas de fond blanc bricolé",
      "Fournis tes références (mood board, marques inspi), on suit le style",
      "Retouche basique incluse (suppression fond, ajustement couleurs)",
      "Livraison en 7 à 14 jours selon le pack",
      "Tous droits cédés — utilisation commerciale libre",
    ],
    tiers: [
      {
        key: "basic",
        name: "Essentiel",
        price: 200,
        deliveryDays: 10,
        includes: [
          "1 produit, 5 photos",
          "Fond blanc + 1 ambiance",
          "Retouche basique incluse",
          "Format JPG + PNG",
        ],
      },
      {
        key: "standard",
        name: "Pro",
        price: 350,
        deliveryDays: 7,
        popular: true,
        includes: [
          "1 produit, 12 photos",
          "Fond blanc + 3 ambiances",
          "Variations couleurs",
          "Retouche pro incluse",
          "1 vidéo 360° en bonus",
          "Format JPG + PNG + WebP",
        ],
      },
      {
        key: "premium",
        name: "Premium",
        price: 500,
        deliveryDays: 14,
        includes: [
          "Jusqu'à 3 produits, 25 photos",
          "Multi-décors (studio + extérieur)",
          "Lifestyle avec modèle",
          "2 vidéos courtes pour réseaux",
          "Retouche premium + colorimétrie",
          "Tous formats inclus",
        ],
      },
    ],
    examples: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=600&q=80&auto=format&fit=crop",
    ],
    faqs: [
      {
        q: "Faut-il que mon produit soit déjà en Chine ?",
        a: "Oui, idéalement échantillon déjà chez ton agent. Si tu n'as pas encore lancé la production, on peut quand même partir d'un prototype ou d'un échantillon usine.",
      },
      {
        q: "Combien de variations vous gérez ?",
        a: "Tier Essentiel = 1 produit. Tier Pro = 1 produit + variations couleurs. Tier Premium = jusqu'à 3 produits.",
      },
      {
        q: "Vous fournissez des modèles ?",
        a: "Oui sur le tier Premium uniquement (modèle asiatique pro). Pour modèle européen ou marque mode complète, on monte un devis custom.",
      },
    ],
  },
  packaging: {
    type: "packaging",
    name: "Design packaging custom",
    tagline:
      "Un packaging qui te démarque — design pro, fichiers prod, finitions premium.",
    description:
      "Pas de packaging cheap qui flingue ta marque. Notre graphiste partenaire conçoit ta boîte, ta pochette, ton étiquette ou ton flacon — selon ton univers de marque. On gère le design + on transmet les fichiers prêts pour impression à l'usine partenaire, qui s'occupe du tirage.",
    icon: Box,
    accent: "primary",
    benefits: [
      "Brief avec un vrai graphiste, pas un template generic",
      "2 à 5 propositions selon le pack",
      "Mockups 3D photo-réalistes pour valider",
      "Fichiers prod prêts pour impression (PDF, AI)",
      "Inclus : recommandation de finitions (gaufrage, dorure, etc.)",
    ],
    tiers: [
      {
        key: "basic",
        name: "Étiquette",
        price: 500,
        deliveryDays: 7,
        includes: [
          "1 design d'étiquette ou sticker",
          "2 propositions de direction",
          "1 round de révisions",
          "Mockup 3D fourni",
        ],
      },
      {
        key: "standard",
        name: "Box / Pochette",
        price: 1000,
        deliveryDays: 14,
        popular: true,
        includes: [
          "Design complet boîte ou pochette",
          "3 propositions",
          "3 rounds de révisions",
          "Mockups 3D photo-réalistes (3 angles)",
          "Recommandation finitions",
          "Fichiers prod imprimeur",
        ],
      },
      {
        key: "premium",
        name: "Range complète",
        price: 1500,
        deliveryDays: 21,
        includes: [
          "Système packaging complet (boîte + pochette + carte + étiquette)",
          "5 propositions de direction artistique",
          "Révisions illimitées (limite raisonnable)",
          "Mockups vidéo unboxing",
          "Guidelines d'utilisation",
          "Inclus : suivi imprimeur pour 1ère prod",
        ],
      },
    ],
    examples: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1635405074683-96d6921a2a68?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622637450330-4ccd3f4f0d12?w=600&q=80&auto=format&fit=crop",
    ],
    faqs: [
      {
        q: "Le tirage est inclus dans le prix ?",
        a: "Non — uniquement le design + les fichiers prod. Le tirage est facturé à l'unité par l'usine partenaire (généralement 0.50€ à 3€ par packaging selon le format et la finition).",
      },
      {
        q: "Combien de propositions je vais voir ?",
        a: "Tier Étiquette : 2 propositions. Tier Box : 3 propositions. Tier Range : 5 propositions + révisions illimitées.",
      },
      {
        q: "Combien de temps total entre brief et fichiers prod ?",
        a: "7 jours pour l'étiquette, 14 jours pour la box, 21 jours pour la range complète.",
      },
    ],
  },
  logo: {
    type: "logo",
    name: "Logo & identité visuelle",
    tagline:
      "Logo, palette, typo, guidelines — l'identité complète de ta marque DTC.",
    description:
      "Notre graphiste partenaire conçoit ton identité visuelle from scratch. Logo principal + variations, palette de couleurs, typographies, micro-guidelines. Tu reçois tout ce qu'il faut pour lancer ta marque, ton site, ton packaging, tes ads, ton Insta — avec une cohérence visuelle qui te rend pro.",
    icon: Palette,
    accent: "enterprise",
    benefits: [
      "Designer francophone (basé en France), pas un template AI",
      "Brief profond pour comprendre ta marque",
      "3 directions visuelles distinctes pour le logo",
      "Palette + typo + iconographie incluse",
      "Mini brand guide PDF livré (style guide)",
      "Fichiers vectoriels SVG/AI utilisables partout",
    ],
    tiers: [
      {
        key: "basic",
        name: "Logo seul",
        price: 500,
        deliveryDays: 7,
        includes: [
          "Logo principal en 3 propositions",
          "1 round de révisions",
          "Variations (couleur, monochrome, fond sombre)",
          "Fichiers SVG, PNG, PDF",
        ],
      },
      {
        key: "standard",
        name: "Logo + palette",
        price: 1000,
        deliveryDays: 14,
        popular: true,
        includes: [
          "Tout le tier Logo seul +",
          "Palette de 5 couleurs",
          "Sélection de 2 typographies",
          "Mini guide PDF 5 pages",
          "Mockup carte de visite + site",
          "2 rounds de révisions",
        ],
      },
      {
        key: "premium",
        name: "Identité complète",
        price: 2000,
        deliveryDays: 21,
        includes: [
          "Tout le tier Logo + palette +",
          "Iconographie custom (10 icônes)",
          "Patterns & textures",
          "Brand guide complet 15 pages",
          "Templates Insta + Stories",
          "Templates emails",
          "Révisions illimitées",
          "Suivi 30 jours post-livraison",
        ],
      },
    ],
    examples: [
      "https://images.unsplash.com/photo-1611224885990-ab7363d1f2a9?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=600&q=80&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=600&q=80&auto=format&fit=crop",
    ],
    faqs: [
      {
        q: "Je peux modifier le logo après la livraison ?",
        a: "Oui, tu reçois les fichiers vectoriels (SVG, AI) que tu peux modifier librement. Pour des modifs majeures, on peut faire un round de révision supplémentaire à 150€.",
      },
      {
        q: "Combien de temps prend le projet complet ?",
        a: "Logo seul : 7 jours. Logo + palette : 14 jours. Identité complète : 21 jours.",
      },
      {
        q: "Vous bossez avec quel type de marques ?",
        a: "DTC, e-com, food, cosmétique, mode, tech, services. On évite les marques très corporate / B2B grandes entreprises (pas notre style).",
      },
    ],
  },
};

export const SERVICE_LIST = Object.values(SERVICES);

export const SERVICE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  awaiting_quote: { label: "En attente de devis", color: "bg-amber-50 text-amber-700 border-amber-100" },
  quoted: { label: "Devis envoyé", color: "bg-primary-50 text-primary-700 border-primary-100" },
  in_progress: { label: "En cours", color: "bg-primary-50 text-primary-700 border-primary-100" },
  revisions: { label: "Révisions", color: "bg-amber-50 text-amber-700 border-amber-100" },
  delivered: { label: "Livré", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  cancelled: { label: "Annulé", color: "bg-neutral-100 text-neutral-600 border-neutral-200" },
};
