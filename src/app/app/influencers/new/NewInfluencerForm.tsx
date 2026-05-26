"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Link as LinkIcon,
  Check,
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  Wallet,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand_context: string | null;
}

type Platform = "tiktok" | "instagram" | "snapchat";
type Bucket = "below_100k" | "above_100k" | "above_1m";

const PLATFORMS: Array<{ value: Platform; label: string; example: string }> = [
  { value: "tiktok", label: "TikTok", example: "tiktok.com/@charlidamelio" },
  { value: "instagram", label: "Instagram", example: "instagram.com/zendaya" },
  { value: "snapchat", label: "Snapchat", example: "snapchat.com/add/username" },
];

const BUCKETS: Array<{ value: Bucket; label: string }> = [
  { value: "below_100k", label: "< 100k" },
  { value: "above_100k", label: "+ 100k" },
  { value: "above_1m", label: "+ 1 million" },
];

export function NewInfluencerForm({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [url, setUrl] = useState("");
  const [bucket, setBucket] = useState<Bucket | null>(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [pricingEur, setPricingEur] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasOneContact =
    whatsapp.trim().length > 0 ||
    email.trim().length > 0 ||
    otherContact.trim().length > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!bucket) {
      setError("Choisis une tranche de followers.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const payload = {
        platform,
        url: url.trim(),
        followers_bucket: bucket,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        other_contact: otherContact.trim() || undefined,
        pricing_eur: pricingEur ? parseFloat(pricingEur) : undefined,
        brand_id: brands[0]?.id ?? undefined,
      };

      const res = await fetch("/api/influencers/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.existingId) {
          if (confirm(`${data.error}\n\nVoir la fiche existante ?`)) {
            router.push(`/app/influencers/${data.existingId}`);
          }
          return;
        }
        setError(data.error ?? "Erreur");
        return;
      }

      router.push(`/app/influencers/${data.influencer.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-8 lg:px-8 lg:py-10">
      <Link
        href="/app/influencers"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-neutral-400 hover:text-neutral-100"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour à la liste
      </Link>

      <h1 className="mt-3 font-display text-[24px] font-extrabold tracking-tight text-white">
        Nouvelle lead
      </h1>
      <p className="mt-1 text-[13px] text-neutral-400">
        L&apos;influenceur a accepté la collab. Note ses infos en 30 secondes.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6"
      >
        {/* 1. Plateforme */}
        <Section number="1" title="Plateforme contactée">
          <div className="grid grid-cols-3 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPlatform(p.value)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-colors",
                  platform === p.value
                    ? "border-violet-500 bg-violet-500/10 text-violet-200"
                    : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Section>

        {/* 2. URL */}
        <Section number="2" title="Lien du profil">
          <div className="relative">
            <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="url"
              required
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`https://${PLATFORMS.find((p) => p.value === platform)?.example}`}
              className="block h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-10 pr-3 text-[13.5px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
            />
          </div>
        </Section>

        {/* 3. Followers bucket */}
        <Section number="3" title="Nombre de followers">
          <div className="grid grid-cols-3 gap-2">
            {BUCKETS.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => setBucket(b.value)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-[13px] font-bold transition-colors",
                  bucket === b.value
                    ? "border-violet-500 bg-violet-500/10 text-violet-200"
                    : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Section>

        {/* 4. Contact */}
        <Section number="4" title="Coordonnées données par l'influenceur">
          <p className="-mt-1 mb-2.5 text-[11.5px] text-neutral-500">
            Au moins UN des trois (pas besoin de tout remplir).
          </p>
          <div className="space-y-2.5">
            <ContactInput
              icon={Phone}
              label="WhatsApp / téléphone"
              type="tel"
              value={whatsapp}
              onChange={setWhatsapp}
              placeholder="+33 6 12 34 56 78"
            />
            <ContactInput
              icon={Mail}
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="marie@example.com"
            />
            <ContactInput
              icon={MessageSquare}
              label="Autre (Telegram, Discord, snap…)"
              value={otherContact}
              onChange={setOtherContact}
              placeholder="@user_telegram"
            />
          </div>
        </Section>

        {/* 5. Prix (facultatif) */}
        <Section number="5" title="Prix demandé (facultatif)">
          <div className="relative">
            <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="number"
              min="0"
              step="10"
              value={pricingEur}
              onChange={(e) => setPricingEur(e.target.value)}
              placeholder="150"
              className="block h-11 w-full rounded-xl border border-neutral-800 bg-neutral-950 pl-10 pr-12 text-[13.5px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-neutral-500">
              €
            </span>
          </div>
        </Section>

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[12.5px] text-rose-200">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !url.trim() || !bucket || !hasOneContact}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[14px] font-bold text-white shadow-lg shadow-violet-500/20 hover:brightness-110 disabled:opacity-50"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Enregistrer la lead
            </>
          )}
        </button>
        {(!url.trim() || !bucket || !hasOneContact) && (
          <p className="mt-2 text-center text-[11px] text-neutral-500">
            Il manque :{" "}
            {[
              !url.trim() && "le lien",
              !bucket && "la tranche de followers",
              !hasOneContact && "au moins un contact",
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </form>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-[10.5px] font-bold text-violet-200">
          {number}
        </span>
        <span className="text-[12px] font-bold uppercase tracking-wider text-neutral-300">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function ContactInput({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  icon: typeof Phone;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10.5px] text-neutral-500">{label}</span>
      <div className="relative mt-1">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-950 pl-9 pr-3 text-[13px] text-white placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none"
        />
      </div>
    </label>
  );
}
