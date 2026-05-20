import { agents, type Agent } from "@/lib/data/agents";

// ============================================================
// AGENT MATCHING ENGINE
// ============================================================
// Deterministic scoring engine that ranks agents against a user's
// sourcing description. Designed to be a drop-in for an OpenAI-powered
// version later — `analyzeBrief` is the seam.
// ============================================================

export type CategoryKey =
  | "mode"
  | "beaute"
  | "electronique"
  | "maison"
  | "sport"
  | "bijouterie"
  | "enfant"
  | "cuisine"
  | "general";

interface CategoryInfo {
  label: string;
  /** Unmistakable category indicators — if matched, this category wins outright */
  primary: string[];
  /** Secondary keywords used as tie-breakers and scoring */
  keywords: string[];
  /** Cities that are historically strong hubs for this category */
  hubCities: string[];
  /** Specialty labels (matching `agent.specialties`) that fit this category */
  specialties: string[];
}

const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  mode: {
    label: "Mode & textile",
    primary: [
      "hoodie", "t-shirt", "tshirt", "tee-shirt", "sweat", "vêtement",
      "streetwear", "robe", "chemise", "pantalon", "jean", "veste", "polo",
      "broderie",
    ],
    keywords: [
      "textile", "mode", "couture", "cuir", "uniforme", "coton",
    ],
    hubCities: ["Guangzhou"],
    specialties: ["Textile", "Mode", "Cuir"],
  },
  beaute: {
    label: "Beauté & cosmétique",
    primary: [
      "cosmétique", "crème", "maquillage", "soin du visage", "savon",
      "shampoing", "sérum", "rouge à lèvres", "vernis", "fond de teint",
    ],
    keywords: ["beauté", "parfum", "bio", "naturel"],
    hubCities: ["Shanghai", "Guangzhou"],
    specialties: ["Beauté", "Cosmétique", "Bien-être"],
  },
  electronique: {
    label: "Électronique & tech",
    primary: [
      "usb", "chargeur", "câble", "écran", "led", "écouteur", "casque",
      "bluetooth", "wifi", "speaker", "haut-parleur", "drone", "smartwatch",
      "iot",
    ],
    keywords: ["électronique", "gadget", "tech", "smart", "connecté"],
    hubCities: ["Shenzhen"],
    specialties: ["Électronique", "Tech", "Gadgets"],
  },
  maison: {
    label: "Maison & décoration",
    primary: [
      "bougie", "lampe", "luminaire", "miroir", "vase", "tableau", "horloge",
      "rideau", "coussin", "tapis de salon", "parfum d'intérieur", "diffuseur",
    ],
    keywords: ["déco", "maison", "rangement", "accessoire maison", "cire"],
    hubCities: ["Yiwu", "Ningbo"],
    specialties: ["Maison", "Décoration", "Accessoires"],
  },
  sport: {
    label: "Sport & outdoor",
    primary: [
      "yoga", "haltère", "musculation", "ballon", "raquette", "élastique",
      "tapis de sport", "tapis de yoga", "outdoor",
    ],
    keywords: ["sport", "fitness", "running", "vélo", "randonnée"],
    hubCities: ["Ningbo"],
    specialties: ["Sport", "Outdoor", "Fitness"],
  },
  bijouterie: {
    label: "Bijouterie & accessoires",
    primary: [
      "bijou", "collier", "bague", "montre", "bracelet", "boucle d'oreille",
      "pendentif", "acier inoxydable", "plaqué or", "plaqué argent",
    ],
    keywords: ["chaîne", "doré", "argenté", "luxe"],
    hubCities: ["Shenzhen", "Yiwu"],
    specialties: ["Bijouterie", "Montres", "Luxe"],
  },
  enfant: {
    label: "Jouets & enfants",
    primary: [
      "jouet", "peluche", "puzzle", "doudou", "poussette", "biberon",
      "éducatif",
    ],
    keywords: ["enfant", "bébé", "kids"],
    hubCities: ["Yiwu"],
    specialties: ["Jouets", "Enfants", "Bébé"],
  },
  cuisine: {
    label: "Cuisine & électroménager",
    primary: [
      "casserole", "ustensile", "expresso", "couteau de cuisine", "blender",
      "wok", "poêle", "thermos", "mug", "tasse à café",
    ],
    keywords: ["cuisine", "café", "robot"],
    hubCities: ["Guangzhou"],
    specialties: ["Cuisine", "Ustensiles", "Électroménager"],
  },
  general: {
    label: "Tous secteurs",
    primary: [],
    keywords: [],
    hubCities: [],
    specialties: [],
  },
};

export interface BriefAnalysis {
  category: CategoryKey;
  categoryLabel: string;
  keywords: string[];
  /** Agent-side specialty labels that match */
  matchedSpecialties: string[];
  /** Estimated complexity 1..5 */
  complexity: number;
}

/**
 * Lightweight, deterministic brief analyzer.
 * Replace this with an OpenAI call for production — the return shape
 * is what the rest of the pipeline expects.
 */
export function analyzeBrief(description: string): BriefAnalysis {
  const text = description.toLowerCase();

  let bestCategory: CategoryKey = "general";
  let bestScore = 0;
  const matchedKw: string[] = [];

  // Pass 1 — primary keywords. A single primary hit nails the category.
  for (const [key, info] of Object.entries(CATEGORIES) as [
    CategoryKey,
    CategoryInfo,
  ][]) {
    if (key === "general") continue;
    const primaryHits = info.primary.filter((kw) => text.includes(kw));
    if (primaryHits.length > 0) {
      const secondaryHits = info.keywords.filter((kw) => text.includes(kw));
      // Weight primary x3 — heavy thumbs on the scale
      const totalScore = primaryHits.length * 3 + secondaryHits.length;
      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestCategory = key;
        matchedKw.splice(
          0,
          matchedKw.length,
          ...[...primaryHits, ...secondaryHits]
        );
      }
    }
  }

  // Pass 2 — if nothing matched a primary, fall back to secondary keywords
  if (bestCategory === "general") {
    for (const [key, info] of Object.entries(CATEGORIES) as [
      CategoryKey,
      CategoryInfo,
    ][]) {
      if (key === "general") continue;
      const hits = info.keywords.filter((kw) => text.includes(kw));
      if (hits.length > bestScore) {
        bestScore = hits.length;
        bestCategory = key;
        matchedKw.splice(0, matchedKw.length, ...hits);
      }
    }
  }

  // Complexity heuristic: long brief + technical words → higher complexity
  const techWords = [
    "certif", "ce", "rohs", "fcc", "iso", "norme", "spécification",
    "moq", "tolérance", "qualité", "garantie", "personnalisé", "custom",
    "logo", "packaging", "étiquette",
  ];
  const techHits = techWords.filter((w) => text.includes(w)).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const complexity = Math.min(
    5,
    1 + Math.floor(techHits / 2) + (wordCount > 80 ? 1 : 0)
  );

  return {
    category: bestCategory,
    categoryLabel: CATEGORIES[bestCategory].label,
    keywords: matchedKw.slice(0, 6),
    matchedSpecialties: CATEGORIES[bestCategory].specialties,
    complexity,
  };
}

// ============================================================
// SCORING
// ============================================================

export interface MatchReason {
  icon:
    | "specialty"
    | "location"
    | "experience"
    | "rating"
    | "languages"
    | "availability"
    | "complexity";
  text: string;
}

export interface AgentMatch {
  agent: Agent;
  score: number; // 0–99
  reasons: MatchReason[];
  load: number; // 0–100, current workload (mocked)
  availability: "available" | "busy" | "stretched";
  estimatedDevisDays: number;
}

/**
 * Stable pseudo-random load per agent so each session sees the same
 * "current capacity" — feels like a real ops dashboard, not random noise.
 */
function mockLoad(agentId: string): number {
  let h = 0;
  for (let i = 0; i < agentId.length; i++) {
    h = (h * 31 + agentId.charCodeAt(i)) >>> 0;
  }
  return 20 + (h % 70); // 20–89
}

function availabilityFromLoad(load: number): AgentMatch["availability"] {
  if (load < 55) return "available";
  if (load < 80) return "busy";
  return "stretched";
}

export interface MatchInput {
  description: string;
  targetQuantity?: number;
}

export function matchAgents(input: MatchInput, limit = 3): {
  analysis: BriefAnalysis;
  matches: AgentMatch[];
  totalCandidates: number;
} {
  const analysis = analyzeBrief(input.description);
  const cat = CATEGORIES[analysis.category];

  const scored: AgentMatch[] = agents
    .filter((a) => a.verified)
    .map((agent) => {
      const reasons: MatchReason[] = [];
      let score = 0;

      // Specialty overlap (40 pts max)
      const overlap = agent.specialties.filter((s) =>
        cat.specialties.some(
          (cs) => cs.toLowerCase() === s.toLowerCase()
        )
      );
      if (overlap.length > 0) {
        const pts = Math.min(40, 20 + overlap.length * 12);
        score += pts;
        reasons.push({
          icon: "specialty",
          text: `Spécialisé en ${overlap.join(", ")}`,
        });
      } else if (analysis.category === "general") {
        score += 18;
      } else {
        score += 6;
      }

      // City fit (20 pts max)
      const cityFit = cat.hubCities.includes(agent.city);
      if (cityFit) {
        score += 20;
        reasons.push({
          icon: "location",
          text: `${agent.city} est LE hub Chine pour ${cat.label.toLowerCase()}`,
        });
      } else {
        score += 6;
      }

      // Experience (20 pts max via mission count)
      const expPts = Math.min(20, Math.floor(agent.missions / 8));
      score += expPts;
      if (agent.missions >= 100) {
        reasons.push({
          icon: "experience",
          text: `${agent.missions} missions réussies sur la plateforme`,
        });
      } else if (agent.missions >= 50) {
        reasons.push({
          icon: "experience",
          text: `${agent.missions} missions à son actif`,
        });
      }

      // Rating (10 pts max)
      score += agent.rating * 2;
      if (agent.rating >= 4.9) {
        reasons.push({
          icon: "rating",
          text: `Note client ${agent.rating.toFixed(1)}/5 ⭐`,
        });
      }

      // Languages bonus
      if (agent.languages.includes("en")) {
        score += 4;
        if (analysis.complexity >= 4) {
          reasons.push({
            icon: "languages",
            text: "Parle anglais — utile pour les certifs internationaux",
          });
        }
      }

      // Availability
      const load = mockLoad(agent.id);
      const availability = availabilityFromLoad(load);
      if (availability === "available") {
        score += 6;
        reasons.push({
          icon: "availability",
          text: `Disponible immédiatement (charge ${load}%)`,
        });
      } else if (availability === "busy") {
        score += 2;
      } else {
        score -= 4;
        reasons.push({
          icon: "availability",
          text: `Charge élevée actuellement (${load}%) — délais +48h`,
        });
      }

      // Complexity bonus: experienced agents handle complex briefs better
      if (analysis.complexity >= 4 && agent.missions >= 100) {
        score += 4;
        reasons.push({
          icon: "complexity",
          text: "Habitué aux dossiers techniques (certifs, custom OEM)",
        });
      }

      // Cap reasons to top 4 for UI clarity
      const topReasons = reasons.slice(0, 4);

      return {
        agent,
        score: Math.min(99, Math.round(score)),
        reasons: topReasons,
        load,
        availability,
        estimatedDevisDays: availability === "available" ? 2 : availability === "busy" ? 3 : 5,
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    analysis,
    matches: scored.slice(0, limit),
    totalCandidates: scored.length,
  };
}
