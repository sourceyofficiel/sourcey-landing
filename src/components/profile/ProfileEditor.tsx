"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  User as UserIcon,
  Mail,
  Phone,
  Building2,
  Store,
  TrendingUp,
  Check,
  Loader2,
  AlertCircle,
  Upload,
  Sparkles,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  companyName: string | null;
  phone: string | null;
  ecomPlatform: string | null;
  monthlyVolume: string | null;
  bio: string | null;
  plan: string;
}

const PLATFORMS = [
  { value: "shopify", label: "Shopify" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "prestashop", label: "PrestaShop" },
  { value: "amazon", label: "Amazon" },
  { value: "other", label: "Autre" },
  { value: "none", label: "Pas encore" },
];

const VOLUMES = [
  { value: "<1k", label: "< 1 000 €/mois" },
  { value: "1k-10k", label: "1k – 10k €/mois" },
  { value: "10k-50k", label: "10k – 50k €/mois" },
  { value: "50k+", label: "50k+ €/mois" },
];

export function ProfileEditor({ user: initial }: { user: UserData }) {
  const [user, setUser] = useState<UserData>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  function update<K extends keyof UserData>(key: K, value: UserData[K]) {
    setUser((u) => ({ ...u, [key]: value }));
    setStatus("idle");
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Upload failed");
      update("avatarUrl", data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur upload");
      setStatus("error");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: user.fullName ?? "",
          companyName: user.companyName ?? "",
          phone: user.phone ?? "",
          ecomPlatform: user.ecomPlatform ?? "",
          monthlyVolume: user.monthlyVolume ?? "",
          bio: user.bio ?? "",
          avatarUrl: user.avatarUrl ?? "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Erreur");
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Erreur");
    }
  }

  const planConfig =
    user.plan === "pro"
      ? {
          label: "Pro",
          color: "bg-primary-50 text-primary-700 border-primary-100",
          desc: "Agent dédié + Vidéos QC + IA illimitée",
          icon: Sparkles,
        }
      : user.plan === "enterprise"
        ? {
            label: "Entreprise",
            color: "bg-enterprise-50 text-enterprise-700 border-enterprise-100",
            desc: "Account manager + Entrepôt EU + SLA",
            icon: Crown,
          }
        : user.plan === "starter"
          ? {
              label: "Starter",
              color: "bg-emerald-50 text-emerald-700 border-emerald-100",
              desc: "3 demandes/mois · Chat agent",
              icon: ShieldCheck,
            }
          : {
              label: "Gratuit",
              color: "bg-neutral-100 text-neutral-700 border-neutral-200",
              desc: "Découverte · Annuaire en lecture",
              icon: UserIcon,
            };

  return (
    <form
      onSubmit={save}
      className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
    >
      {/* Avatar + plan header */}
      <div className="flex flex-col items-start gap-5 border-b border-neutral-100 pb-6 md:flex-row md:items-center">
        <div className="relative">
          <Avatar user={user} size={88} />
          <label className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary-600 text-white shadow-sm transition-colors hover:bg-primary-700">
            {avatarUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={onAvatarChange}
              disabled={avatarUploading}
            />
          </label>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-extrabold text-neutral-900">
            {user.fullName ?? user.email.split("@")[0]}
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500">{user.email}</p>
          <div
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold",
              planConfig.color
            )}
          >
            <planConfig.icon className="h-3 w-3" />
            Plan {planConfig.label}
          </div>
          <p className="mt-1.5 text-[11.5px] text-neutral-500">{planConfig.desc}</p>
        </div>
      </div>

      {/* Personal info */}
      <div>
        <h3 className="text-sm font-bold text-neutral-900">
          Informations personnelles
        </h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <Field label="Nom complet" icon={UserIcon}>
            <input
              type="text"
              value={user.fullName ?? ""}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Marie Dubois"
              className="input"
              autoComplete="name"
            />
          </Field>
          <Field label="Email" icon={Mail}>
            <input
              type="email"
              value={user.email}
              disabled
              className="input cursor-not-allowed bg-neutral-50 text-neutral-500"
              autoComplete="email"
            />
          </Field>
          <Field label="Téléphone" icon={Phone}>
            <input
              type="tel"
              value={user.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="input"
              autoComplete="tel"
            />
          </Field>
          <Field label="Entreprise" icon={Building2}>
            <input
              type="text"
              value={user.companyName ?? ""}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="Atelier Lila SAS"
              className="input"
              autoComplete="organization"
            />
          </Field>
        </div>
      </div>

      {/* E-commerce profile */}
      <div className="border-t border-neutral-100 pt-6">
        <h3 className="text-sm font-bold text-neutral-900">
          Profil e-commerce
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Aide les agents à mieux te comprendre. Améliore le matching IA.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <Field label="Plateforme principale" icon={Store}>
            <select
              value={user.ecomPlatform ?? ""}
              onChange={(e) => update("ecomPlatform", e.target.value)}
              className="input"
            >
              <option value="">— Choisis —</option>
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Volume mensuel" icon={TrendingUp}>
            <select
              value={user.monthlyVolume ?? ""}
              onChange={(e) => update("monthlyVolume", e.target.value)}
              className="input"
            >
              <option value="">— Choisis —</option>
              {VOLUMES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Bio courte (optionnel)" icon={UserIcon} className="mt-4">
          <textarea
            value={user.bio ?? ""}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="Une ligne sur ta marque, ton produit star, ton objectif…"
            rows={3}
            maxLength={500}
            className="input resize-none"
          />
        </Field>
      </div>

      {/* Status + save */}
      <div className="flex items-center justify-between border-t border-neutral-100 pt-5">
        <AnimatePresence mode="wait">
          {status === "saved" && (
            <motion.div
              key="saved"
              className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"
            >
              <Check className="h-3 w-3" strokeWidth={3} />
              Profil enregistré
            </motion.div>
          )}
          {status === "error" && error && (
            <motion.div
              key="err"
              className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.div>
          )}
          {status !== "saved" && status !== "error" && (
            <span key="hint" className="text-[11px] text-neutral-400">
              Toutes les modifs sont privées et chiffrées.
            </span>
          )}
        </AnimatePresence>
        <Button type="submit" variant="primary" size="md" disabled={status === "saving"}>
          {status === "saving" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" strokeWidth={3} />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          height: 42px;
          padding: 0 14px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          color: #0f172a;
          transition: all 0.15s ease;
        }
        :global(.input::placeholder) {
          color: #94a3b8;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }
        :global(textarea.input) {
          height: auto;
          padding: 10px 14px;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="flex items-center gap-1.5 text-[12px] font-bold text-neutral-700">
        <Icon className="h-3 w-3 text-neutral-400" />
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Avatar({ user, size = 88 }: { user: UserData; size?: number }) {
  if (user.avatarUrl) {
    return (
      <Image
        src={user.avatarUrl}
        alt={user.fullName ?? user.email}
        width={size}
        height={size}
        className="rounded-full object-cover ring-4 ring-white shadow-md"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = (user.fullName ?? user.email)
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="grid place-items-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white ring-4 ring-white shadow-md"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {initials}
    </div>
  );
}
