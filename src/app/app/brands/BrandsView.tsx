"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Building2,
  Edit3,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/format";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_context: string | null;
  logo_url: string | null;
  created_at: string;
}

export function BrandsView({ initialBrands }: { initialBrands: Brand[] }) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [editing, setEditing] = useState<Brand | "new" | null>(null);

  async function deleteBrand(b: Brand) {
    if (
      !confirm(
        `Supprimer "${b.name}" ? Toutes les campagnes et analyses liées seront détruites.`
      )
    )
      return;
    const res = await fetch(`/api/brands/${b.id}`, { method: "DELETE" });
    if (res.ok) {
      setBrands((prev) => prev.filter((x) => x.id !== b.id));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black">
            <Building2 className="h-3.5 w-3.5" />
            Marques
          </div>
          <h1 className="mt-1 font-display text-[24px] font-extrabold tracking-tight text-neutral-900">
            Tes marques e-commerce
          </h1>
          <p className="mt-1 max-w-xl text-[13px] text-neutral-500">
            Chaque marque sert de cible pour l&apos;IA quand elle analyse un
            profil. Décris bien le contexte pour avoir des scores pertinents.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#FFFF00] px-4 text-[13px] font-bold text-black shadow-md shadow-black/10 hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nouvelle marque
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {brands.length === 0 ? (
          <div className="sm:col-span-2 rounded-2xl border border-black/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-8 text-center">
            <Sparkles className="mx-auto h-7 w-7 text-black" />
            <h3 className="mt-3 font-display text-[16px] font-bold text-neutral-900">
              Aucune marque pour l&apos;instant
            </h3>
            <p className="mt-1 text-[12.5px] text-neutral-500">
              Crée ta première marque pour pouvoir lancer des analyses
              d&apos;influenceurs.
            </p>
            <button
              onClick={() => setEditing("new")}
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#FFFF00] px-4 text-[13px] font-bold text-black hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Créer ma première marque
            </button>
          </div>
        ) : (
          brands.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFFF00] text-[14px] font-bold text-black">
                  {b.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[15px] font-bold text-neutral-900">
                    {b.name}
                  </h3>
                  <div className="mt-0.5 font-mono text-[10.5px] text-neutral-500">
                    /{b.slug}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(b)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteBrand(b)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-rose-500/40 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {b.description && (
                <p className="mt-3 text-[12.5px] text-neutral-700">
                  {b.description}
                </p>
              )}
              {b.brand_context && (
                <div className="mt-3 rounded-lg bg-neutral-50/60 p-2.5">
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-black">
                    Contexte IA
                  </div>
                  <p className="mt-1 line-clamp-3 text-[11.5px] text-neutral-500">
                    {b.brand_context}
                  </p>
                </div>
              )}
              <div className="mt-3 text-[10.5px] text-neutral-500">
                Créée {formatTimeAgo(b.created_at)}
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <BrandModal
          brand={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(b) => {
            if (editing === "new") {
              setBrands((prev) => [b, ...prev]);
            } else {
              setBrands((prev) =>
                prev.map((x) => (x.id === b.id ? b : x))
              );
            }
            setEditing(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function BrandModal({
  brand,
  onClose,
  onSaved,
}: {
  brand: Brand | null;
  onClose: () => void;
  onSaved: (b: Brand) => void;
}) {
  const [name, setName] = useState(brand?.name ?? "");
  const [description, setDescription] = useState(brand?.description ?? "");
  const [brandContext, setBrandContext] = useState(brand?.brand_context ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const url = brand ? `/api/brands/${brand.id}` : "/api/brands";
      const method = brand ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || null,
          brand_context: brandContext || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      onSaved(data.brand);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
          <h3 className="font-display text-[15px] font-bold text-neutral-900">
            {brand ? "Éditer la marque" : "Nouvelle marque"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Nom *
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="UltraKits"
              className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Pitch court
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Maillots de foot vintage et nouvelles collections, livrés en 48h."
              className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Contexte pour l&apos;IA
            </label>
            <textarea
              rows={6}
              value={brandContext}
              onChange={(e) => setBrandContext(e.target.value)}
              placeholder={
                "Marché : France majoritairement, prix moyen panier 65€.\nCible : ados et jeunes adultes 14-30 ans, passionnés foot.\nValeurs : qualité, authentique, design propre.\nIdéal influenceur : créateur foot/sport/lifestyle avec audience FR-CH-BE."
              }
              className="mt-1 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Plus c&apos;est précis, plus l&apos;IA score juste. Décris cible,
              produit, prix, valeurs.
            </p>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-[12px] text-rose-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-[12.5px] font-bold text-neutral-700 hover:bg-neutral-100"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFFF00] px-4 text-[12.5px] font-bold text-black hover:brightness-110 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {brand ? "Enregistrer" : "Créer la marque"}
          </button>
        </div>
      </form>
    </div>
  );
}
