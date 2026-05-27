"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Megaphone,
  Edit3,
  Trash2,
  Loader2,
  X,
  AlertCircle,
  Calendar,
  Wallet,
  Target,
} from "lucide-react";
import {
  formatMoneyCents,
  formatDate,
  CAMPAIGN_STATUS_LABEL,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface Campaign {
  id: string;
  brand_id: string;
  brand: Brand | null;
  name: string;
  objective: string | null;
  budget_cents: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const STATUSES = ["draft", "active", "paused", "completed"] as const;
const OBJECTIVES = [
  { value: "ugc", label: "UGC (contenu)" },
  { value: "shoutout", label: "Shoutout / placement" },
  { value: "giveaway", label: "Giveaway" },
  { value: "affiliate", label: "Affiliation" },
];

export function CampaignsView({
  initialCampaigns,
  brands,
  isAdmin,
}: {
  initialCampaigns: Campaign[];
  brands: Brand[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [editing, setEditing] = useState<Campaign | "new" | null>(null);

  async function deleteCampaign(c: Campaign) {
    if (!confirm(`Supprimer la campagne "${c.name}" ?`)) return;
    const res = await fetch(`/api/campaigns/${c.id}`, { method: "DELETE" });
    if (res.ok) setCampaigns((prev) => prev.filter((x) => x.id !== c.id));
  }

  async function changeStatus(c: Campaign, status: string) {
    setCampaigns((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, status } : x))
    );
    await fetch(`/api/campaigns/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black">
            <Megaphone className="h-3.5 w-3.5" />
            Campagnes
          </div>
          <h1 className="mt-1 font-display text-[24px] font-extrabold tracking-tight text-neutral-900">
            Tes briefs influenceurs
          </h1>
          <p className="mt-1 max-w-xl text-[13px] text-neutral-500">
            Une campagne regroupe un brief (UGC, shoutout…) lié à une marque,
            avec un budget et un objectif. Les prospections sont rattachées à
            une campagne.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setEditing("new")}
            disabled={brands.length === 0}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#FFFF00] px-4 text-[13px] font-bold text-black shadow-md shadow-black/10 hover:brightness-110 disabled:opacity-50"
            title={brands.length === 0 ? "Crée d'abord une marque" : ""}
          >
            <Plus className="h-4 w-4" />
            Nouvelle campagne
          </button>
        )}
      </div>

      {brands.length === 0 && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50/60 p-5 text-[12.5px] text-amber-700">
          ⚠️ Tu dois créer au moins une marque avant de pouvoir créer une
          campagne.{" "}
          <a
            href="/app/brands"
            className="font-bold underline hover:text-amber-700"
          >
            Aller dans Marques
          </a>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {campaigns.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
            <Megaphone className="mx-auto h-7 w-7 text-neutral-500" />
            <p className="mt-3 text-[13px] text-neutral-500">
              Aucune campagne pour l&apos;instant.
            </p>
          </div>
        ) : (
          campaigns.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-[15px] font-bold text-neutral-900">
                      {c.name}
                    </h3>
                    {c.brand && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#FFFF00]/20 px-1.5 py-0.5 text-[10.5px] font-bold text-black ring-1 ring-inset ring-black/15">
                        {c.brand.name}
                      </span>
                    )}
                    <select
                      value={c.status}
                      onChange={(e) => changeStatus(c, e.target.value)}
                      disabled={!isAdmin}
                      className={cn(
                        "h-6 rounded-md px-1.5 text-[10.5px] font-bold ring-1 ring-inset focus:outline-none",
                        campaignStatusClass(c.status)
                      )}
                    >
                      {STATUSES.map((s) => (
                        <option
                          key={s}
                          value={s}
                          className="bg-white text-neutral-900"
                        >
                          {CAMPAIGN_STATUS_LABEL[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-neutral-500">
                    {c.objective && (
                      <span className="inline-flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {OBJECTIVES.find((o) => o.value === c.objective)
                          ?.label ?? c.objective}
                      </span>
                    )}
                    {c.budget_cents > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        {formatMoneyCents(c.budget_cents)}
                      </span>
                    )}
                    {c.start_date && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(c.start_date)}
                        {c.end_date && ` → ${formatDate(c.end_date)}`}
                      </span>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => setEditing(c)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteCampaign(c)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-rose-500/40 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <CampaignModal
          campaign={editing === "new" ? null : editing}
          brands={brands}
          onClose={() => setEditing(null)}
          onSaved={(c) => {
            if (editing === "new") {
              setCampaigns((prev) => [c, ...prev]);
            } else {
              setCampaigns((prev) =>
                prev.map((x) => (x.id === c.id ? c : x))
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

function CampaignModal({
  campaign,
  brands,
  onClose,
  onSaved,
}: {
  campaign: Campaign | null;
  brands: Brand[];
  onClose: () => void;
  onSaved: (c: Campaign) => void;
}) {
  const [name, setName] = useState(campaign?.name ?? "");
  const [brandId, setBrandId] = useState(
    campaign?.brand_id ?? brands[0]?.id ?? ""
  );
  const [objective, setObjective] = useState(campaign?.objective ?? "ugc");
  const [budgetEur, setBudgetEur] = useState(
    campaign ? campaign.budget_cents / 100 : ""
  );
  const [startDate, setStartDate] = useState(campaign?.start_date ?? "");
  const [endDate, setEndDate] = useState(campaign?.end_date ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        brand_id: brandId,
        name,
        objective,
        budget_cents: budgetEur ? Math.round(Number(budgetEur) * 100) : 0,
        start_date: startDate || null,
        end_date: endDate || null,
      };
      const url = campaign ? `/api/campaigns/${campaign.id}` : "/api/campaigns";
      const method = campaign ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      onSaved(data.campaign);
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
            {campaign ? "Éditer la campagne" : "Nouvelle campagne"}
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
              Marque *
            </label>
            <select
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
            >
              <option value="">— Choisir —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Nom de la campagne *
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lancement collection été 2026"
              className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Objectif
              </label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
              >
                {OBJECTIVES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Budget (€)
              </label>
              <input
                type="number"
                min="0"
                value={budgetEur}
                onChange={(e) => setBudgetEur(e.target.value)}
                placeholder="2000"
                className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
              />
            </div>
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
            disabled={busy || !brandId || !name.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFFF00] px-4 text-[12.5px] font-bold text-black hover:brightness-110 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {campaign ? "Enregistrer" : "Créer la campagne"}
          </button>
        </div>
      </form>
    </div>
  );
}

function campaignStatusClass(status: string): string {
  return (
    {
      draft: "bg-neutral-100 text-neutral-700 ring-neutral-300/50",
      active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      paused: "bg-amber-50 text-amber-700 ring-amber-200",
      completed: "bg-[#FFFF00]/20 text-black ring-black/15",
    }[status] ?? "bg-neutral-100 text-neutral-700 ring-neutral-300/50"
  );
}
