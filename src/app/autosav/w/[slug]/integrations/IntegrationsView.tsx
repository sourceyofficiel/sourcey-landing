"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plug,
  ShoppingBag,
  Mail,
  Server,
  Truck,
  Check,
  Loader2,
  X,
  AlertCircle,
  ExternalLink,
  Settings,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

type IntegrationType =
  | "shopify"
  | "woocommerce"
  | "gmail"
  | "outlook"
  | "ionos"
  | "laposte";

interface Integration {
  id: string;
  type: IntegrationType;
  status: "connected" | "disconnected" | "error";
  lastSyncAt: string | null;
  lastSyncError: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CatalogItem {
  type: IntegrationType;
  name: string;
  category: "store" | "email" | "shipping";
  color: string;
  icon: typeof ShoppingBag;
  description: string;
  setupHint: string;
  badge?: string;
  fields: Array<{
    key: string;
    label: string;
    type?: "text" | "password" | "email" | "number";
    placeholder?: string;
    help?: string;
  }>;
}

const CATALOG: CatalogItem[] = [
  {
    type: "shopify",
    name: "Shopify",
    category: "store",
    color: "emerald",
    icon: ShoppingBag,
    description:
      "Importe les commandes, statuts de livraison et infos client en temps réel.",
    setupHint:
      "Crée une app privée dans ton admin Shopify (Settings → Apps → Develop apps) et copie le token.",
    fields: [
      {
        key: "shopDomain",
        label: "Domaine de la boutique",
        placeholder: "ma-boutique.myshopify.com",
        help: "Adresse complète, sans https://",
      },
      {
        key: "adminApiToken",
        label: "Admin API access token",
        type: "password",
        placeholder: "shpat_…",
      },
    ],
  },
  {
    type: "woocommerce",
    name: "WooCommerce",
    category: "store",
    color: "violet",
    icon: ShoppingBag,
    description:
      "Connecte ton WooCommerce via les clés API REST. Tout reste sur ton serveur.",
    setupHint:
      "WooCommerce → Réglages → Avancé → API REST → Ajouter une clé (lecture seule suffit).",
    fields: [
      {
        key: "storeUrl",
        label: "URL de la boutique",
        placeholder: "https://maboutique.fr",
      },
      {
        key: "consumerKey",
        label: "Consumer key",
        type: "password",
        placeholder: "ck_…",
      },
      {
        key: "consumerSecret",
        label: "Consumer secret",
        type: "password",
        placeholder: "cs_…",
      },
    ],
  },
  {
    type: "gmail",
    name: "Gmail",
    category: "email",
    color: "rose",
    icon: Mail,
    badge: "OAuth",
    description:
      "Lis les emails entrants et envoie les réponses depuis ta boîte Gmail / Google Workspace.",
    setupHint:
      "OAuth 2.0 : tu seras redirigé vers Google pour autoriser AutoSAV. Aucun mot de passe stocké.",
    fields: [
      {
        key: "email",
        label: "Adresse Gmail à connecter",
        type: "email",
        placeholder: "sav@boutique.fr",
        help: "Le bouton ci-dessous lance le flow OAuth Google.",
      },
    ],
  },
  {
    type: "outlook",
    name: "Outlook / Microsoft 365",
    category: "email",
    color: "blue",
    icon: Mail,
    badge: "OAuth",
    description:
      "Idem Gmail mais pour les boîtes Outlook.com, Hotmail et Microsoft 365.",
    setupHint:
      "OAuth Microsoft : redirection vers Microsoft, AutoSAV ne voit jamais le mot de passe.",
    fields: [
      {
        key: "email",
        label: "Adresse Outlook à connecter",
        type: "email",
        placeholder: "sav@boutique.fr",
      },
    ],
  },
  {
    type: "ionos",
    name: "IONOS / SMTP / IMAP",
    category: "email",
    color: "amber",
    icon: Server,
    description:
      "Boîte custom (IONOS, OVH, autre) : on se connecte en IMAP pour lire et SMTP pour envoyer.",
    setupHint:
      "Récupère les paramètres serveur dans ton panel hébergeur (IMAP 993 SSL, SMTP 465 SSL).",
    fields: [
      {
        key: "email",
        label: "Adresse email",
        type: "email",
        placeholder: "sav@boutique.fr",
      },
      {
        key: "password",
        label: "Mot de passe",
        type: "password",
        help: "Stocké chiffré AES-256. Mieux : utilise un mot de passe d'application dédié.",
      },
      {
        key: "imapHost",
        label: "Serveur IMAP",
        placeholder: "imap.ionos.fr",
      },
      {
        key: "imapPort",
        label: "Port IMAP",
        type: "number",
        placeholder: "993",
      },
      {
        key: "smtpHost",
        label: "Serveur SMTP",
        placeholder: "smtp.ionos.fr",
      },
      {
        key: "smtpPort",
        label: "Port SMTP",
        type: "number",
        placeholder: "465",
      },
    ],
  },
  {
    type: "laposte",
    name: "Colissimo / La Poste",
    category: "shipping",
    color: "amber",
    icon: Truck,
    description:
      "Suivi temps réel des colis directement depuis le numéro de tracking détecté.",
    setupHint:
      "Identifiants API Colissimo (contrat Colissimo Pro requis). Demande à ton chargé de compte.",
    fields: [
      {
        key: "accountNumber",
        label: "Numéro de compte Colissimo",
        placeholder: "123456",
      },
      {
        key: "apiPassword",
        label: "Mot de passe API",
        type: "password",
      },
    ],
  },
];

const COLOR_CLASSES: Record<
  string,
  { bg: string; text: string; ring: string; soft: string }
> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-200/60",
    soft: "bg-emerald-50/40",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-200/60",
    soft: "bg-violet-50/40",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    ring: "ring-rose-200/60",
    soft: "bg-rose-50/40",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200/60",
    soft: "bg-blue-50/40",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200/60",
    soft: "bg-amber-50/40",
  },
};

const CATEGORY_LABEL = {
  store: "Boutique e-commerce",
  email: "Email & messagerie",
  shipping: "Transport & livraison",
};

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

/* ============================================================
   INTEGRATIONS VIEW
   ============================================================ */

export function IntegrationsView({
  workspaceSlug,
  workspaceName,
  canManage,
}: {
  workspaceSlug: string;
  workspaceName: string;
  canManage: boolean;
}) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSetup, setOpenSetup] = useState<IntegrationType | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/integrations`
      );
      const json = await res.json();
      if (res.ok) setIntegrations(json.integrations ?? []);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const grouped = {
    store: CATALOG.filter((c) => c.category === "store"),
    email: CATALOG.filter((c) => c.category === "email"),
    shipping: CATALOG.filter((c) => c.category === "shipping"),
  };

  function statusOf(type: IntegrationType): Integration | undefined {
    return integrations.find((i) => i.type === type);
  }

  return (
    <div className="h-full overflow-y-auto bg-neutral-50/50">
      <div className="mx-auto max-w-5xl px-6 py-8 lg:px-10 lg:py-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            <Plug className="h-3.5 w-3.5" />
            Intégrations · {workspaceName}
          </div>
          <h2 className="mt-1 font-display text-[26px] font-extrabold tracking-tight text-neutral-900">
            Connecte tes outils
          </h2>
          <p className="mt-1 max-w-2xl text-[13.5px] text-neutral-600">
            Plus tu en connectes, plus l'IA est précise. AutoSAV peut récupérer
            les commandes, les statuts de livraison et envoyer les réponses
            directement depuis ta boîte email habituelle.
          </p>
        </div>

        {/* Trust banner */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
          <div>
            <div className="font-display text-[13.5px] font-bold text-emerald-900">
              Tes identifiants sont chiffrés
            </div>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-emerald-900/80">
              AES-256-GCM au repos, jamais loggués, jamais transmis à l'IA.
              Tu peux déconnecter à tout moment et tout est purgé.
            </p>
          </div>
        </div>

        {/* Status summary */}
        {!loading && (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Connectées"
              value={
                integrations.filter((i) => i.status === "connected").length
              }
              tone="emerald"
            />
            <SummaryCard
              label="En erreur"
              value={integrations.filter((i) => i.status === "error").length}
              tone="rose"
            />
            <SummaryCard
              label="Disponibles"
              value={CATALOG.length - integrations.length}
              tone="neutral"
            />
          </div>
        )}

        {/* Sections par catégorie */}
        {(["store", "email", "shipping"] as const).map((cat) => (
          <section key={cat} className="mt-8">
            <h3 className="px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              {CATEGORY_LABEL[cat]}
            </h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {grouped[cat].map((item) => (
                <IntegrationCard
                  key={item.type}
                  item={item}
                  integration={statusOf(item.type)}
                  canManage={canManage}
                  onSetup={() => setOpenSetup(item.type)}
                  onRefresh={refetch}
                  workspaceSlug={workspaceSlug}
                />
              ))}
            </div>
          </section>
        ))}

        <p className="mt-10 text-center text-[11.5px] text-neutral-500">
          Tu as besoin d'une intégration absente ? Écris-nous à{" "}
          <a
            href="mailto:support@autosav.io"
            className="font-bold text-emerald-700 hover:underline"
          >
            support@autosav.io
          </a>{" "}
          — on l'ajoute en 48h.
        </p>
      </div>

      {openSetup && (
        <SetupModal
          item={CATALOG.find((c) => c.type === openSetup)!}
          workspaceSlug={workspaceSlug}
          onClose={() => setOpenSetup(null)}
          onSaved={() => {
            setOpenSetup(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   INTEGRATION CARD
   ============================================================ */

function IntegrationCard({
  item,
  integration,
  canManage,
  onSetup,
  onRefresh,
  workspaceSlug,
}: {
  item: CatalogItem;
  integration?: Integration;
  canManage: boolean;
  onSetup: () => void;
  onRefresh: () => void;
  workspaceSlug: string;
}) {
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const Icon = item.icon;
  const c = COLOR_CLASSES[item.color];
  const isConnected = integration?.status === "connected";
  const isError = integration?.status === "error";
  const isImapType =
    item.type === "ionos" || item.type === "gmail" || item.type === "outlook";

  async function disconnect() {
    if (!confirm(`Déconnecter ${item.name} ? Les données existantes restent.`))
      return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/integrations?type=${item.type}`,
        { method: "DELETE" }
      );
      if (res.ok) onRefresh();
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/integrations/sync`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: item.type }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setSyncMsg({
          ok: false,
          text: data.error ?? "Échec de la synchro",
        });
        return;
      }
      setSyncMsg({
        ok: true,
        text: `${data.created} nouveau${data.created > 1 ? "x" : ""} ticket${
          data.created > 1 ? "s" : ""
        } · ${data.skipped} déjà importé${data.skipped > 1 ? "s" : ""}`,
      });
      onRefresh();
    } catch {
      setSyncMsg({ ok: false, text: "Erreur réseau" });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
        isConnected
          ? "border-emerald-300/60"
          : isError
            ? "border-rose-300/60"
            : "border-neutral-200/70"
      }`}
    >
      {/* Status pill */}
      <div className="absolute right-4 top-4">
        {isConnected ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Connectée
          </span>
        ) : isError ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10.5px] font-bold text-rose-800">
            <AlertCircle className="h-2.5 w-2.5" />
            Erreur
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10.5px] font-bold text-neutral-600">
            Disponible
          </span>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${c.bg} ${c.ring}`}
        >
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="font-display text-[14.5px] font-bold text-neutral-900">
              {item.name}
            </h4>
            {item.badge && (
              <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-600">
                {item.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-neutral-600">
            {item.description}
          </p>
        </div>
      </div>

      {/* Last sync info */}
      {integration && (
        <div className="mt-3 flex items-center gap-3 text-[11.5px] text-neutral-500">
          {integration.lastSyncAt && (
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Sync {formatTimeAgo(integration.lastSyncAt)}
            </span>
          )}
          {integration.lastSyncError && (
            <span className="inline-flex items-center gap-1 text-rose-600">
              <AlertCircle className="h-3 w-3" />
              {integration.lastSyncError.slice(0, 40)}…
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {isConnected ? (
          <>
            {isImapType && canManage && (
              <button
                onClick={syncNow}
                disabled={syncing}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-[12.5px] font-bold text-amber-200 transition-all hover:bg-emerald-900 disabled:opacity-50"
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Synchro…
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Synchroniser
                  </>
                )}
              </button>
            )}
            <button
              onClick={onSetup}
              disabled={!canManage}
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-[12.5px] font-bold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 ${
                isImapType && canManage ? "" : "flex-1"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              <span className={isImapType && canManage ? "sr-only sm:not-sr-only" : ""}>
                Reconfigurer
              </span>
            </button>
            {canManage && (
              <button
                onClick={disconnect}
                disabled={busy}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                title="Déconnecter"
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onSetup}
            disabled={!canManage}
            className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-800 px-3 text-[12.5px] font-bold text-amber-200 transition-all hover:bg-emerald-900 active:scale-[0.99] disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Connecter
          </button>
        )}
      </div>

      {/* Feedback synchro */}
      {syncMsg && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-lg p-2.5 text-[11.5px] leading-relaxed ${
            syncMsg.ok
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200/60"
              : "bg-rose-50 text-rose-800 ring-1 ring-inset ring-rose-200/60"
          }`}
        >
          {syncMsg.ok ? (
            <Check className="mt-0.5 h-3 w-3 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          )}
          <span>{syncMsg.text}</span>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "neutral";
}) {
  const t = {
    emerald: "from-emerald-50 to-emerald-100/40 text-emerald-900",
    rose: "from-rose-50 to-rose-100/40 text-rose-900",
    neutral: "from-neutral-50 to-neutral-100/40 text-neutral-900",
  }[tone];
  return (
    <div
      className={`rounded-2xl border border-neutral-200/70 bg-gradient-to-br p-4 ${t}`}
    >
      <div className="text-[10.5px] font-bold uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className="mt-1 font-display text-[26px] font-extrabold tracking-tight">
        {value}
      </div>
    </div>
  );
}

/* ============================================================
   SETUP MODAL
   ============================================================ */

function SetupModal({
  item,
  workspaceSlug,
  onClose,
  onSaved,
}: {
  item: CatalogItem;
  workspaceSlug: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const Icon = item.icon;
  const c = COLOR_CLASSES[item.color];

  const isOAuth = item.type === "gmail" || item.type === "outlook";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isOAuth) {
        // OAuth : redirige vers le provider. Pour MVP on enregistre quand même
        // les valeurs en config puis on simule un "connecté" — le branchement
        // OAuth complet (Google / Microsoft) viendra en phase 2.
        const res = await fetch(
          `/api/autosav/workspace/${workspaceSlug}/integrations`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: item.type,
              config: { ...values, oauthPending: true },
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Erreur");
          return;
        }
        // En phase 2 : window.location.href = `/api/autosav/oauth/${item.type}/start`;
        onSaved();
        return;
      }

      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/integrations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: item.type, config: values }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la sauvegarde");
        return;
      }
      onSaved();
    } catch {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]"
      >
        <header className="flex items-center justify-between border-b border-neutral-200/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-inset ${c.bg} ${c.ring}`}
            >
              <Icon className={`h-4 w-4 ${c.text}`} />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-bold text-neutral-900">
                Connecter {item.name}
              </h3>
              <p className="text-[11.5px] text-neutral-500">
                {CATEGORY_LABEL[item.category]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className={`rounded-xl p-3 ring-1 ring-inset ${c.soft} ${c.ring}`}>
            <p className="text-[12px] leading-relaxed text-neutral-700">
              {item.setupHint}
            </p>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {item.fields.map((f) => (
              <label key={f.key} className="block">
                <span className="block text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                  {f.label}
                </span>
                <div className="relative mt-1.5">
                  <input
                    type={
                      f.type === "password" && showSecrets[f.key]
                        ? "text"
                        : (f.type ?? "text")
                    }
                    required
                    value={values[f.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.key]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    className="block h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 pr-10 text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                  {f.type === "password" && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowSecrets((s) => ({
                          ...s,
                          [f.key]: !s[f.key],
                        }))
                      }
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"
                      tabIndex={-1}
                    >
                      {showSecrets[f.key] ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
                {f.help && (
                  <p className="mt-1 text-[11px] text-neutral-500">{f.help}</p>
                )}
              </label>
            ))}

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-[12px] text-rose-800 ring-1 ring-inset ring-rose-200/60">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[13px] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-[13px] font-bold text-amber-200 transition-all hover:bg-emerald-900 disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {isOAuth ? "Redirection…" : "Connexion…"}
                  </>
                ) : (
                  <>
                    {isOAuth ? (
                      <>
                        <ExternalLink className="h-3.5 w-3.5" />
                        Autoriser
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Connecter
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
