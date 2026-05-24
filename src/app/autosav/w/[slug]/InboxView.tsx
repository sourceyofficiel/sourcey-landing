"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Send,
  Mail,
  Filter,
  ChevronDown,
  Star,
  Archive,
  MoreHorizontal,
  Reply,
  Tag,
  Clock,
  Package,
  Truck,
  RotateCw,
  AlertTriangle,
  Check,
  CheckCheck,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Forward,
  Paperclip,
  Smile,
} from "lucide-react";

/* ============================================================
   MOCK DATA — tickets réalistes pour démontrer le produit
   ============================================================ */

type TicketStatus = "pending" | "drafted" | "sent" | "resolved";
type TicketCategory = "order" | "return" | "shipping" | "complaint" | "general";

interface Ticket {
  id: string;
  customerName: string;
  customerEmail: string;
  initials: string;
  avatarGradient: string;
  subject: string;
  preview: string;
  body: string;
  receivedAt: string; // ISO
  status: TicketStatus;
  unread: boolean;
  starred: boolean;
  category: TicketCategory;
  // Contexte commande détecté
  orderId?: string;
  orderStatus?: string;
  orderEta?: string;
  orderTracking?: string;
  // Draft IA pré-généré
  aiDraft?: {
    body: string;
    confidence: "high" | "medium" | "low";
    generatedIn: string;
  };
  thread?: Array<{
    from: "customer" | "you";
    body: string;
    sentAt: string;
  }>;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: "t1",
    customerName: "Marie Dupont",
    customerEmail: "marie.dupont@gmail.com",
    initials: "MD",
    avatarGradient: "from-pink-400 to-rose-500",
    subject: "Où est ma commande ?? Je m'impatiente",
    preview:
      "Cela fait 5 jours que j'ai passé ma commande #12847 et je n'ai toujours aucun mail de tracking…",
    body: `Bonjour,

Cela fait 5 jours que j'ai passé ma commande #12847 et je n'ai toujours aucun mail de tracking ! C'est pour un anniversaire ce week-end, je commence vraiment à m'inquiéter.

Pouvez-vous me dire où elle en est ?

Cordialement,
Marie`,
    receivedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    status: "pending",
    unread: true,
    starred: false,
    category: "order",
    orderId: "#12847",
    orderStatus: "En transit",
    orderEta: "Demain entre 10h-13h",
    orderTracking: "8R12345678901",
    aiDraft: {
      body: `Bonjour Marie,

Merci pour votre message, et désolés pour l'inquiétude concernant cet anniversaire ! 🎂

Bonne nouvelle : votre commande #12847 est bien partie. Le suivi Colissimo indique qu'elle est en transit et sera livrée demain entre 10h et 13h.

Voici votre numéro de suivi : 8R12345678901

Belle journée 🌿
L'équipe`,
      confidence: "high",
      generatedIn: "1,2s",
    },
  },
  {
    id: "t2",
    customerName: "Thomas Leroy",
    customerEmail: "thomas.l@outlook.fr",
    initials: "TL",
    avatarGradient: "from-amber-400 to-orange-500",
    subject: "Demande de retour — taille incorrecte",
    preview:
      "Je voudrais retourner le t-shirt commandé, la taille ne me va pas. Comment je fais ?",
    body: `Bonjour,

Je voudrais retourner le t-shirt commandé (commande #12831), la taille M me va pas du tout, c'est beaucoup trop grand. Je voudrais soit un L échangé soit un remboursement.

Comment je fais pour le retour ?

Merci d'avance,
Thomas`,
    receivedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    status: "drafted",
    unread: true,
    starred: false,
    category: "return",
    orderId: "#12831",
    aiDraft: {
      body: `Bonjour Thomas,

Pas de souci pour le retour ! Voici comment procéder en 3 étapes :

1. Rends-toi sur autosav.io/retours et entre ton n° de commande #12831
2. Choisis "Échange de taille" et sélectionne le L
3. Tu reçois un bon de retour Mondial Relay gratuit par email

Tu as 14 jours pour déposer le colis. Une fois reçu, on t'envoie le L sous 48h.

Belle journée 🌿
L'équipe`,
      confidence: "high",
      generatedIn: "0,9s",
    },
  },
  {
    id: "t3",
    customerName: "Sophie Klein",
    customerEmail: "sophie@maboutique.fr",
    initials: "SK",
    avatarGradient: "from-emerald-400 to-teal-500",
    subject: "Livraison avant le 24 décembre ?",
    preview:
      "Est-ce que je peux être livrée avant le 24 décembre si je commande aujourd'hui ?",
    body: `Bonjour !

Je voudrais offrir l'un de vos produits pour Noël. Si je commande aujourd'hui (22/12), est-ce que je peux être livrée avant le 24 décembre ? J'habite à Lyon.

Merci beaucoup pour votre réponse rapide,
Sophie`,
    receivedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    status: "pending",
    unread: true,
    starred: true,
    category: "shipping",
    aiDraft: {
      body: `Bonjour Sophie,

Excellente question ! Pour une commande passée aujourd'hui avec livraison à Lyon, nous avons 2 options :

✓ Colissimo Express (avant 13h aujourd'hui) : livraison le 23/12 — 9,90 €
✓ Chronopost (avant 16h aujourd'hui) : livraison le 23/12 garantie — 14,90 €

Le standard ne sera pas livré à temps malheureusement.

Tu veux que je te réserve un panier avec l'option Express ?

Joyeuses fêtes 🌿`,
      confidence: "medium",
      generatedIn: "1,4s",
    },
  },
  {
    id: "t4",
    customerName: "Lucas Renard",
    customerEmail: "l.renard@free.fr",
    initials: "LR",
    avatarGradient: "from-indigo-400 to-purple-500",
    subject: "Colis 'livré' mais pas reçu",
    preview:
      "Mon colis indique 'livré' sur Colissimo mais je n'ai rien reçu. Vous pouvez vérifier ?",
    body: `Bonjour,

Mon colis commande #12798 indique "livré" sur Colissimo depuis hier 14h32 mais je n'ai rien reçu chez moi.

J'ai vérifié dans la boîte aux lettres, chez les voisins, au point relais le plus proche : rien.

Pouvez-vous m'aider ?

Lucas`,
    receivedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    status: "pending",
    unread: false,
    starred: false,
    category: "complaint",
    orderId: "#12798",
    orderStatus: "Livré (réclamation)",
    orderTracking: "8R98765432109",
  },
  {
    id: "t5",
    customerName: "Camille Bonnet",
    customerEmail: "camille.b@hotmail.fr",
    initials: "CB",
    avatarGradient: "from-violet-400 to-purple-500",
    subject: "Quelle matière pour le sweat Hopaal ?",
    preview:
      "Bonjour, je voulais savoir quelle est la composition exacte du sweat oversized…",
    body: `Bonjour,

Je voulais savoir quelle est la composition exacte du sweat oversized en coton, j'ai une peau sensible et je voudrais être sûre avant de commander.

Merci !
Camille`,
    receivedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: "pending",
    unread: false,
    starred: false,
    category: "general",
    aiDraft: {
      body: `Bonjour Camille,

Bonne question ! Notre sweat oversized est en :

• 92% coton bio certifié GOTS
• 8% élasthanne pour le confort

Il est certifié Oeko-Tex (sans substances nocives pour la peau). Si tu as des sensibilités, on recommande de le laver à 30° avant la première utilisation.

N'hésite pas si tu as d'autres questions !

Belle journée 🌿
L'équipe`,
      confidence: "high",
      generatedIn: "1,1s",
    },
  },
  {
    id: "t6",
    customerName: "Julien Martin",
    customerEmail: "j.martin@orange.fr",
    initials: "JM",
    avatarGradient: "from-cyan-400 to-blue-500",
    subject: "Code promo qui ne marche pas",
    preview:
      "Le code BIENVENUE10 ne fonctionne pas au moment du paiement. C'est normal ?",
    body: `Hello,

Le code BIENVENUE10 ne fonctionne pas au moment du paiement. C'est normal ?

Julien`,
    receivedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: "pending",
    unread: false,
    starred: false,
    category: "general",
  },
];

const CATEGORY_META: Record<
  TicketCategory,
  { label: string; color: string; icon: typeof Package }
> = {
  order: { label: "Suivi colis", color: "emerald", icon: Truck },
  return: { label: "Retour", color: "amber", icon: RotateCw },
  shipping: { label: "Livraison", color: "blue", icon: Package },
  complaint: { label: "Réclamation", color: "rose", icon: AlertTriangle },
  general: { label: "Question", color: "neutral", icon: Mail },
};

const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200/50",
  amber: "bg-amber-50 text-amber-700 ring-amber-200/50",
  blue: "bg-blue-50 text-blue-700 ring-blue-200/50",
  rose: "bg-rose-50 text-rose-700 ring-rose-200/50",
  neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200/50",
};

/* ============================================================
   INBOX VIEW — 2 colonnes (ticket list + conversation)
   ============================================================ */

export function InboxView({
  workspaceSlug,
  workspaceName,
  signature,
  tone,
  kbText,
}: {
  workspaceSlug: string;
  workspaceName: string;
  signature: string;
  tone: string;
  kbText: string;
}) {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [selectedId, setSelectedId] = useState<string | null>("t1");
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "ai">(
    "all"
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return tickets.filter((t) => t.unread);
    if (filter === "starred") return tickets.filter((t) => t.starred);
    if (filter === "ai") return tickets.filter((t) => t.aiDraft);
    return tickets;
  }, [tickets, filter]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  function markAsRead(id: string) {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, unread: false } : t))
    );
  }

  function toggleStar(id: string) {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t))
    );
  }

  function markAsSent(id: string) {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "sent" as const, unread: false } : t
      )
    );
  }

  return (
    <div className="flex h-full">
      {/* ===== TICKET LIST ===== */}
      <div className="flex w-[380px] shrink-0 flex-col border-r border-neutral-200/70 bg-white">
        {/* Filters */}
        <div className="border-b border-neutral-200/70 px-4 py-3">
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100/70 p-0.5 text-[12px]">
            {[
              { value: "all" as const, label: "Tous", count: tickets.length },
              {
                value: "unread" as const,
                label: "Non-lus",
                count: tickets.filter((t) => t.unread).length,
              },
              {
                value: "ai" as const,
                label: "IA",
                count: tickets.filter((t) => t.aiDraft).length,
              },
              {
                value: "starred" as const,
                label: "★",
                count: tickets.filter((t) => t.starred).length,
              },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-1 rounded-md px-2 py-1 font-medium transition-colors ${
                  filter === f.value
                    ? "bg-white text-emerald-900 shadow-sm"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {f.label}
                <span
                  className={`ml-1 text-[10.5px] ${
                    filter === f.value ? "text-emerald-600" : "text-neutral-400"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11.5px] text-neutral-500">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3" />
              <button className="hover:text-neutral-900">Tous les tags</button>
            </div>
            <button className="flex items-center gap-0.5 hover:text-neutral-900">
              Plus récent
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <CheckCheck className="h-10 w-10 text-emerald-300" />
              <p className="mt-3 text-[13px] font-medium text-neutral-700">
                Tu es à jour ✨
              </p>
              <p className="mt-1 text-[12px] text-neutral-500">
                Aucun ticket dans ce filtre.
              </p>
            </div>
          )}
          {filtered.map((t) => {
            const isSelected = t.id === selectedId;
            const cat = CATEGORY_META[t.category];
            const CatIcon = cat.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedId(t.id);
                  markAsRead(t.id);
                }}
                className={`relative flex w-full flex-col gap-1.5 border-b border-neutral-100 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "bg-emerald-50/40"
                    : "hover:bg-neutral-50"
                }`}
              >
                {/* Left accent bar if selected */}
                {isSelected && (
                  <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-700" />
                )}
                {/* Top row : avatar + name + time */}
                <div className="flex items-start gap-2.5">
                  <div className="relative shrink-0">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${t.avatarGradient} text-[12px] font-bold text-white`}
                    >
                      {t.initials}
                    </div>
                    {t.unread && (
                      <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-600 ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-[13px] ${
                          t.unread
                            ? "font-bold text-neutral-900"
                            : "font-medium text-neutral-700"
                        }`}
                      >
                        {t.customerName}
                      </span>
                      <span className="shrink-0 text-[11px] text-neutral-400">
                        {formatTimeAgo(t.receivedAt)}
                      </span>
                    </div>
                    <div
                      className={`mt-0.5 truncate text-[12.5px] ${
                        t.unread
                          ? "font-bold text-neutral-900"
                          : "text-neutral-700"
                      }`}
                    >
                      {t.subject}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <p className="line-clamp-2 pl-12 text-[11.5px] leading-relaxed text-neutral-500">
                  {t.preview}
                </p>

                {/* Badges */}
                <div className="flex items-center gap-1.5 pl-12">
                  {t.aiDraft && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <Sparkles className="h-2.5 w-2.5" />
                      Draft prêt
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset ${
                      CATEGORY_BADGE_CLASSES[cat.color]
                    }`}
                  >
                    <CatIcon className="h-2.5 w-2.5" />
                    {cat.label}
                  </span>
                  {t.starred && (
                    <Star className="ml-auto h-3 w-3 fill-amber-400 text-amber-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== CONVERSATION PANEL ===== */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        {selected ? (
          <ConversationPanel
            ticket={selected}
            workspaceSlug={workspaceSlug}
            workspaceName={workspaceName}
            signature={signature}
            tone={tone}
            onSend={() => markAsSent(selected.id)}
            onToggleStar={() => toggleStar(selected.id)}
          />
        ) : (
          <EmptyConversation />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CONVERSATION PANEL
   ============================================================ */

function ConversationPanel({
  ticket,
  workspaceSlug,
  workspaceName,
  signature,
  tone,
  onSend,
  onToggleStar,
}: {
  ticket: Ticket;
  workspaceSlug: string;
  workspaceName: string;
  signature: string;
  tone: string;
  onSend: () => void;
  onToggleStar: () => void;
}) {
  const [draftBody, setDraftBody] = useState(ticket.aiDraft?.body ?? "");
  const [draftLoading, setDraftLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTone, setActiveTone] = useState<"friendly" | "pro" | "casual">(
    (tone as "friendly" | "pro" | "casual") ?? "friendly"
  );

  const cat = CATEGORY_META[ticket.category];

  async function regenerate() {
    setDraftLoading(true);
    // Appel réel à l'API draft (utilise le draft existant si génération échoue)
    try {
      const res = await fetch("/api/autosav/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug,
          customerEmail: ticket.customerEmail,
          customerName: ticket.customerName,
          subject: ticket.subject,
          body: ticket.body,
        }),
      });
      const data = await res.json();
      if (res.ok && data.draft) {
        setDraftBody(data.draft);
      }
    } catch {
      // silent — on garde le draft actuel
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleSend() {
    setSending(true);
    // Simule l'envoi (pas de vrai SMTP branché pour la démo)
    await new Promise((r) => setTimeout(r, 800));
    onSend();
    setSending(false);
  }

  return (
    <>
      {/* Conversation header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${ticket.avatarGradient} text-[13px] font-bold text-white`}
          >
            {ticket.initials}
          </div>
          <div>
            <div className="text-[14px] font-bold text-neutral-900">
              {ticket.customerName}
            </div>
            <div className="text-[12px] text-neutral-500">
              {ticket.customerEmail}
            </div>
          </div>
          <span
            className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ring-1 ring-inset ${
              CATEGORY_BADGE_CLASSES[cat.color]
            }`}
          >
            <cat.icon className="h-2.5 w-2.5" />
            {cat.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={Star}
            active={ticket.starred}
            onClick={onToggleStar}
            label="Favoris"
          />
          <IconButton icon={Archive} label="Archiver" />
          <IconButton icon={Tag} label="Tags" />
          <IconButton icon={MoreHorizontal} label="Plus" />
        </div>
      </div>

      {/* Scroll content */}
      <div className="flex-1 overflow-y-auto">
        {/* === Email original === */}
        <div className="px-6 py-5">
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11.5px] text-neutral-500">
                <Mail className="h-3 w-3" />
                <span>De {ticket.customerName}</span>
                <span>·</span>
                <span>{formatTimeAgo(ticket.receivedAt)}</span>
              </div>
              {ticket.unread === false && ticket.status === "sent" && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                  <CheckCheck className="h-3 w-3" />
                  Lu et répondu
                </span>
              )}
            </div>
            <h2 className="mt-3 text-[15px] font-bold text-neutral-900">
              {ticket.subject}
            </h2>
            <div className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-neutral-700">
              {ticket.body}
            </div>
          </div>

          {/* === Context commande détecté === */}
          {ticket.orderId && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-200/60 bg-emerald-50/40">
              <div className="flex items-center gap-1.5 border-b border-emerald-100 bg-emerald-100/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-3 w-3" />
                Contexte détecté automatiquement
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 text-[12px] md:grid-cols-4">
                <div>
                  <div className="text-neutral-500">Commande</div>
                  <div className="mt-0.5 font-bold text-emerald-900">
                    {ticket.orderId}
                  </div>
                </div>
                {ticket.orderStatus && (
                  <div>
                    <div className="text-neutral-500">Statut</div>
                    <div className="mt-0.5 flex items-center gap-1 font-bold text-emerald-900">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      {ticket.orderStatus}
                    </div>
                  </div>
                )}
                {ticket.orderEta && (
                  <div>
                    <div className="text-neutral-500">ETA</div>
                    <div className="mt-0.5 font-bold text-emerald-900">
                      {ticket.orderEta}
                    </div>
                  </div>
                )}
                {ticket.orderTracking && (
                  <div>
                    <div className="text-neutral-500">Tracking</div>
                    <div className="mt-0.5 font-mono text-[10.5px] font-bold text-emerald-900">
                      {ticket.orderTracking}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === Draft IA + actions (sticky bottom) === */}
      <div className="shrink-0 border-t border-neutral-200/70 bg-gradient-to-br from-amber-50/30 via-white to-emerald-50/20 px-6 py-4">
        <div className="rounded-2xl border border-emerald-200/60 bg-white shadow-[0_-4px_20px_-8px_rgba(6,95,70,0.1)]">
          {/* Draft header */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-3 w-3" />
              {ticket.aiDraft ? "Draft généré par l'IA" : "Réponse"}
              {ticket.aiDraft && (
                <span className="ml-2 rounded-full bg-emerald-100/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Confiance{" "}
                  {ticket.aiDraft.confidence === "high"
                    ? "élevée"
                    : ticket.aiDraft.confidence === "medium"
                      ? "moyenne"
                      : "faible"}
                </span>
              )}
            </div>
            {/* Tone selector */}
            <div className="flex items-center gap-0.5 rounded-lg bg-neutral-100/70 p-0.5 text-[11px]">
              {(
                [
                  { value: "friendly", label: "Amical" },
                  { value: "pro", label: "Pro" },
                  { value: "casual", label: "Décontracté" },
                ] as const
              ).map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActiveTone(t.value)}
                  className={`rounded-md px-2 py-0.5 transition-colors ${
                    activeTone === t.value
                      ? "bg-emerald-800 font-bold text-amber-100"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={draftBody}
            onChange={(e) => setDraftBody(e.target.value)}
            placeholder={
              ticket.aiDraft
                ? ""
                : "Aucun draft généré. Clique sur 'Générer avec l'IA' pour proposer une réponse."
            }
            rows={6}
            className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-[13px] leading-relaxed text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5">
            <div className="flex items-center gap-1">
              <IconButton icon={Paperclip} label="Pièce jointe" small />
              <IconButton icon={Smile} label="Emoji" small />
              <IconButton icon={Pencil} label="Modèle" small />
              <button
                onClick={regenerate}
                disabled={draftLoading}
                className="ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11.5px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
              >
                {draftLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                {ticket.aiDraft ? "Re-générer" : "Générer avec l'IA"}
              </button>
              {ticket.aiDraft && !draftLoading && (
                <span className="text-[10.5px] text-neutral-400">
                  · {ticket.aiDraft.generatedIn}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-neutral-600 hover:bg-neutral-100">
                Sauvegarder
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !draftBody.trim() || ticket.status === "sent"}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-[0_4px_14px_-2px_rgba(6,95,70,0.4),inset_0_-2px_6px_-2px_rgba(0,0,0,0.2)] hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Envoi…
                  </>
                ) : ticket.status === "sent" ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5" />
                    Envoyé
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================
   COMPOSANTS UTILITAIRES
   ============================================================ */

function IconButton({
  icon: Icon,
  active,
  onClick,
  label,
  small,
}: {
  icon: typeof Star;
  active?: boolean;
  onClick?: () => void;
  label: string;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center rounded-lg transition-colors ${
        small ? "h-7 w-7" : "h-9 w-9"
      } ${
        active
          ? "bg-amber-100 text-amber-700"
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
      }`}
    >
      <Icon
        className={`${small ? "h-3.5 w-3.5" : "h-4 w-4"} ${
          active ? "fill-amber-400 text-amber-500" : ""
        }`}
      />
    </button>
  );
}

function EmptyConversation() {
  return (
    <div className="flex h-full items-center justify-center p-10">
      <div className="max-w-[320px] text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Mail className="h-6 w-6" />
        </div>
        <p className="mt-4 font-display text-[16px] font-extrabold text-neutral-900">
          Sélectionne un ticket
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
          Choisis un ticket dans la liste pour voir la conversation et la
          réponse proposée par l&apos;IA.
        </p>
      </div>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  return `${d} j`;
}
