"use client";

import { useState } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";

const TONES = [
  { value: "friendly", label: "Amical", desc: "Chaleureux, humain, tutoiement OK" },
  { value: "pro", label: "Pro", desc: "Soutenu, vouvoiement, courtois" },
  { value: "casual", label: "Décontracté", desc: "Direct, expressions usuelles" },
];

export function SettingsClient({
  workspaceSlug,
  initialName,
  initialSignature,
  initialTone,
  initialBrandContext,
  initialKbText,
}: {
  workspaceSlug: string;
  initialName: string;
  initialSignature: string;
  initialTone: string;
  initialBrandContext: string;
  initialKbText: string;
}) {
  const [name, setName] = useState(initialName);
  const [signature, setSignature] = useState(initialSignature);
  const [tone, setTone] = useState(initialTone);
  const [brandContext, setBrandContext] = useState(initialBrandContext);
  const [kbText, setKbText] = useState(initialKbText);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/autosav/workspace/${workspaceSlug}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          signature,
          tone,
          brandContext,
          kbText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setMessage({ ok: true, text: "Réglages enregistrés" });
    } catch (e) {
      setMessage({
        ok: false,
        text: e instanceof Error ? e.message : "Erreur",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Workspace */}
      <Section title="Workspace" desc="Le nom affiché dans ton dashboard.">
        <Field label="Nom">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </Field>
      </Section>

      {/* Tone */}
      <Section
        title="Ton de la marque"
        desc="L'IA utilise ce style pour rédiger les réponses."
      >
        <div className="grid gap-2 md:grid-cols-3">
          {TONES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTone(t.value)}
              className={`rounded-xl border bg-white p-4 text-left transition-all ${
                tone === t.value
                  ? "border-indigo-500 ring-2 ring-indigo-100"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="font-bold text-neutral-900">{t.label}</div>
              <div className="mt-1 text-[12px] text-neutral-500">{t.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Signature */}
      <Section
        title="Signature email"
        desc="Apposée à la fin de chaque draft IA. Garde-la courte."
      >
        <textarea
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          rows={4}
          className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </Section>

      {/* Brand context */}
      <Section
        title="Contexte de marque (optionnel)"
        desc="Décris brièvement ta marque, ce que tu vends, ta promesse. L'IA s'en sert pour rester cohérente."
      >
        <textarea
          value={brandContext}
          onChange={(e) => setBrandContext(e.target.value)}
          rows={4}
          placeholder="Ex: Marque de bijoux artisanaux made in France, livrés sous 48h en Mondial Relay. Valeurs : transparence, made-in-France, paiement sécurisé."
          className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </Section>

      {/* KB */}
      <Section
        title="Base de connaissances"
        desc="FAQ, politique de retour, livraison, paiement. L'IA pioche dedans pour répondre avec exactitude."
      >
        <textarea
          value={kbText}
          onChange={(e) => setKbText(e.target.value)}
          rows={12}
          placeholder="Colle ici toutes les infos utiles : politique de retour, délais livraison, paiement, garanties..."
          className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 font-mono text-[13px] leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <p className="mt-2 text-[12px] text-neutral-500">
          {kbText.length} caractères ·{" "}
          {kbText.length < 100 ? "trop court pour bien guider l'IA" : "OK"}
        </p>
      </Section>

      {/* Save */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white px-5 py-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.1)]">
        <div>
          {message && (
            <div
              className={`flex items-center gap-1.5 text-[13px] ${
                message.ok ? "text-green-700" : "text-rose-700"
              }`}
            >
              {message.ok ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <AlertCircle className="h-3.5 w-3.5" />
              )}
              {message.text}
            </div>
          )}
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-[13.5px] font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enregistrement…
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h3 className="font-display text-[16px] font-extrabold tracking-tight text-neutral-900">
        {title}
      </h3>
      <p className="mt-1 text-[12.5px] text-neutral-500">{desc}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12.5px] font-medium text-neutral-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
