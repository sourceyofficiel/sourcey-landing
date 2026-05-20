"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Package,
  Hash,
  Wallet,
  Calendar,
  Link as LinkIcon,
  FileText,
  Sparkles,
  MessageSquare,
} from "lucide-react";

const PRODUCT_TYPES = [
  { value: "textile", label: "Textile / Mode" },
  { value: "accessoires", label: "Accessoires" },
  { value: "deco", label: "Déco / Maison" },
  { value: "electronique", label: "Électronique" },
  { value: "beaute", label: "Beauté / Cosmétique" },
  { value: "bijouterie", label: "Bijouterie" },
  { value: "sport", label: "Sport / Outdoor" },
  { value: "enfant", label: "Enfant / Jouets" },
  { value: "autre", label: "Autre" },
];

export default function NewBriefPage() {
  const router = useRouter();

  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [description, setDescription] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [targetDelivery, setTargetDelivery] = useState("");
  const [inspirationUrl, setInspirationUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productType: productType || undefined,
          description,
          targetQuantity,
          targetPrice: targetPrice || undefined,
          targetDelivery: targetDelivery || undefined,
          inspirationUrl: inspirationUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur d'envoi");
      router.push("/app/orders");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-6 md:py-10">
      {/* Back link */}
      <Link
        href="/app"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour au tableau de bord
      </Link>

      {/* Header */}
      <div className="mt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary-200/60 bg-white px-3 py-1 text-[11.5px] font-semibold text-primary-700">
          <Sparkles className="h-3 w-3" />
          Nouveau brief de sourcing
        </div>
        <h1 className="mt-3 font-display text-[clamp(26px,3vw,36px)] font-extrabold leading-tight tracking-tight text-neutral-900">
          Décris ton produit, on s'occupe du reste.
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-neutral-500">
          Plus tu nous donnes de détails, plus on peut négocier vite et bien.
          On te contacte sur WhatsApp sous 24h.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 md:p-8"
      >
        <div className="space-y-6">
          {/* Product name */}
          <FormField
            label="Nom du produit"
            required
            icon={Package}
            hint="Sois précis : « T-shirt premium coton bio 220g » plutôt que « T-shirt »."
          >
            <input
              required
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex : Coque iPhone biodégradable, mug céramique custom..."
              className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </FormField>

          {/* Product type */}
          <FormField label="Catégorie" icon={Hash}>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="">— Choisis une catégorie —</option>
              {PRODUCT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Description */}
          <FormField
            label="Description détaillée"
            required
            icon={FileText}
            hint="Matériaux, finitions, dimensions, couleurs, certifications souhaitées, etc."
          >
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : Coque rigide en bio-plastique, compatible iPhone 15 Pro, finition mat, livré dans un emballage carton recyclé sans plastique. Certif compostable EN 13432 obligatoire."
              rows={5}
              className="block w-full resize-y rounded-lg border border-neutral-200 bg-white px-3.5 py-3 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </FormField>

          {/* Quantity + Price */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Quantité visée" required icon={Hash}>
              <input
                required
                type="text"
                value={targetQuantity}
                onChange={(e) => setTargetQuantity(e.target.value)}
                placeholder="Ex : 500 unités"
                className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </FormField>

            <FormField label="Budget cible (optionnel)" icon={Wallet}>
              <input
                type="text"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="Ex : 3-5€/unité"
                className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </FormField>
          </div>

          {/* Delivery + Inspiration */}
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Délai souhaité (optionnel)" icon={Calendar}>
              <input
                type="text"
                value={targetDelivery}
                onChange={(e) => setTargetDelivery(e.target.value)}
                placeholder="Ex : avant le 15 juin"
                className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </FormField>

            <FormField label="Produit similaire (URL, optionnel)" icon={LinkIcon}>
              <input
                type="url"
                value={inspirationUrl}
                onChange={(e) => setInspirationUrl(e.target.value)}
                placeholder="https://www.alibaba.com/..."
                className="block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] text-neutral-900 transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </FormField>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13.5px] text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* WhatsApp reminder */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50/60 p-4 text-[13px] text-green-800">
          <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div>
            <p className="font-semibold">On te contacte sur WhatsApp dans les 24h</p>
            <p className="mt-0.5 text-[12.5px] text-green-700/90">
              Notre équipe va revenir vers toi avec des questions/précisions, puis
              commencer à contacter les fournisseurs.
            </p>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.35)",
              "0 8px 20px -4px rgba(37,99,235,0.45)",
              "0 0 0 1px rgba(29,78,216,0.45)",
            ].join(", "),
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              Envoyer le brief
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function FormField({
  label,
  required,
  icon: Icon,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[13px] font-semibold text-neutral-800">
        {Icon && <Icon className="h-3.5 w-3.5 text-neutral-400" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && (
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  );
}
