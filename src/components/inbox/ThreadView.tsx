"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Headphones,
  MapPin,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";
import { formatDaySeparator } from "@/lib/format-time";
import { useSuggestions } from "@/hooks/use-suggestions";
import { ProductContextBanner } from "./ProductContextBanner";
import type {
  ConversationDetail,
  MessageDTO,
  ProductContext,
} from "@/lib/types/messaging";
import type { Attachment } from "@/lib/attachments";

interface ThreadMessage extends MessageDTO {
  pending?: boolean;
  failed?: boolean;
}

interface Props {
  conversation: ConversationDetail | null;
  messages: ThreadMessage[];
  productContext?: ProductContext | null;
  loading: boolean;
  sending: boolean;
  onSend: (content: string, attachments?: Attachment[]) => Promise<void>;
  onBack?: () => void;
  className?: string;
}

export function ThreadView({
  conversation,
  messages,
  productContext,
  loading,
  sending,
  onSend,
  onBack,
  className,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages[messages.length - 1]?.id;
  const [translateActive, setTranslateActive] = useState(false);

  const { suggestions, loading: suggestionsLoading, clear: clearSuggestions } =
    useSuggestions(conversation?.id ?? null, messages.length);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lastMessageId, conversation?.id]);

  if (!conversation && !loading) {
    return (
      <section
        className={cn(
          "flex h-full flex-col items-center justify-center bg-neutral-50/60 px-6 text-center",
          className
        )}
      >
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white border border-neutral-200 text-neutral-400">
          <Headphones className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-neutral-900">
          Sélectionne une conversation
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">
          Choisis un fil dans la liste à gauche, ou démarres-en un nouveau avec
          Support ou l'un de tes agents.
        </p>
      </section>
    );
  }

  const grouped = groupMessages(messages);
  const lastUserMsg = [...messages].reverse().find((m) => m.senderType === "user");
  const isAgentConv = conversation?.type === "agent";

  return (
    <section
      className={cn("flex h-full flex-col bg-neutral-50/60", className)}
      aria-label="Conversation"
    >
      <header className="flex items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Retour à la liste"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <HeaderAvatar conversation={conversation} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold text-neutral-900">
            {conversation?.type === "support"
              ? "Support Sourcey"
              : conversation?.agentName ?? "Agent"}
          </p>
          <p className="flex items-center gap-1.5 truncate text-[12px] text-neutral-500">
            {conversation?.type === "support" ? (
              <>
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                En ligne · réponse sous 2h
              </>
            ) : (
              <>
                <MapPin className="h-3 w-3" />
                {conversation?.agentCity ?? "Chine"} · FR · ZH
              </>
            )}
          </p>
        </div>

        {isAgentConv && (
          <button
            type="button"
            onClick={() => setTranslateActive((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
              translateActive
                ? "border-primary-300 bg-primary-50 text-primary-700 shadow-sm"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
            )}
            aria-pressed={translateActive}
            aria-label="Activer la traduction FR ↔ ZH"
            title="Traduction FR ↔ ZH"
          >
            <Languages className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {translateActive ? "FR ↔ ZH actif" : "Traduire"}
            </span>
            {translateActive && (
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
            )}
          </button>
        )}
      </header>

      {productContext && <ProductContextBanner context={productContext} />}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-3 md:px-6"
        role="log"
        aria-live="polite"
      >
        {loading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {grouped.map((item) =>
              item.kind === "separator" ? (
                <div
                  key={item.key}
                  className="my-4 flex items-center justify-center"
                >
                  <span className="rounded-full bg-white border border-neutral-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    {item.label}
                  </span>
                </div>
              ) : (
                <MessageBubble
                  key={item.message.id}
                  id={item.message.id}
                  senderType={item.message.senderType}
                  content={item.message.content}
                  createdAt={item.message.createdAt}
                  attachments={item.message.attachments}
                  agentName={conversation?.agentName ?? null}
                  agentAvatarUrl={conversation?.agentAvatarUrl ?? null}
                  pending={item.message.pending}
                  failed={item.message.failed}
                  read={!!item.message.readByCounterpartAt}
                  consecutive={item.consecutive}
                  showReceipt={item.message.id === lastUserMsg?.id}
                  translateActive={translateActive}
                />
              )
            )}
          </AnimatePresence>
        )}
      </div>

      <Composer
        onSend={onSend}
        sending={sending}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        onUseSuggestion={clearSuggestions}
        placeholder={
          conversation?.type === "support"
            ? "Écris à l'équipe Sourcey…"
            : `Écris à ${conversation?.agentName ?? "ton agent"}…`
        }
      />
    </section>
  );
}

function HeaderAvatar({
  conversation,
}: {
  conversation: ConversationDetail | null;
}) {
  if (!conversation) return null;
  if (conversation.type === "support") {
    return (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-sm">
        <Headphones className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-100">
      {conversation.agentAvatarUrl ? (
        <Image
          src={conversation.agentAvatarUrl}
          alt={conversation.agentName ?? ""}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      ) : null}
    </div>
  );
}

type Grouped =
  | { kind: "separator"; key: string; label: string }
  | { kind: "message"; message: ThreadMessage; consecutive: boolean };

function groupMessages(messages: ThreadMessage[]): Grouped[] {
  const out: Grouped[] = [];
  let prev: ThreadMessage | null = null;
  let lastSepKey: string | null = null;

  for (const m of messages) {
    const date = new Date(m.createdAt);
    const dayKey = date.toISOString().slice(0, 10);
    if (dayKey !== lastSepKey) {
      out.push({
        kind: "separator",
        key: `sep-${dayKey}`,
        label: formatDaySeparator(date),
      });
      lastSepKey = dayKey;
      prev = null;
    }
    const consecutive =
      !!prev &&
      prev.senderType === m.senderType &&
      new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() <
        1000 * 60 * 3;
    out.push({ kind: "message", message: m, consecutive });
    prev = m;
  }

  return out;
}
