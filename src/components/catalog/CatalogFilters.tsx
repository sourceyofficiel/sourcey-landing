"use client";

import { Search, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ALL_CATEGORY, CATEGORIES } from "@/lib/data/categories";

export type SortKey = "popular" | "price-asc" | "price-desc" | "newest";

interface Props {
  category: string;
  onCategoryChange: (c: string) => void;
  search: string;
  onSearchChange: (s: string) => void;
  sort: SortKey;
  onSortChange: (s: SortKey) => void;
  totalCount: number;
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Les plus sourcés" },
  { key: "newest", label: "Nouveautés" },
  { key: "price-asc", label: "Prix ↑" },
  { key: "price-desc", label: "Prix ↓" },
];

export function CatalogFilters({
  category,
  onCategoryChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  totalCount,
}: Props) {
  const allCategories = [ALL_CATEGORY, ...CATEGORIES];

  return (
    <div className="space-y-3">
      {/* Search + sort row */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cherche un produit (hoodie, bougie, USB-C…)"
            className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-[14.5px] text-neutral-900 placeholder:text-neutral-400 transition-all focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <ArrowDownUp className="h-3.5 w-3.5 text-neutral-400" />
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="h-11 rounded-full border border-neutral-200 bg-white px-4 pr-9 text-[13.5px] font-medium text-neutral-700 transition-colors hover:border-neutral-300 focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100/60"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category pills (horizontal scroll on mobile) */}
      <div className="-mx-1 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <ul className="flex w-max items-center gap-1.5 pb-1">
          {allCategories.map((c) => {
            const active = category === c.key;
            return (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => onCategoryChange(c.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all",
                    active
                      ? "border-primary-300 bg-primary-50 text-primary-700 shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-neutral-900"
                  )}
                >
                  <span aria-hidden>{c.emoji}</span>
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="text-xs text-neutral-500">
        <strong className="text-neutral-700">{totalCount}</strong> produits
        sourcés et vérifiés par nos agents en Chine
      </p>
    </div>
  );
}
