import {
  Shirt,
  Sparkles,
  Cpu,
  Lamp,
  Dumbbell,
  Gem,
  Baby,
  ChefHat,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  key: string;
  label: string;
  icon: LucideIcon;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { key: "mode", label: "Mode & textile", icon: Shirt, emoji: "👕" },
  { key: "beaute", label: "Beauté & cosmétique", icon: Sparkles, emoji: "✨" },
  { key: "electronique", label: "Électronique", icon: Cpu, emoji: "🔌" },
  { key: "maison", label: "Maison & déco", icon: Lamp, emoji: "🛋️" },
  { key: "sport", label: "Sport & outdoor", icon: Dumbbell, emoji: "🧘" },
  { key: "bijouterie", label: "Bijouterie", icon: Gem, emoji: "💍" },
  { key: "enfant", label: "Jouets & enfants", icon: Baby, emoji: "🧸" },
  { key: "cuisine", label: "Cuisine", icon: ChefHat, emoji: "🍳" },
];

export const ALL_CATEGORY: Category = {
  key: "all",
  label: "Tous",
  icon: Grid3x3,
  emoji: "✦",
};

export function categoryFor(key: string | null | undefined): Category {
  return CATEGORIES.find((c) => c.key === key) ?? ALL_CATEGORY;
}
