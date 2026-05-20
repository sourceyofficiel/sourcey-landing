"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Search, Sparkles } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { AuroraText } from "@/components/ui/aurora-text";
import { ProductCard } from "@/components/catalog/ProductCard";
import {
  CatalogFilters,
  type SortKey,
} from "@/components/catalog/CatalogFilters";
import type { ProductSummary } from "@/lib/types/products";

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const url = new URL("/api/products", window.location.origin);
    if (category !== "all") url.searchParams.set("category", category);
    if (debouncedSearch) url.searchParams.set("q", debouncedSearch);
    url.searchParams.set("sort", sort);

    let cancelled = false;
    fetch(url.toString(), { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { products: ProductSummary[] }) => {
        if (cancelled) return;
        setProducts(data.products ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, debouncedSearch, sort]);

  const featured = useMemo(
    () => products.filter((p) => p.featured).slice(0, 3),
    [products]
  );

  return (
    <main className="min-h-screen bg-neutral-50/40">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/30 via-white to-white pt-10 md:pt-14">
        <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary-200/30 blur-[120px]" />
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-white/80 px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-primary-700 shadow-sm backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Catalogue Sourcey · produits déjà sourcés
            </span>
            <h1 className="mt-4 font-display text-[clamp(30px,4.5vw,52px)] font-extrabold leading-[1.05] tracking-tight text-neutral-900">
              Des produits{" "}
              <AuroraText
                colors={["#3B82F6", "#2563EB", "#9333EA", "#60A5FA"]}
              >
                déjà négociés
              </AuroraText>{" "}
              pour toi
            </h1>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-neutral-600">
              Pas envie de chercher ? Pioche dans notre sélection de produits
              pré-vérifiés par nos 14 agents en Chine. Prix négociés, usines
              fiables, certifs en place. Tu cliques, tu reçois un devis.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Filters */}
      <Container>
        <div className="sticky top-[64px] z-30 -mx-6 mt-6 border-b border-neutral-200/60 bg-neutral-50/95 px-6 py-4 backdrop-blur md:top-[72px] md:-mx-8 md:px-8">
          <CatalogFilters
            category={category}
            onCategoryChange={setCategory}
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            totalCount={products.length}
          />
        </div>
      </Container>

      {/* Grid */}
      <Container className="pb-24">
        {loading ? (
          <div className="mt-12 grid place-items-center text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState onReset={() => { setCategory("all"); setSearch(""); }} />
        ) : (
          <div className="mt-8">
            {featured.length > 0 && search === "" && category === "all" && (
              <div className="mb-10">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-500">
                  ⭐ Best-sellers Sourcey
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featured.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-500">
              {category === "all" && !search ? "Tous les produits" : "Résultats"}
            </h2>
            <motion.div
              layout
              className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {products
                  .filter((p) => !(featured.includes(p) && search === "" && category === "all"))
                  .map((p) => (
                    <motion.div key={p.id} layout>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </Container>

      <Footer />
    </main>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="mt-12 grid place-items-center rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-400">
        <Search className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-bold text-neutral-900">
        Pas de produit qui correspond à ta recherche
      </p>
      <p className="mt-1 text-xs text-neutral-500">
        Essaie une autre catégorie ou{" "}
        <a
          href="/match"
          className="font-semibold text-primary-700 underline-offset-2 hover:underline"
        >
          décris ton besoin à notre IA
        </a>
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}
