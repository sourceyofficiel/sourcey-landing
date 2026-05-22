"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

import {
  BriefSchema,
  type BriefData,
  type FileAttachment,
  SECTION_REQUIRED_FIELDS,
  SECTION_LABELS,
  ECOM_LEVELS,
  MONTHLY_REVENUES,
  ACTIVITIES,
  MAIN_GOALS,
  TARGET_REVENUES,
  LAUNCH_DELAYS,
  BLOCKERS,
  PRODUCT_CATEGORIES,
  TARGET_CLIENTS,
  PROJECT_STAGES,
  SUPPLIER_HISTORY,
  SALES_PLATFORMS,
  SOURCING_BUDGETS,
  MIN_QUANTITIES,
  SELLING_PRICES,
  SUPPLIER_COUNTRIES,
  DELIVERY_DELAYS,
  REQUIREMENTS,
  COLOR_PALETTES,
  PREFERRED_CHANNELS,
  CALL_AVAILABILITIES,
  DISCOVERY_SOURCES,
} from "@/types/brief";

import { ChipGroup } from "@/components/brief/ChipGroup";
import { UploadZone } from "@/components/brief/UploadZone";
import { ProgressBar } from "@/components/brief/ProgressBar";
import { SectionNav } from "@/components/brief/SectionNav";

/* ============================================================
   STATE INITIAL — vide, on remplit progressivement
   ============================================================ */

type FormState = Partial<BriefData>;

function emptyState(emailFromSession: string): FormState {
  return {
    blockers: [],
    targetClients: [],
    salesPlatforms: [],
    supplierCountries: [],
    requirements: [],
    sourcingExtraInfo: "",
    productPhotos: [],
    supplierDocs: [],
    referenceUrls: ["", "", ""],
    colorPalettes: [],
    email: emailFromSession,
    whatsapp: "",
    freeMessage: "",
  };
}

/* ============================================================
   BRIEF FORM
   ============================================================ */

export function BriefForm({
  emailFromSession,
}: {
  emailFromSession: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<FormState>(() =>
    emptyState(emailFromSession)
  );
  const [section, setSection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function setField<K extends keyof BriefData>(key: K, value: BriefData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }

  /* ----------------------------------------------------------
     Progress + sections complétées
     ---------------------------------------------------------- */

  const { completed, percent } = useMemo(() => {
    const all = Object.values(SECTION_REQUIRED_FIELDS).flat();
    const total = all.length;
    let filled = 0;
    const done = new Set<number>();

    for (const [s, fields] of Object.entries(SECTION_REQUIRED_FIELDS)) {
      let sectionFilled = 0;
      for (const f of fields) {
        if (isFieldFilled(data, f)) {
          filled += 1;
          sectionFilled += 1;
        }
      }
      if (fields.length === 0 || sectionFilled === fields.length) {
        done.add(Number(s));
      }
    }

    return {
      completed: done,
      percent: total === 0 ? 100 : (filled / total) * 100,
    };
  }, [data]);

  /* ----------------------------------------------------------
     Submit
     ---------------------------------------------------------- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);

    // Validation Zod (les chips arrays default sont déjà initialisés)
    const result = BriefSchema.safeParse(data);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0]?.toString() ?? "_form";
        if (!errMap[field]) errMap[field] = issue.message;
      }
      setErrors(errMap);

      // Scroll vers le premier champ en erreur
      const firstError = Object.keys(errMap)[0];
      if (firstError) {
        const el = document.querySelector(`[data-field="${firstError}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/brief/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Erreur serveur");
      setSubmitted(true);
      // Redirige vers le dashboard après 2s
      setTimeout(() => router.push("/app"), 2200);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erreur lors de l'envoi"
      );
      setSubmitting(false);
    }
  }

  function jumpTo(n: number) {
    setSection(n);
    const el = document.getElementById(`section-${n}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ----------------------------------------------------------
     Success state
     ---------------------------------------------------------- */

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <motion.div
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"
        >
          <CheckCircle2 className="h-12 w-12" strokeWidth={2} />
        </motion.div>
        <h1 className="mt-6 font-display text-[26px] font-extrabold tracking-tight text-neutral-900">
          Brief reçu 🎯
        </h1>
        <p className="mt-2 max-w-[400px] text-[14px] text-neutral-600">
          Notre équipe va l&apos;analyser et on te contacte sur WhatsApp ou par
          email sous 24-48h. Tu peux suivre l&apos;avancement depuis ton
          dashboard.
        </p>
        <p className="mt-4 text-[12px] text-neutral-400">
          Redirection vers le dashboard…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto max-w-[760px] px-5 pb-32 md:px-8">
      {/* Header */}
      <header className="pt-6 md:pt-10">
        <div className="text-[12px] font-semibold uppercase tracking-wider text-primary-700">
          Nouveau brief
        </div>
        <h1 className="mt-2 font-display text-[28px] font-extrabold tracking-tight text-neutral-900 md:text-[34px]">
          Parle-nous de ton projet.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-neutral-500 md:text-[15px]">
          Plus tu remplis, plus on peut t&apos;aider efficacement. Compte 5 à
          10 minutes. Tu peux sauter les sections optionnelles.
        </p>
      </header>

      <ProgressBar percent={percent} />
      <SectionNav current={section} completed={completed} onJump={jumpTo} />

      {/* ============================================================
         SECTION 1 — PROFIL
         ============================================================ */}
      <Section id={1} title="Profil" subtitle="On apprend à te connaître.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Prénom et nom"
            required
            value={data.prenomNom ?? ""}
            onChange={(v) => setField("prenomNom", v)}
            error={errors.prenomNom}
            placeholder="Marie Dubois"
          />
          <TextField
            label="Nom de la marque / projet"
            required
            value={data.marqueNom ?? ""}
            onChange={(v) => setField("marqueNom", v)}
            error={errors.marqueNom}
            placeholder="Ex: Solar Atelier"
          />
        </div>

        <ChipGroup
          label="Niveau en e-commerce"
          required
          mode="single"
          options={ECOM_LEVELS}
          value={data.ecomLevel}
          onChange={(v) => setField("ecomLevel", v as typeof ECOM_LEVELS[number])}
          error={errors.ecomLevel}
        />

        <ChipGroup
          label="Revenu mensuel actuel"
          required
          hint="Pour t'aider à dimensionner les recommandations. 100% confidentiel — visible uniquement par ton agent."
          mode="single"
          options={MONTHLY_REVENUES}
          value={data.monthlyRevenue}
          onChange={(v) => setField("monthlyRevenue", v as typeof MONTHLY_REVENUES[number])}
          error={errors.monthlyRevenue}
        />

        <ChipGroup
          label="Activité principale"
          required
          mode="single"
          options={ACTIVITIES}
          value={data.activity}
          onChange={(v) => setField("activity", v as typeof ACTIVITIES[number])}
          error={errors.activity}
        />

        <TextField
          label="Pays de résidence"
          required
          value={data.country ?? ""}
          onChange={(v) => setField("country", v)}
          error={errors.country}
          placeholder="France"
        />
      </Section>

      {/* ============================================================
         SECTION 2 — OBJECTIFS
         ============================================================ */}
      <Section id={2} title="Objectifs" subtitle="Ce que tu veux atteindre.">
        <ChipGroup
          label="Objectif principal"
          required
          mode="single"
          options={MAIN_GOALS}
          value={data.mainGoal}
          onChange={(v) => setField("mainGoal", v as typeof MAIN_GOALS[number])}
          error={errors.mainGoal}
        />

        <ChipGroup
          label="CA visé dans 6 mois"
          required
          mode="single"
          options={TARGET_REVENUES}
          value={data.targetRevenue}
          onChange={(v) => setField("targetRevenue", v as typeof TARGET_REVENUES[number])}
          error={errors.targetRevenue}
        />

        <ChipGroup
          label="Délai pour lancer"
          required
          mode="single"
          options={LAUNCH_DELAYS}
          value={data.launchDelay}
          onChange={(v) => setField("launchDelay", v as typeof LAUNCH_DELAYS[number])}
          error={errors.launchDelay}
        />

        <ChipGroup
          label="Ce qui bloque le plus"
          mode="multi"
          options={BLOCKERS}
          value={data.blockers ?? []}
          onChange={(v) => setField("blockers", v as typeof BLOCKERS[number][])}
        />
      </Section>

      {/* ============================================================
         SECTION 3 — PROJET
         ============================================================ */}
      <Section id={3} title="Projet produit" subtitle="Le produit que tu veux sourcer.">
        <ChipGroup
          label="Catégorie de produit"
          required
          mode="single"
          options={PRODUCT_CATEGORIES}
          value={data.productCategory}
          onChange={(v) => setField("productCategory", v as typeof PRODUCT_CATEGORIES[number])}
          error={errors.productCategory}
        />

        <ChipGroup
          label="Cible client"
          required
          mode="multi"
          options={TARGET_CLIENTS}
          value={data.targetClients ?? []}
          onChange={(v) => setField("targetClients", v as typeof TARGET_CLIENTS[number][])}
          error={errors.targetClients}
        />

        <TextareaField
          label="Description du produit idéal"
          required
          rows={4}
          value={data.productDescription ?? ""}
          onChange={(v) => setField("productDescription", v)}
          error={errors.productDescription}
          placeholder="Ex: bougie parfumée en cire végétale 200g, contenant verre teinté, parfums neutres unisexe. Cible : trentenaires urbains qui aiment Aesop. Doit pouvoir être brûlée 40h+."
        />

        <ChipGroup
          label="Stade du projet"
          required
          mode="single"
          options={PROJECT_STAGES}
          value={data.projectStage}
          onChange={(v) => setField("projectStage", v as typeof PROJECT_STAGES[number])}
          error={errors.projectStage}
        />

        <ChipGroup
          label="Déjà eu un fournisseur ?"
          required
          mode="single"
          options={SUPPLIER_HISTORY}
          value={data.supplierHistory}
          onChange={(v) => setField("supplierHistory", v as typeof SUPPLIER_HISTORY[number])}
          error={errors.supplierHistory}
        />

        <ChipGroup
          label="Plateforme(s) de vente"
          required
          mode="multi"
          options={SALES_PLATFORMS}
          value={data.salesPlatforms ?? []}
          onChange={(v) => setField("salesPlatforms", v as typeof SALES_PLATFORMS[number][])}
          error={errors.salesPlatforms}
        />
      </Section>

      {/* ============================================================
         SECTION 4 — BUDGET & SOURCING
         ============================================================ */}
      <Section id={4} title="Budget & sourcing" subtitle="Le cadre financier et opérationnel.">
        <ChipGroup
          label="Budget total sourcing"
          required
          mode="single"
          options={SOURCING_BUDGETS}
          value={data.sourcingBudget}
          onChange={(v) => setField("sourcingBudget", v as typeof SOURCING_BUDGETS[number])}
          error={errors.sourcingBudget}
        />

        <ChipGroup
          label="Quantité minimum souhaitée"
          required
          mode="single"
          options={MIN_QUANTITIES}
          value={data.minQuantity}
          onChange={(v) => setField("minQuantity", v as typeof MIN_QUANTITIES[number])}
          error={errors.minQuantity}
        />

        <ChipGroup
          label="Prix de vente visé (TTC)"
          required
          mode="single"
          options={SELLING_PRICES}
          value={data.sellingPrice}
          onChange={(v) => setField("sellingPrice", v as typeof SELLING_PRICES[number])}
          error={errors.sellingPrice}
        />

        <ChipGroup
          label="Pays fournisseur préféré"
          mode="multi"
          options={SUPPLIER_COUNTRIES}
          value={data.supplierCountries ?? []}
          onChange={(v) => setField("supplierCountries", v as typeof SUPPLIER_COUNTRIES[number][])}
        />

        <ChipGroup
          label="Délai livraison client acceptable"
          required
          mode="single"
          options={DELIVERY_DELAYS}
          value={data.deliveryDelay}
          onChange={(v) => setField("deliveryDelay", v as typeof DELIVERY_DELAYS[number])}
          error={errors.deliveryDelay}
        />

        <ChipGroup
          label="Exigences spécifiques"
          mode="multi"
          options={REQUIREMENTS}
          value={data.requirements ?? []}
          onChange={(v) => setField("requirements", v as typeof REQUIREMENTS[number][])}
        />

        <TextareaField
          label="Infos complémentaires sourcing"
          rows={3}
          value={data.sourcingExtraInfo ?? ""}
          onChange={(v) => setField("sourcingExtraInfo", v)}
          placeholder="Tout ce qui peut nous aider à mieux cibler. Optionnel."
        />
      </Section>

      {/* ============================================================
         SECTION 5 — RÉFÉRENCES VISUELLES
         ============================================================ */}
      <Section id={5} title="Références visuelles" subtitle="Optionnel mais vivement recommandé.">
        <UploadZone
          label="Photos produits de référence"
          hint="Des produits que tu aimes, qui correspondent à ta vision. JPG, PNG, WEBP."
          accept="image/*"
          variant="image"
          maxFiles={6}
          files={data.productPhotos ?? []}
          onChange={(f: FileAttachment[]) => setField("productPhotos", f)}
        />

        <UploadZone
          label="Screenshots fournisseurs / catalogues PDF"
          hint="Si tu as déjà des pistes ou des catalogues qu'on doit checker."
          accept="image/*,application/pdf"
          variant="doc"
          maxFiles={4}
          files={data.supplierDocs ?? []}
          onChange={(f: FileAttachment[]) => setField("supplierDocs", f)}
        />

        <div>
          <label className="mb-2 block text-[13.5px] font-semibold text-neutral-800">
            Liens de référence
          </label>
          <p className="mb-2.5 text-[12px] leading-relaxed text-neutral-500">
            Alibaba, AliExpress, Etsy, concurrents, inspirations… Jusqu&apos;à 3 URLs.
          </p>
          <div className="grid gap-2">
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                type="url"
                placeholder="https://…"
                value={(data.referenceUrls ?? [])[i] ?? ""}
                onChange={(e) => {
                  const next = [...(data.referenceUrls ?? ["", "", ""])];
                  next[i] = e.target.value;
                  setField("referenceUrls", next);
                }}
                className="block h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] text-neutral-900 transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            ))}
          </div>
        </div>

        <ChipGroup
          label="Palette de couleurs souhaitée"
          mode="multi"
          options={COLOR_PALETTES}
          value={data.colorPalettes ?? []}
          onChange={(v) => setField("colorPalettes", v as typeof COLOR_PALETTES[number][])}
        />
      </Section>

      {/* ============================================================
         SECTION 6 — CONTACT
         ============================================================ */}
      <Section id={6} title="Contact" subtitle="Comment on te recontacte.">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            label="Email"
            required
            type="email"
            value={data.email ?? ""}
            onChange={(v) => setField("email", v)}
            error={errors.email}
            hint="Pré-rempli depuis ton compte"
          />
          <TextField
            label="WhatsApp"
            type="tel"
            value={data.whatsapp ?? ""}
            onChange={(v) => setField("whatsapp", v)}
            placeholder="+33 6 12 34 56 78"
            hint="Optionnel mais recommandé"
          />
        </div>

        <ChipGroup
          label="Canal préféré pour le retour"
          required
          mode="single"
          options={PREFERRED_CHANNELS}
          value={data.preferredChannel}
          onChange={(v) => setField("preferredChannel", v as typeof PREFERRED_CHANNELS[number])}
          error={errors.preferredChannel}
        />

        <ChipGroup
          label="Disponibilité pour un appel"
          mode="single"
          options={CALL_AVAILABILITIES}
          value={data.callAvailability}
          onChange={(v) => setField("callAvailability", v as typeof CALL_AVAILABILITIES[number])}
        />

        <ChipGroup
          label="Comment as-tu connu Sourcey ?"
          mode="single"
          options={DISCOVERY_SOURCES}
          value={data.discoverySource}
          onChange={(v) => setField("discoverySource", v as typeof DISCOVERY_SOURCES[number])}
        />

        <TextareaField
          label="Message libre"
          rows={3}
          value={data.freeMessage ?? ""}
          onChange={(v) => setField("freeMessage", v)}
          placeholder="Tout ce que tu veux qu'on sache et qui n'est pas dans les champs ci-dessus."
        />
      </Section>

      {/* ============================================================
         SUBMIT
         ============================================================ */}
      <div className="mt-10 space-y-3">
        <AnimatePresence>
          {submitError && (
            <motion.div
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-[13px] text-rose-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </motion.div>
          )}

          {Object.keys(errors).length > 0 && (
            <motion.div
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-[13px] text-amber-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Il manque {Object.keys(errors).length} champ(s) requis. On a
                surligné ceux qui posent souci en haut.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-primary-500 to-primary-700 text-[15px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              Envoyer mon brief
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-[11.5px] text-neutral-400">
          <Lock className="h-3 w-3" />
          Tes infos restent privées et ne sont partagées qu&apos;avec ton agent
          Sourcey.
        </p>

        <p className="text-center text-[11.5px] text-neutral-500">
          Tu veux abandonner ?{" "}
          <Link
            href="/app"
            className="font-semibold text-neutral-700 hover:underline"
          >
            Retour au dashboard
          </Link>
        </p>
      </div>
    </form>
  );
}

/* ============================================================
   HELPERS — Section wrapper, TextField, TextareaField
   ============================================================ */

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={`section-${id}`}
      data-section={id}
      className="mt-10 scroll-mt-32 rounded-2xl border border-neutral-200 bg-white p-5 md:mt-12 md:p-7"
    >
      <header className="border-b border-neutral-100 pb-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-primary-700">
          Section {id} / 6
        </div>
        <h2 className="mt-1 font-display text-[18px] font-extrabold tracking-tight text-neutral-900 md:text-[20px]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>
        )}
      </header>
      <div className="mt-5 space-y-6">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  hint,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
}) {
  const dataAttr = label.toLowerCase().replace(/[^a-z]/g, "");
  return (
    <div data-field={dataAttr}>
      <label className="mb-2 block text-[13.5px] font-semibold text-neutral-800">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {hint && (
        <p className="mb-2 text-[11.5px] text-neutral-500">{hint}</p>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block h-11 w-full rounded-lg border bg-white px-3 text-[14px] text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
            : "border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100"
        }`}
      />
      {error && (
        <p className="mt-1.5 text-[12px] font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  required,
  rows = 3,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13.5px] font-semibold text-neutral-800">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`block w-full rounded-lg border bg-white px-3 py-2.5 text-[14px] leading-relaxed text-neutral-900 transition-colors placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
            : "border-neutral-200 hover:border-neutral-300 focus:border-primary-500 focus:ring-primary-100"
        }`}
      />
      {error && (
        <p className="mt-1.5 text-[12px] font-medium text-rose-600">{error}</p>
      )}
    </div>
  );
}

/* ============================================================
   UTILS
   ============================================================ */

function isFieldFilled(data: FormState, field: keyof BriefData): boolean {
  const v = data[field];
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
