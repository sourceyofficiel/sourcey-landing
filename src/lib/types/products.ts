export interface PriceTier {
  minQty: number;
  unitPrice: number;
}

export interface ProductSummary {
  id: string;
  slug: string;
  title: string;
  shortPitch: string;
  category: string;
  subcategory: string | null;
  /** First image only, for list views */
  mainImage: string;
  agentSlug: string;
  agentName: string;
  agentCity: string;
  agentAvatarUrl: string;
  /** Cheapest price tier — for "à partir de X €" */
  fromPrice: number;
  moq: number;
  leadTimeDays: number;
  sourcedTimes: number;
  rating: number | null;
  reviewCount: number;
  featured: boolean;
  isNew: boolean;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  images: string[];
  priceTiers: PriceTier[];
  samplePrice: number | null;
  currency: string;
  material: string | null;
  origin: string;
  certifications: string[];
  customizable: boolean;
  customOptions: string[];
}
