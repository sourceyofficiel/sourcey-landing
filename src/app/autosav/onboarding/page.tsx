"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Loader2,
  Building2,
  Store,
  Inbox,
  BookOpen,
  Sparkles,
} from "lucide-react";

/**
 * Onboarding AutoSAV — 5 étapes obligatoires pour activer un workspace.
 *
 * Étape 1 : Nom du workspace (créé en DB côté serveur)
 * Étape 2 : Connecter store (Shopify OAuth ou Woo manuel) — skippable
 * Étape 3 : Connecter boîte mail (Gmail OAuth ou IMAP manuel) — skippable
 * Étape 4 : Importer la KB (textarea pour MVP, RAG en phase 2)
 * Étape 5 : Choisir plan (trial activé d'office, plan définitif au billing)
 *
 * Pour la version test, on garde tout dans un seul composant client avec
 * étapes. La logique Stripe/OAuth est branchée plus tard.
 */
export default function AutosavOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);
  const [storeProvider, setStoreProvider] = useState<string | null>(null);
  const [inboxProvider, setInboxProvider] = useState<string | null>(null);
  const [kbText, setKbText] = useState("");

  async function submitStep1() {
    if (!workspaceName.trim()) {
      setError("Nom du workspace requis");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/autosav/workspace/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setWorkspaceSlug(data.workspace.slug);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  function finish() {
    if (workspaceSlug) {
      router.push(`/autosav/w/${workspaceSlug}`);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-[18px] font-extrabold tracking-tight">
              AutoSAV
            </span>
          </div>
          <div className="text-[12.5px] text-neutral-500">
            Étape {step} / 5
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-neutral-100">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto max-w-[560px] px-5 py-10 md:py-14">
        {/* === STEP 1 : WORKSPACE === */}
        {step === 1 && (
          <StepCard
            icon={Building2}
            title="Crée ton workspace"
            desc="Un workspace = ton espace de travail SAV. Tu peux en avoir plusieurs (multi-boutiques)."
          >
            <label className="block text-[13px] font-medium text-neutral-700">
              Nom de ton workspace
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Ex: Ma Marque, ACME Store"
              autoFocus
              className="mt-1.5 block h-12 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-[16px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-2 text-[12px] text-neutral-500">
              Souvent le nom de ta boutique. Tu pourras le changer plus tard.
            </p>

            {error && <ErrorBox message={error} />}

            <button
              onClick={submitStep1}
              disabled={loading}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[14.5px] font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Création…
                </>
              ) : (
                <>
                  Continuer <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </StepCard>
        )}

        {/* === STEP 2 : STORE === */}
        {step === 2 && (
          <StepCard
            icon={Store}
            title="Connecte ta boutique"
            desc="On va récupérer tes commandes pour injecter le contexte commande dans les drafts IA."
          >
            <div className="grid gap-2">
              <ProviderButton
                label="Shopify"
                desc="OAuth 1 clic"
                color="green"
                onClick={() => setStoreProvider("shopify")}
                selected={storeProvider === "shopify"}
              />
              <ProviderButton
                label="WooCommerce"
                desc="Clés API REST"
                color="purple"
                onClick={() => setStoreProvider("woocommerce")}
                selected={storeProvider === "woocommerce"}
              />
              <ProviderButton
                label="Prestashop / Magento"
                desc="Bientôt disponible"
                color="neutral"
                disabled
              />
            </div>

            <p className="mt-4 text-[12.5px] text-neutral-400">
              ℹ️ Pour le test, on skip cette étape — branchement OAuth en
              prochaine itération.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setStep(3)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-[13.5px] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Passer cette étape
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!storeProvider}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[13.5px] font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </StepCard>
        )}

        {/* === STEP 3 : INBOX === */}
        {step === 3 && (
          <StepCard
            icon={Inbox}
            title="Connecte ta boîte mail"
            desc="On va lire les emails clients entrants et drafter les réponses. Aucun email n'est envoyé sans ta validation."
          >
            <div className="grid gap-2">
              <ProviderButton
                label="Gmail / Google Workspace"
                desc="OAuth 1 clic"
                color="red"
                onClick={() => setInboxProvider("gmail")}
                selected={inboxProvider === "gmail"}
              />
              <ProviderButton
                label="Outlook / Microsoft 365"
                desc="OAuth Azure AD"
                color="blue"
                onClick={() => setInboxProvider("outlook")}
                selected={inboxProvider === "outlook"}
              />
              <ProviderButton
                label="IONOS / IMAP générique"
                desc="Identifiants manuels"
                color="purple"
                onClick={() => setInboxProvider("imap")}
                selected={inboxProvider === "imap"}
              />
            </div>

            <p className="mt-4 text-[12.5px] text-neutral-400">
              ℹ️ Branchement OAuth en prochaine itération — on skip pour le
              test.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setStep(4)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-[13.5px] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Passer
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!inboxProvider}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[13.5px] font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </StepCard>
        )}

        {/* === STEP 4 : KB === */}
        {step === 4 && (
          <StepCard
            icon={BookOpen}
            title="Importe ta base de connaissances"
            desc="Colle ici tes FAQ, politique de retour, infos livraison. L'IA s'en sert pour répondre avec exactitude."
          >
            <label className="block text-[13px] font-medium text-neutral-700">
              Knowledge base (texte libre)
            </label>
            <textarea
              value={kbText}
              onChange={(e) => setKbText(e.target.value)}
              rows={10}
              placeholder={`Exemple :

POLITIQUE DE RETOUR
- 14 jours pour retourner un produit
- Produit doit être neuf et dans son emballage
- Frais de retour à la charge du client

LIVRAISON
- Colissimo France : 3-5 jours, 5,90€
- Mondial Relay : 4-6 jours, 4,50€

...`}
              className="mt-1.5 block w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-3 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="mt-2 text-[12px] text-neutral-500">
              Tu pourras enrichir ça plus tard dans Réglages → Knowledge Base.
            </p>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => setStep(5)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-[13.5px] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Passer
              </button>
              <button
                onClick={() => setStep(5)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[13.5px] font-bold text-white hover:bg-indigo-700"
              >
                Continuer
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </StepCard>
        )}

        {/* === STEP 5 : PLAN === */}
        {step === 5 && (
          <StepCard
            icon={Sparkles}
            title="Ton essai 14 jours commence"
            desc="Tu es sur le plan trial avec 200 tickets/mois. Tu pourras passer à un plan payant à tout moment depuis Réglages → Facturation."
          >
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                <Check className="h-3 w-3" />
                Trial activé
              </div>
              <div className="mt-3 font-display text-[24px] font-extrabold tracking-tight text-indigo-900">
                14 jours · 200 tickets inclus
              </div>
              <p className="mt-1 text-[13px] text-indigo-800">
                Sans CB demandée. Aucune limite sur les features.
              </p>
            </div>

            <button
              onClick={finish}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-[14.5px] font-bold text-white hover:bg-indigo-700"
            >
              Accéder à mon dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </StepCard>
        )}
      </div>
    </main>
  );
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function StepCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-7 md:p-9">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <h1 className="mt-5 font-display text-[24px] font-extrabold tracking-tight md:text-[28px]">
        {title}
      </h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-neutral-500">
        {desc}
      </p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ProviderButton({
  label,
  desc,
  color,
  onClick,
  selected,
  disabled,
}: {
  label: string;
  desc: string;
  color: "green" | "purple" | "red" | "blue" | "neutral";
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}) {
  const colorBg = {
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    neutral: "bg-neutral-100 text-neutral-500",
  }[color];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left transition-colors ${
        selected
          ? "border-indigo-500 ring-2 ring-indigo-100"
          : "border-neutral-200 hover:border-neutral-300"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold ${colorBg}`}
      >
        {label.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-bold text-neutral-900">{label}</div>
        <div className="text-[12px] text-neutral-500">{desc}</div>
      </div>
      {selected && <Check className="h-4 w-4 text-indigo-600" />}
    </button>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700">
      {message}
    </div>
  );
}
