import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toProductSummary } from "@/lib/products";
import { agents } from "@/lib/data/agents";
import { analyzeProductImage, AI_ENABLED } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * Resolve a possibly relative image URL (e.g. `/uploads/xxx.png`) into an
 * absolute URL that OpenAI's image fetcher can reach. Falls back to the
 * request's origin in dev.
 */
function absoluteUrl(url: string, req: Request): string {
  if (url.startsWith("http")) return url;
  try {
    return new URL(url, new URL(req.url).origin).toString();
  } catch {
    return url;
  }
}

interface AnalyzeResult {
  category: string;
  categoryLabel: string;
  detectedAttributes: string[];
  estimatedFactoryPrice: { min: number; max: number };
  estimatedComplexity: number; // 1-5
  recommendedRegion: string;
  confidence: number; // 0-100
}

/**
 * POST /api/ai/visual-search
 *   Body: { imageUrl: string, hint?: string }
 *   Returns: { analysis, matches, recommendedAgent }
 *
 * Mocked — deterministic based on filename hash + optional hint.
 * Drop-in replacement for a real GPT-4 Vision call later.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { imageUrl?: string; hint?: string };
    if (!body.imageUrl) {
      return NextResponse.json({ error: "imageUrl requis" }, { status: 400 });
    }

    // Try real GPT-4 Vision first if configured, else fall back to mock.
    let analysis = AI_ENABLED
      ? await analyzeProductImage(absoluteUrl(body.imageUrl, req), body.hint)
      : null;
    if (!analysis) {
      await new Promise((r) => setTimeout(r, 1200)); // mock latency
      analysis = mockAnalyze(body.imageUrl, body.hint) as typeof analysis extends null
        ? never
        : NonNullable<typeof analysis>;
    }
    // narrow analysis from possibly-null after the if-guard
    const finalAnalysis = analysis!;

    const matches = await prisma.product.findMany({
      where: { category: analysis.category },
      orderBy: { sourcedTimes: "desc" },
      take: 3,
    });

    const recommendedAgent = pickRecommendedAgent(analysis.category);

    return NextResponse.json({
      analysis,
      matches: matches.map(toProductSummary),
      recommendedAgent,
    });
  } catch (e) {
    console.error("[/api/ai/visual-search]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

const CATEGORY_BANK = [
  {
    category: "mode",
    categoryLabel: "Mode & textile",
    attrs: ["tissu coton bio", "coupe oversize", "broderie", "finition matte"],
    price: { min: 4, max: 18 },
    complexity: 3,
    region: "Guangzhou",
  },
  {
    category: "maison",
    categoryLabel: "Maison & décoration",
    attrs: ["matériau premium", "fait main", "fini brut", "packaging soigné"],
    price: { min: 2, max: 25 },
    complexity: 2,
    region: "Yiwu",
  },
  {
    category: "electronique",
    categoryLabel: "Électronique & tech",
    attrs: ["certifs CE/FCC", "boîtier ABS", "PCBA dual-layer", "USB-C"],
    price: { min: 3, max: 40 },
    complexity: 5,
    region: "Shenzhen",
  },
  {
    category: "beaute",
    categoryLabel: "Beauté & cosmétique",
    attrs: ["formule water-based", "flacon airless", "étiquette glossy", "certif CPNP"],
    price: { min: 1.5, max: 12 },
    complexity: 4,
    region: "Shanghai",
  },
  {
    category: "sport",
    categoryLabel: "Sport & outdoor",
    attrs: ["matériau antidérapant", "résistance UV", "élastomère", "léger"],
    price: { min: 4, max: 30 },
    complexity: 3,
    region: "Ningbo",
  },
  {
    category: "bijouterie",
    categoryLabel: "Bijouterie",
    attrs: ["acier inox 316L", "plaqué or 18k", "fermoir mousqueton", "hypoallergénique"],
    price: { min: 1.5, max: 15 },
    complexity: 2,
    region: "Shenzhen",
  },
  {
    category: "enfant",
    categoryLabel: "Jouets & enfants",
    attrs: ["normes CE EN71", "coton bio", "yeux brodés (no plastique)", "lavable 30°"],
    price: { min: 2, max: 15 },
    complexity: 3,
    region: "Yiwu",
  },
  {
    category: "cuisine",
    categoryLabel: "Cuisine & électroménager",
    attrs: ["acier alimentaire", "manche ergonomique", "certif LFGB", "lavable lave-vaisselle"],
    price: { min: 3, max: 60 },
    complexity: 4,
    region: "Guangzhou",
  },
];

const HINT_KEYWORDS: Record<string, string> = {
  bougie: "maison",
  candle: "maison",
  hoodie: "mode",
  tshirt: "mode",
  "t-shirt": "mode",
  vetement: "mode",
  charger: "electronique",
  chargeur: "electronique",
  usb: "electronique",
  ecouteur: "electronique",
  earbud: "electronique",
  cream: "beaute",
  creme: "beaute",
  cosmetique: "beaute",
  yoga: "sport",
  fitness: "sport",
  collier: "bijouterie",
  bague: "bijouterie",
  bracelet: "bijouterie",
  jewelry: "bijouterie",
  peluche: "enfant",
  jouet: "enfant",
  toy: "enfant",
  couteau: "cuisine",
  knife: "cuisine",
  mug: "cuisine",
};

function mockAnalyze(imageUrl: string, hint?: string): AnalyzeResult {
  // 1) Direct hint
  const hintLower = (hint ?? "").toLowerCase();
  for (const [kw, cat] of Object.entries(HINT_KEYWORDS)) {
    if (hintLower.includes(kw)) {
      return buildResult(cat, 88 + Math.floor(Math.random() * 10));
    }
  }
  // 2) Filename inference
  const filename = imageUrl.split("/").pop()?.toLowerCase() ?? "";
  for (const [kw, cat] of Object.entries(HINT_KEYWORDS)) {
    if (filename.includes(kw)) {
      return buildResult(cat, 78 + Math.floor(Math.random() * 12));
    }
  }
  // 3) Hash fallback
  let h = 0;
  for (let i = 0; i < imageUrl.length; i++) {
    h = (h * 31 + imageUrl.charCodeAt(i)) >>> 0;
  }
  const cat = CATEGORY_BANK[h % CATEGORY_BANK.length].category;
  return buildResult(cat, 62 + (h % 25));
}

function buildResult(category: string, confidence: number): AnalyzeResult {
  const c = CATEGORY_BANK.find((x) => x.category === category) ?? CATEGORY_BANK[0];
  return {
    category: c.category,
    categoryLabel: c.categoryLabel,
    detectedAttributes: c.attrs,
    estimatedFactoryPrice: c.price,
    estimatedComplexity: c.complexity,
    recommendedRegion: c.region,
    confidence,
  };
}

function pickRecommendedAgent(category: string) {
  const CATEGORY_TO_AGENT: Record<string, string> = {
    mode: "chen-mei",
    maison: "li-wei",
    electronique: "wang-jun",
    beaute: "zhang-lin",
    sport: "liu-hao",
    bijouterie: "huang-yan",
    enfant: "xu-fang",
    cuisine: "zhao-qiang",
  };
  const slug = CATEGORY_TO_AGENT[category] ?? "li-wei";
  const a = agents.find((x) => x.slug === slug);
  if (!a) return null;
  return {
    slug: a.slug,
    fullName: a.fullName,
    city: a.city,
    avatar: a.avatar,
    rating: a.rating,
    missions: a.missions,
    tagline: a.tagline ?? null,
    responseTime: a.responseTime ?? "< 4h",
  };
}
