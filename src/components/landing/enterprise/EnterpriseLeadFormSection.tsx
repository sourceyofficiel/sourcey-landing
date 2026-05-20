"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Mail,
  Phone,
  Building2,
  User,
} from "lucide-react";
import { Container, Section } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { fadeUp, viewportOnce } from "@/lib/motion";

type Status = "idle" | "loading" | "success" | "error";

interface FormState {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  monthlyVolume: string;
  budgetRange: string;
  categories: string[];
  message: string;
}

const INITIAL: FormState = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  monthlyVolume: "",
  budgetRange: "",
  categories: [],
  message: "",
};

const VOLUME_OPTIONS = [
  { value: "<1k", label: "Moins de 1 000 unités" },
  { value: "1k-10k", label: "1 000 – 10 000 unités" },
  { value: "10k-50k", label: "10 000 – 50 000 unités" },
  { value: "50k+", label: "Plus de 50 000 unités" },
];

const BUDGET_OPTIONS = [
  { value: "500-1000", label: "500 – 1 000 €/mois" },
  { value: "1000-3000", label: "1 000 – 3 000 €/mois" },
  { value: "3000+", label: "3 000 €+ / mois" },
  { value: "tbd", label: "À discuter" },
];

const CATEGORY_OPTIONS = [
  "Mode & textile",
  "Maison & déco",
  "Beauté & cosmétique",
  "Électronique",
  "Sport & outdoor",
  "Jouets & enfants",
  "Bijouterie",
  "Autre",
];

export function EnterpriseLeadFormSection() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCategory(cat: string) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/enterprise-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur serveur");
      setStatus("success");
      setForm(INITIAL);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  return (
    <Section id="contact" className="bg-gradient-to-b from-white to-enterprise-50/30 pb-24">
      <Container size="default">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.7 }}
          className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start"
        >
          <div className="lg:sticky lg:top-28">
            <span className="inline-flex items-center rounded-full border border-enterprise-200 bg-enterprise-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-enterprise-700">
              Contact
            </span>
            <h2 className="mt-4 font-display text-[clamp(28px,3.5vw,40px)] font-extrabold leading-[1.1] tracking-tight text-neutral-900">
              Parlons de votre{" "}
              <span className="text-enterprise-600">projet</span>
            </h2>
            <p className="mt-4 text-pretty text-lg leading-relaxed text-neutral-600">
              Remplissez ce formulaire et notre équipe commerciale vous recontacte
              sous 24h ouvrées avec un devis personnalisé.
            </p>

            <div className="mt-8 space-y-4">
              <Reassurance text="Aucun engagement, devis 100% gratuit" />
              <Reassurance text="Confidentialité garantie (NDA possible)" />
              <Reassurance text="Réponse personnalisée par un humain, pas un bot" />
            </div>

            <div className="mt-10 rounded-3xl border border-neutral-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Préférez-vous échanger autrement ?
              </p>
              <div className="mt-3 space-y-2.5">
                <a
                  href="mailto:enterprise@sourcey.fr"
                  className="flex items-center gap-3 text-sm text-neutral-700 transition-colors hover:text-enterprise-700"
                >
                  <Mail className="h-4 w-4 text-enterprise-600" />
                  enterprise@sourcey.fr
                </a>
                <a
                  href="tel:+33000000000"
                  className="flex items-center gap-3 text-sm text-neutral-700 transition-colors hover:text-enterprise-700"
                >
                  <Phone className="h-4 w-4 text-enterprise-600" />
                  +33 (0)0 00 00 00 00
                </a>
              </div>
            </div>
          </div>

          {status === "success" ? (
            <SuccessState onReset={() => setStatus("idle")} />
          ) : (
            <motion.form
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              onSubmit={onSubmit}
              className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm md:p-9"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Entreprise" required icon={Building2}>
                  <input
                    required
                    type="text"
                    value={form.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder="Acme SAS"
                    className="input"
                  />
                </Field>
                <Field label="Votre nom" required icon={User}>
                  <input
                    required
                    type="text"
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                    placeholder="Marie Dubois"
                    className="input"
                  />
                </Field>
                <Field label="Email pro" required icon={Mail}>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="marie@acme.fr"
                    className="input"
                  />
                </Field>
                <Field label="Téléphone" icon={Phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="input"
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Label>Volume mensuel estimé *</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {VOLUME_OPTIONS.map((opt) => (
                    <RadioPill
                      key={opt.value}
                      label={opt.label}
                      checked={form.monthlyVolume === opt.value}
                      onChange={() => update("monthlyVolume", opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label>Budget mensuel envisagé *</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {BUDGET_OPTIONS.map((opt) => (
                    <RadioPill
                      key={opt.value}
                      label={opt.label}
                      checked={form.budgetRange === opt.value}
                      onChange={() => update("budgetRange", opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label>Catégories de produits (plusieurs choix possibles)</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <CheckPill
                      key={cat}
                      label={cat}
                      checked={form.categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Label>Précisez votre besoin (optionnel)</Label>
                <textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  rows={4}
                  placeholder="Type de produits, contraintes qualité spécifiques, délais cibles, etc."
                  className="input mt-2 resize-none"
                />
              </div>

              {status === "error" && (
                <div className="mt-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    <strong>Une erreur est survenue.</strong> {error}
                  </p>
                </div>
              )}

              <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="submit"
                  variant="enterprise"
                  size="lg"
                  disabled={
                    status === "loading" ||
                    !form.companyName ||
                    !form.contactName ||
                    !form.email ||
                    !form.monthlyVolume ||
                    !form.budgetRange
                  }
                  className="w-full sm:w-auto"
                >
                  {status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Envoi…
                    </>
                  ) : (
                    <>
                      Envoyer ma demande
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-neutral-500">
                  Vos données restent confidentielles. Aucun envoi à des tiers.
                </p>
              </div>
            </motion.form>
          )}
        </motion.div>
      </Container>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 15px;
          color: #0f172a;
          transition: all 0.15s ease;
        }
        :global(.input::placeholder) {
          color: #94a3b8;
        }
        :global(.input:hover) {
          border-color: #cbd5e1;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #9333ea;
          box-shadow: 0 0 0 4px rgba(147, 51, 234, 0.08);
        }
        :global(textarea.input) {
          height: auto;
          padding: 12px 14px;
        }
      `}</style>
    </Section>
  );
}

function Field({
  label,
  required,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-700">
        {Icon && <Icon className="h-3.5 w-3.5 text-neutral-400" />}
        {label}
        {required && <span className="text-enterprise-600">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-semibold text-neutral-700">{children}</span>
  );
}

function RadioPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all",
        checked
          ? "border-enterprise-300 bg-enterprise-50 text-enterprise-900 ring-2 ring-enterprise-100"
          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
      )}
    >
      <span
        className={cn(
          "grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 transition-colors",
          checked ? "border-enterprise-600 bg-enterprise-600" : "border-neutral-300"
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  );
}

function CheckPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        checked
          ? "border-enterprise-300 bg-enterprise-50 text-enterprise-700"
          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
      )}
    >
      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
      {label}
    </button>
  );
}

function Reassurance({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-enterprise-100">
        <Check className="h-3 w-3 text-enterprise-700" strokeWidth={3} />
      </span>
      <span className="text-sm text-neutral-700">{text}</span>
    </div>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-enterprise-200 bg-gradient-to-br from-enterprise-50/60 via-white to-white p-10 text-center md:p-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
        className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
      >
        <Check className="h-7 w-7" strokeWidth={3} />
      </motion.div>
      <h3 className="mt-6 font-display text-2xl font-extrabold text-neutral-900">
        Demande envoyée 🎉
      </h3>
      <p className="mt-3 max-w-md text-neutral-600">
        Notre équipe commerciale vous recontacte sous{" "}
        <strong className="text-neutral-900">24h ouvrées</strong> avec une
        première estimation et propose un créneau pour un appel.
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        Vérifiez votre boîte mail (et vos spams) pour la confirmation.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 text-sm font-semibold text-enterprise-700 underline-offset-4 hover:underline"
      >
        Envoyer une autre demande
      </button>
    </motion.div>
  );
}
