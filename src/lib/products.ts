import type {
  PriceTier,
  ProductDetail,
  ProductSummary,
} from "@/lib/types/products";

interface RawProduct {
  id: string;
  slug: string;
  title: string;
  shortPitch: string;
  description: string;
  category: string;
  subcategory: string | null;
  images: string;
  agentSlug: string;
  agentName: string;
  agentCity: string;
  agentAvatarUrl: string;
  priceTiers: string;
  samplePrice: number | null;
  currency: string;
  moq: number;
  leadTimeDays: number;
  material: string | null;
  origin: string;
  certifications: string | null;
  customizable: boolean;
  customOptions: string | null;
  sourcedTimes: number;
  rating: number | null;
  reviewCount: number;
  featured: boolean;
  isNew: boolean;
}

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[] = []): T[] {
  if (!raw) return fallback;
  try {
    const x = JSON.parse(raw);
    return Array.isArray(x) ? (x as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export function toProductSummary(p: RawProduct): ProductSummary {
  const images = parseJsonArray<string>(p.images);
  const tiers = parseJsonArray<PriceTier>(p.priceTiers);
  const fromPrice =
    tiers.length > 0 ? Math.min(...tiers.map((t) => t.unitPrice)) : 0;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortPitch: p.shortPitch,
    category: p.category,
    subcategory: p.subcategory,
    mainImage: images[0] ?? "",
    agentSlug: p.agentSlug,
    agentName: p.agentName,
    agentCity: p.agentCity,
    agentAvatarUrl: p.agentAvatarUrl,
    fromPrice,
    moq: p.moq,
    leadTimeDays: p.leadTimeDays,
    sourcedTimes: p.sourcedTimes,
    rating: p.rating,
    reviewCount: p.reviewCount,
    featured: p.featured,
    isNew: p.isNew,
  };
}

export function toProductDetail(p: RawProduct): ProductDetail {
  const summary = toProductSummary(p);
  return {
    ...summary,
    description: p.description,
    images: parseJsonArray<string>(p.images),
    priceTiers: parseJsonArray<PriceTier>(p.priceTiers),
    samplePrice: p.samplePrice,
    currency: p.currency,
    material: p.material,
    origin: p.origin,
    certifications: parseJsonArray<string>(p.certifications),
    customizable: p.customizable,
    customOptions: parseJsonArray<string>(p.customOptions),
  };
}
