"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Sparkles,
  Send,
  Mail,
  Filter,
  ChevronDown,
  Star,
  Archive,
  MoreHorizontal,
  Tag,
  Clock,
  Package,
  Truck,
  RotateCw,
  AlertTriangle,
  Check,
  CheckCheck,
  Loader2,
  Pencil,
  Paperclip,
  Smile,
  Plus,
  X,
  StickyNote,
  History,
  User,
  ShoppingBag,
  CheckCircle2,
  Search,
  Inbox as InboxIcon,
  PlayCircle,
  Trash2,
  ArrowLeft,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */

type TicketStatus = "pending" | "drafted" | "sent" | "resolved" | "spam";
type TicketCategory = "order" | "return" | "shipping" | "complaint" | "general";

interface Ticket {
  id: string;
  customerEmail: string;
  customerName: string | null;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  category: TicketCategory;
  starred: boolean;
  unread: boolean;
  snoozeUntil: string | null;
  archivedAt: string | null;
  resolvedAt: string | null;
  orderId: string | null;
  orderStatus: string | null;
  orderEta: string | null;
  orderTracking: string | null;
  receivedAt: string;
  latestReply: {
    draftedBy: string;
    sentBody: string;
    aiModel: string | null;
    sentAt: string;
  } | null;
}

interface TicketDetail extends Ticket {
  replies: Array<{
    id: string;
    draftedBy: string;
    sentBody: string;
    aiModel: string | null;
    sentAt: string;
  }>;
  notes: Array<{
    id: string;
    body: string;
    authorId: string | null;
    createdAt: string;
  }>;
}

interface WcOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  dateCreated: string;
  itemsCount: number;
  firstItem: string | null;
  shippingTracking: string | null;
}

interface CustomerHistory {
  history: Array<{
    id: string;
    subject: string;
    status: string;
    category: string;
    receivedAt: string;
    detectedOrderId: string | null;
  }>;
  stats: {
    total: number;
    resolved: number;
    ordersCount: number;
    firstSeen: string;
  };
  wcOrders?: WcOrder[];
}

/* ============================================================
   CONSTANTES
   ============================================================ */

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

const AVATAR_GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-indigo-400 to-purple-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
  "from-rose-400 to-pink-500",
  "from-yellow-400 to-amber-500",
];

function getAvatarGradient(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} j`;
  const mo = Math.floor(d / 30);
  return `${mo} mois`;
}

/* ============================================================
   INBOX VIEW
   ============================================================ */

interface InboxViewProps {
  workspaceSlug: string;
  workspaceName: string;
  signature: string;
  tone: string;
  kbText: string;
  // Filtre par statut imposé par la page parente (drafts / sent / resolved…)
  // Si undefined = vue "À traiter" par défaut (pending + drafted)
  statusFilter?: TicketStatus | "all" | "active";
  pageTitle?: string;
  emptyState?: { title: string; description: string };
}

export function InboxView({
  workspaceSlug,
  signature,
  tone,
  statusFilter = "active",
  emptyState,
}: InboxViewProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "ai">(
    "all"
  );
  const [searchQ, setSearchQ] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ workspaceSlug });
      if (statusFilter === "active") {
        // active = pending OR drafted (= "À traiter")
        // On fetche all et on filtre côté client (Prisma ne supporte pas OR sur enum facilement ici)
      } else if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (searchQ) params.set("q", searchQ);
      const res = await fetch(`/api/autosav/tickets?${params}`);
      const data = await res.json();
      if (res.ok && data.tickets) {
        let list: Ticket[] = data.tickets;
        // Filtre actif "À traiter" : pending + drafted seulement
        if (statusFilter === "active") {
          list = list.filter(
            (t) => t.status === "pending" || t.status === "drafted"
          );
        }
        setTickets(list);
        if (!selectedId && list.length > 0) setSelectedId(list[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, statusFilter, searchQ, selectedId]);

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceSlug, statusFilter]);

  const filtered = useMemo(() => {
    let list = tickets;
    if (filter === "unread") list = list.filter((t) => t.unread);
    else if (filter === "starred") list = list.filter((t) => t.starred);
    else if (filter === "ai")
      list = list.filter((t) => t.latestReply?.draftedBy === "ai");
    return list;
  }, [tickets, filter]);

  async function patchTicket(id: string, patch: Partial<Ticket>) {
    // Optimistic update
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
    await fetch(`/api/autosav/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceSlug, ...patch }),
    }).catch((e) => console.error("[patchTicket]", e));
  }

  // Empty state — neutre, propose juste de connecter ou composer
  if (!loading && tickets.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-neutral-50/50 p-10">
        <div className="max-w-[440px] text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            {statusFilter === "resolved" ? (
              <CheckCircle2 className="h-7 w-7" />
            ) : statusFilter === "spam" ? (
              <Trash2 className="h-7 w-7" />
            ) : (
              <InboxIcon className="h-7 w-7" />
            )}
          </div>
          <h2 className="mt-5 font-display text-[20px] font-extrabold tracking-tight text-neutral-900">
            {emptyState?.title ?? "Aucun ticket pour le moment"}
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-neutral-500">
            {emptyState?.description ??
              "Connecte ta boîte mail (Gmail, Outlook, IONOS) ou ta boutique pour que les messages clients arrivent automatiquement ici."}
          </p>
          {statusFilter === "active" && (
            <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <a
                href={`/autosav/w/${workspaceSlug}/integrations`}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-[13px] font-bold text-amber-200 hover:bg-emerald-900"
              >
                <Sparkles className="h-4 w-4" /> Connecter une boîte mail
              </a>
              <button
                onClick={() => setComposeOpen(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-[13px] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                <Plus className="h-4 w-4" /> Composer un ticket
              </button>
            </div>
          )}
        </div>
        {composeOpen && (
          <ComposeModal
            workspaceSlug={workspaceSlug}
            onClose={() => setComposeOpen(false)}
            onCreated={() => {
              setComposeOpen(false);
              fetchTickets();
            }}
          />
        )}
      </div>
    );
  }

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  return (
    <div className="flex h-full">
      {/* ===== TICKET LIST (380px) ===== */}
      <div
        className={`${selected ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col border-r border-neutral-200/70 bg-white md:w-[360px]`}
      >
        {/* Top : search + compose */}
        <div className="flex shrink-0 items-center gap-2 border-b border-neutral-200/70 px-4 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-neutral-100/70 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchTickets();
              }}
              placeholder="Rechercher…"
              className="flex-1 bg-transparent text-[13px] text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setComposeOpen(true)}
            title="Composer un ticket"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-amber-200 hover:bg-emerald-900"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

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
                count: tickets.filter((t) => t.latestReply?.draftedBy === "ai")
                  .length,
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
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && tickets.length === 0 && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            </div>
          )}
          {!loading && filtered.length === 0 && tickets.length > 0 && (
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
          {filtered.map((t) => (
            <TicketListItem
              key={t.id}
              ticket={t}
              isSelected={t.id === selectedId}
              onClick={() => setSelectedId(t.id)}
            />
          ))}
        </div>
      </div>

      {/* ===== CONVERSATION + CUSTOMER PANEL ===== */}
      {selected ? (
        <ConversationView
          ticketId={selected.id}
          workspaceSlug={workspaceSlug}
          signature={signature}
          tone={tone}
          onBack={() => setSelectedId(null)}
          onUpdate={(patch) => patchTicket(selected.id, patch)}
        />
      ) : (
        <div className="hidden flex-1 md:flex">
          <EmptyConversation />
        </div>
      )}

      {composeOpen && (
        <ComposeModal
          workspaceSlug={workspaceSlug}
          onClose={() => setComposeOpen(false)}
          onCreated={() => {
            setComposeOpen(false);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   TICKET LIST ITEM
   ============================================================ */

function TicketListItem({
  ticket: t,
  isSelected,
  onClick,
}: {
  ticket: Ticket;
  isSelected: boolean;
  onClick: () => void;
}) {
  const cat = CATEGORY_META[t.category];
  const CatIcon = cat.icon;
  const gradient = getAvatarGradient(t.customerEmail);
  const initials = getInitials(t.customerName, t.customerEmail);
  const preview = t.body.replace(/\n+/g, " ").slice(0, 120);

  return (
    <button
      onClick={onClick}
      className={`relative flex w-full flex-col gap-1.5 border-b border-neutral-100 px-4 py-3 text-left transition-colors ${
        isSelected ? "bg-emerald-50/40" : "hover:bg-neutral-50"
      }`}
    >
      {isSelected && (
        <div className="absolute inset-y-0 left-0 w-0.5 bg-emerald-700" />
      )}
      <div className="flex items-start gap-2.5">
        <div className="relative shrink-0">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[12px] font-bold text-white`}
          >
            {initials}
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
              {t.customerName ?? t.customerEmail}
            </span>
            <span className="shrink-0 text-[11px] text-neutral-400">
              {formatTimeAgo(t.receivedAt)}
            </span>
          </div>
          <div
            className={`mt-0.5 truncate text-[12.5px] ${
              t.unread ? "font-bold text-neutral-900" : "text-neutral-700"
            }`}
          >
            {t.subject}
          </div>
        </div>
      </div>
      <p className="line-clamp-2 pl-12 text-[11.5px] leading-relaxed text-neutral-500">
        {preview}
      </p>
      <div className="flex items-center gap-1.5 pl-12">
        {t.latestReply?.draftedBy === "ai" && t.status === "drafted" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <Sparkles className="h-2.5 w-2.5" />
            Draft IA
          </span>
        )}
        {t.status === "sent" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
            <CheckCheck className="h-2.5 w-2.5" />
            Envoyé
          </span>
        )}
        {t.status === "resolved" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
            <Check className="h-2.5 w-2.5" />
            Résolu
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
}

/* ============================================================
   CONVERSATION VIEW (right panel + customer side)
   ============================================================ */

function ConversationView({
  ticketId,
  workspaceSlug,
  signature,
  tone,
  onUpdate,
  onBack,
}: {
  ticketId: string;
  workspaceSlug: string;
  signature: string;
  tone: string;
  onUpdate: (patch: Partial<Ticket>) => void;
  onBack?: () => void;
}) {
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [customer, setCustomer] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCustomer, setShowCustomer] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    setCustomer(null);
    // 1. Charge le ticket principal — rapide, doit jamais bloquer
    fetch(`/api/autosav/tickets/${ticketId}?workspaceSlug=${workspaceSlug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ticket) {
          setDetail(d.ticket);
          setCustomer({
            history: d.customerHistory ?? [],
            stats: d.customerStats ?? {
              total: 1,
              resolved: 0,
              ordersCount: 0,
              firstSeen: d.ticket.receivedAt,
            },
            wcOrders: [],
          });
        }
      })
      .finally(() => setLoading(false));

    // 2. Charge les commandes WooCommerce en parallèle — peut être lent / fail-soft
    fetch(
      `/api/autosav/tickets/${ticketId}/wc-orders?workspaceSlug=${workspaceSlug}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.wcOrders) && d.wcOrders.length > 0) {
          setCustomer((prev) =>
            prev ? { ...prev, wcOrders: d.wcOrders } : prev
          );
        }
      })
      .catch(() => {
        /* silencieux : pas de commandes WC, pas grave */
      });
  }, [ticketId, workspaceSlug]);

  if (loading || !detail || !customer) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden bg-white">
        <ConversationPanel
          ticket={detail}
          workspaceSlug={workspaceSlug}
          signature={signature}
          tone={tone}
          onBack={onBack}
          onUpdate={onUpdate}
          onSentReply={(reply) => {
            setDetail((d) =>
              d ? { ...d, replies: [...d.replies, reply], status: "sent" } : d
            );
          }}
          onNoteAdded={(note) => {
            setDetail((d) =>
              d ? { ...d, notes: [...d.notes, note] } : d
            );
          }}
          onToggleCustomer={() => setShowCustomer((s) => !s)}
          customerVisible={showCustomer}
        />
      </div>

      {/* Customer info panel (3rd column) */}
      {showCustomer && (
        <CustomerPanel
          ticket={detail}
          history={customer.history}
          stats={customer.stats}
          wcOrders={customer.wcOrders ?? []}
          onClose={() => setShowCustomer(false)}
        />
      )}
    </>
  );
}

/* ============================================================
   CONVERSATION PANEL (center)
   ============================================================ */

function ConversationPanel({
  ticket,
  workspaceSlug,
  signature,
  tone,
  onUpdate,
  onSentReply,
  onNoteAdded,
  onToggleCustomer,
  customerVisible,
  onBack,
}: {
  ticket: TicketDetail;
  workspaceSlug: string;
  signature: string;
  tone: string;
  onUpdate: (patch: Partial<Ticket>) => void;
  onSentReply: (reply: TicketDetail["replies"][number]) => void;
  onNoteAdded: (note: TicketDetail["notes"][number]) => void;
  onToggleCustomer: () => void;
  customerVisible: boolean;
  onBack?: () => void;
}) {
  const cat = CATEGORY_META[ticket.category];
  const gradient = getAvatarGradient(ticket.customerEmail);
  const initials = getInitials(ticket.customerName, ticket.customerEmail);

  // Draft IA actuel (dernier reply 'ai')
  const lastAiDraft = [...ticket.replies]
    .reverse()
    .find((r) => r.draftedBy === "ai");
  const [draftBody, setDraftBody] = useState(lastAiDraft?.sentBody ?? "");
  const [activeTone, setActiveTone] = useState<"friendly" | "pro" | "casual">(
    (tone as "friendly" | "pro" | "casual") ?? "friendly"
  );
  const [draftLoading, setDraftLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Note interne
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const [noteSending, setNoteSending] = useState(false);

  useEffect(() => {
    const last = [...ticket.replies].reverse().find((r) => r.draftedBy === "ai");
    setDraftBody(last?.sentBody ?? "");
  }, [ticket.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function regenerate() {
    setDraftLoading(true);
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
    } finally {
      setDraftLoading(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      const res = await fetch(`/api/autosav/tickets/${ticket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug,
          body: draftBody,
          sendNow: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        onSentReply(data.reply);
        onUpdate({ status: "sent" });
      }
    } finally {
      setSending(false);
    }
  }

  async function addNote() {
    if (!noteBody.trim()) return;
    setNoteSending(true);
    try {
      const res = await fetch(`/api/autosav/tickets/${ticket.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug, body: noteBody }),
      });
      const data = await res.json();
      if (res.ok && data.note) {
        onNoteAdded(data.note);
        setNoteBody("");
        setNoteOpen(false);
      }
    } finally {
      setNoteSending(false);
    }
  }

  function toggleStar() {
    onUpdate({ starred: !ticket.starred });
  }

  function archive() {
    onUpdate({ archivedAt: new Date().toISOString() });
  }

  function markResolved() {
    onUpdate({ status: "resolved" });
  }

  function snooze(hours: number) {
    const until = new Date(Date.now() + hours * 3600 * 1000).toISOString();
    onUpdate({ snoozeUntil: until });
  }

  return (
    <>
      {/* Conversation header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/70 px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 md:hidden"
              aria-label="Retour à la liste"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[12.5px] font-bold text-white sm:h-10 sm:w-10`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-bold text-neutral-900 sm:text-[14px]">
              {ticket.customerName ?? ticket.customerEmail}
            </div>
            <div className="truncate text-[11.5px] text-neutral-500 sm:text-[12px]">
              {ticket.customerEmail}
            </div>
          </div>
          <span
            className={`ml-2 hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ring-1 ring-inset md:inline-flex ${
              CATEGORY_BADGE_CLASSES[cat.color]
            }`}
          >
            <cat.icon className="h-2.5 w-2.5" />
            {cat.label}
          </span>
          {ticket.snoozeUntil && new Date(ticket.snoozeUntil) > new Date() && (
            <span className="hidden items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-700 md:inline-flex">
              <Clock className="h-2.5 w-2.5" />
              Snooze
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            icon={Star}
            active={ticket.starred}
            onClick={toggleStar}
            label="Favoris"
          />
          <SnoozeMenu onSnooze={snooze} />
          <IconButton
            icon={CheckCircle2}
            onClick={markResolved}
            label="Marquer résolu"
            disabled={ticket.status === "resolved"}
          />
          <IconButton icon={Archive} onClick={archive} label="Archiver" />
          <IconButton
            icon={User}
            active={customerVisible}
            onClick={onToggleCustomer}
            label="Profil client"
          />
        </div>
      </div>

      {/* Scroll content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5">
          {/* Email original */}
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11.5px] text-neutral-500">
                <Mail className="h-3 w-3" />
                <span>De {ticket.customerName ?? ticket.customerEmail}</span>
                <span>·</span>
                <span>{formatTimeAgo(ticket.receivedAt)}</span>
              </div>
            </div>
            <h2 className="mt-3 text-[15px] font-bold text-neutral-900">
              {ticket.subject}
            </h2>
            <div className="mt-3 whitespace-pre-wrap text-[13.5px] leading-relaxed text-neutral-700">
              {ticket.body}
            </div>
          </div>

          {/* Order context */}
          {ticket.orderId && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-200/60 bg-emerald-50/40">
              <div className="flex items-center gap-1.5 border-b border-emerald-100 bg-emerald-100/40 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-3 w-3" />
                Contexte commande détecté
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4 text-[12px] md:grid-cols-4">
                <Field label="Commande" value={ticket.orderId} />
                {ticket.orderStatus && (
                  <Field
                    label="Statut"
                    value={
                      <span className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        {ticket.orderStatus}
                      </span>
                    }
                  />
                )}
                {ticket.orderEta && (
                  <Field label="ETA" value={ticket.orderEta} />
                )}
                {ticket.orderTracking && (
                  <Field
                    label="Tracking"
                    value={
                      <span className="font-mono text-[10.5px]">
                        {ticket.orderTracking}
                      </span>
                    }
                  />
                )}
              </div>
            </div>
          )}

          {/* Sent replies thread */}
          {ticket.replies
            .filter((r) => r.draftedBy !== "ai" || ticket.status === "sent")
            .map((r) => (
              <div
                key={r.id}
                className="mt-4 ml-8 rounded-2xl border border-neutral-200/70 bg-emerald-50/30 p-5"
              >
                <div className="flex items-center gap-2 text-[11.5px] text-emerald-700">
                  <CheckCheck className="h-3 w-3" />
                  <span className="font-bold">Réponse envoyée</span>
                  <span>·</span>
                  <span>{formatTimeAgo(r.sentAt)}</span>
                </div>
                <div className="mt-3 whitespace-pre-wrap text-[13px] leading-relaxed text-neutral-700">
                  {r.sentBody}
                </div>
              </div>
            ))}

          {/* Internal notes */}
          {ticket.notes.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                <StickyNote className="h-3 w-3" />
                Notes internes ({ticket.notes.length})
              </div>
              <div className="space-y-2">
                {ticket.notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 text-[12.5px] text-amber-900"
                  >
                    <div className="whitespace-pre-wrap">{n.body}</div>
                    <div className="mt-1 text-[10.5px] text-amber-700/70">
                      {formatTimeAgo(n.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draft IA + actions (sticky bottom) */}
      <div className="shrink-0 border-t border-neutral-200/70 bg-gradient-to-br from-amber-50/30 via-white to-emerald-50/20 px-6 py-4">
        {noteOpen ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-amber-800">
                <StickyNote className="h-3 w-3" />
                Note interne (équipe only)
              </div>
              <button
                onClick={() => setNoteOpen(false)}
                className="rounded-md p-1 text-amber-700 hover:bg-amber-100/60"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              placeholder="Note visible uniquement par l'équipe…"
              rows={3}
              autoFocus
              className="mt-3 block w-full resize-none rounded-lg border border-amber-200 bg-white px-3 py-2 text-[13px] text-amber-950 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button
                onClick={() => setNoteOpen(false)}
                className="rounded-lg px-3 py-1.5 text-[12px] font-medium text-amber-700 hover:bg-amber-100/60"
              >
                Annuler
              </button>
              <button
                onClick={addNote}
                disabled={noteSending || !noteBody.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {noteSending && <Loader2 className="h-3 w-3 animate-spin" />}
                Ajouter la note
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200/60 bg-white shadow-[0_-4px_20px_-8px_rgba(6,95,70,0.1)]">
            <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5">
              <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-emerald-700">
                <Sparkles className="h-3 w-3" />
                {lastAiDraft ? "Draft IA" : "Réponse"}
              </div>
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

            <textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              placeholder="Clique sur 'Générer avec l'IA' pour proposer une réponse, ou rédige toi-même."
              rows={6}
              className="block w-full resize-none border-0 bg-transparent px-4 py-3 text-[13px] leading-relaxed text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
            />

            <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-2.5">
              <div className="flex items-center gap-1">
                <IconButton icon={Paperclip} label="Pièce jointe" small />
                <IconButton icon={Smile} label="Emoji" small />
                <IconButton icon={Pencil} label="Modèle" small />
                <button
                  onClick={() => setNoteOpen(true)}
                  className="ml-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-amber-700 hover:bg-amber-50"
                >
                  <StickyNote className="h-3 w-3" />
                  Note interne
                </button>
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
                  {lastAiDraft ? "Re-générer" : "Générer avec l'IA"}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSend}
                  disabled={
                    sending || !draftBody.trim() || ticket.status === "sent"
                  }
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
        )}
      </div>
    </>
  );
}

/* ============================================================
   CUSTOMER INFO PANEL (3rd column)
   ============================================================ */

function CustomerPanel({
  ticket,
  history,
  stats,
  wcOrders,
  onClose,
}: {
  ticket: TicketDetail;
  history: CustomerHistory["history"];
  stats: CustomerHistory["stats"];
  wcOrders: WcOrder[];
  onClose: () => void;
}) {
  const gradient = getAvatarGradient(ticket.customerEmail);
  const initials = getInitials(ticket.customerName, ticket.customerEmail);
  const totalWcOrders = wcOrders.length;
  const totalWcSpent = wcOrders.reduce(
    (sum, o) => sum + parseFloat(o.total || "0"),
    0
  );
  const wcCurrency = wcOrders[0]?.currency ?? "EUR";

  return (
    <aside className="hidden w-[300px] shrink-0 flex-col overflow-y-auto border-l border-neutral-200/70 bg-neutral-50/40 lg:flex">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200/70 bg-white px-5 py-3">
        <div className="text-[12px] font-bold uppercase tracking-wider text-neutral-500">
          Profil client
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Customer card */}
      <div className="border-b border-neutral-200/70 bg-white p-5 text-center">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-[15px] font-bold text-white`}
        >
          {initials}
        </div>
        <div className="mt-3 text-[14.5px] font-bold text-neutral-900">
          {ticket.customerName ?? "Client"}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-neutral-500">
          {ticket.customerEmail}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-px border-b border-neutral-200/70 bg-neutral-200/70">
        <StatCell label="Tickets" value={stats.total} />
        <StatCell label="Résolus" value={stats.resolved} />
        <StatCell label="Commandes" value={stats.ordersCount} />
      </div>

      {/* First seen */}
      <div className="border-b border-neutral-200/70 bg-white px-5 py-3">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-400">
          Client depuis
        </div>
        <div className="mt-0.5 text-[12.5px] font-medium text-neutral-700">
          {new Date(stats.firstSeen).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Commandes WooCommerce */}
      {totalWcOrders > 0 && (
        <div className="border-b border-neutral-200/70 bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <ShoppingBag className="h-3 w-3" />
              Commandes WooCommerce
            </div>
            <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-inset ring-emerald-200/50">
              {totalWcOrders}
            </span>
          </div>
          <div className="mt-2 text-[11.5px] text-neutral-500">
            Total dépensé : {" "}
            <span className="font-bold text-neutral-800">
              {totalWcSpent.toFixed(2)} {wcCurrency}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {wcOrders.map((o) => (
              <WcOrderCard key={o.id} order={o} />
            ))}
          </ul>
        </div>
      )}

      {/* History */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          <History className="h-3 w-3" />
          Historique
        </div>
        {history.length === 0 && (
          <p className="mt-3 text-[12px] text-neutral-400">
            Premier contact avec ce client.
          </p>
        )}
        <ul className="mt-3 space-y-2">
          {history.map((h) => {
            const cat = CATEGORY_META[h.category as TicketCategory];
            return (
              <li
                key={h.id}
                className="rounded-xl border border-neutral-200/70 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] font-bold text-neutral-900">
                    {h.subject}
                  </span>
                  <span className="shrink-0 text-[10.5px] text-neutral-400">
                    {formatTimeAgo(h.receivedAt)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase ring-1 ring-inset ${
                      CATEGORY_BADGE_CLASSES[cat?.color ?? "neutral"]
                    }`}
                  >
                    {cat?.label ?? h.category}
                  </span>
                  <span
                    className={`text-[10.5px] ${
                      h.status === "resolved"
                        ? "text-emerald-600"
                        : "text-neutral-500"
                    }`}
                  >
                    {h.status === "resolved" ? "Résolu" : h.status}
                  </span>
                  {h.detectedOrderId && (
                    <span className="ml-auto font-mono text-[10px] text-neutral-400">
                      {h.detectedOrderId}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

/* ============================================================
   COMPOSE MODAL
   ============================================================ */

function ComposeModal({
  workspaceSlug,
  onClose,
  onCreated,
}: {
  workspaceSlug: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<TicketCategory>("general");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/autosav/tickets/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug,
          customerEmail,
          customerName: customerName || undefined,
          subject,
          body,
          category,
        }),
      });
      if (res.ok) onCreated();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-display text-[18px] font-extrabold tracking-tight text-neutral-900">
            Composer un nouveau ticket
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3 p-6">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Email du client"
              className="h-10 rounded-lg border border-neutral-200 px-3 text-[14px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nom (optionnel)"
              className="h-10 rounded-lg border border-neutral-200 px-3 text-[14px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Objet du ticket"
            className="block h-10 w-full rounded-lg border border-neutral-200 px-3 text-[14px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory)}
            className="block h-10 w-full rounded-lg border border-neutral-200 px-3 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="general">Question générale</option>
            <option value="order">Suivi colis</option>
            <option value="return">Retour</option>
            <option value="shipping">Livraison</option>
            <option value="complaint">Réclamation</option>
          </select>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message du client / contexte…"
            rows={6}
            className="block w-full rounded-lg border border-neutral-200 px-3 py-2 text-[13px] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-neutral-100 bg-neutral-50/40 px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-[13px] font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={
              loading || !customerEmail || !subject || !body || !body.includes
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-800 px-4 py-2 text-[13px] font-bold text-white hover:bg-emerald-900 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Créer le ticket
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function SnoozeMenu({ onSnooze }: { onSnooze: (hours: number) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <IconButton
        icon={Clock}
        onClick={() => setOpen((o) => !o)}
        label="Snooze"
      />
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]">
            {[
              { hours: 4, label: "4 heures" },
              { hours: 24, label: "Demain" },
              { hours: 24 * 3, label: "Dans 3 jours" },
              { hours: 24 * 7, label: "Semaine prochaine" },
            ].map((opt) => (
              <button
                key={opt.hours}
                onClick={() => {
                  onSnooze(opt.hours);
                  setOpen(false);
                }}
                className="block w-full px-3 py-2 text-left text-[12.5px] text-neutral-700 hover:bg-neutral-100"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function IconButton({
  icon: Icon,
  active,
  onClick,
  label,
  small,
  disabled,
}: {
  icon: typeof Star;
  active?: boolean;
  onClick?: () => void;
  label: string;
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
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

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-neutral-500">{label}</div>
      <div className="mt-0.5 font-bold text-emerald-900">{value}</div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white px-3 py-3 text-center">
      <div className="font-display text-[18px] font-extrabold text-emerald-900">
        {value}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">
        {label}
      </div>
    </div>
  );
}

/* WooCommerce statuses mappés en français + couleur */
const WC_STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente paiement", color: "amber" },
  processing: { label: "En cours", color: "blue" },
  "on-hold": { label: "En attente", color: "amber" },
  completed: { label: "Livré", color: "emerald" },
  cancelled: { label: "Annulé", color: "neutral" },
  refunded: { label: "Remboursé", color: "rose" },
  failed: { label: "Échec paiement", color: "rose" },
};

function WcOrderCard({ order }: { order: WcOrder }) {
  const meta =
    WC_STATUS_META[order.status] ?? { label: order.status, color: "neutral" };
  return (
    <li className="rounded-xl border border-neutral-200/70 bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11.5px] font-bold text-neutral-900">
          #{order.number}
        </span>
        <span className="text-[10.5px] text-neutral-400">
          {new Date(order.dateCreated).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
      {order.firstItem && (
        <div className="mt-1 truncate text-[11.5px] text-neutral-700">
          {order.firstItem}
          {order.itemsCount > 1 && (
            <span className="text-neutral-400">
              {" "}
              + {order.itemsCount - 1} article
              {order.itemsCount - 1 > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold uppercase ring-1 ring-inset ${
            CATEGORY_BADGE_CLASSES[meta.color] ?? CATEGORY_BADGE_CLASSES.neutral
          }`}
        >
          {meta.label}
        </span>
        <span className="text-[11px] font-bold text-neutral-900">
          {parseFloat(order.total).toFixed(2)} {order.currency}
        </span>
      </div>
      {order.shippingTracking && (
        <div className="mt-2 truncate rounded-md bg-neutral-50 px-2 py-1 font-mono text-[10.5px] text-neutral-600">
          <Truck className="mr-1 inline h-3 w-3 text-neutral-400" />
          {order.shippingTracking}
        </div>
      )}
    </li>
  );
}

function EmptyConversation() {
  return (
    <div className="flex flex-1 items-center justify-center bg-white p-10">
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
