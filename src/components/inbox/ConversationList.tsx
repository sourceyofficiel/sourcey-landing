"use client";

import { motion, AnimatePresence } from "motion/react";
import { Inbox, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConversationItem } from "./ConversationItem";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/lib/types/messaging";

interface Props {
  conversations: ConversationSummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew?: () => void;
  filter: "all" | "agent" | "support";
  onFilterChange: (f: "all" | "agent" | "support") => void;
  className?: string;
}

const FILTERS = [
  { value: "all", label: "Tous" },
  { value: "agent", label: "Agents" },
  { value: "support", label: "Support" },
] as const;

export function ConversationList({
  conversations,
  activeId,
  loading,
  onSelect,
  onNew,
  filter,
  onFilterChange,
  className,
}: Props) {
  const filtered =
    filter === "all"
      ? conversations
      : conversations.filter((c) => c.type === filter);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + c.unreadByUser,
    0
  );

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-neutral-200 bg-white",
        className
      )}
      aria-label="Liste des conversations"
    >
      <header className="border-b border-neutral-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-primary-600" />
            <h1 className="text-[15px] font-extrabold text-neutral-900">
              Messagerie
            </h1>
            {totalUnread > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
                {totalUnread}
              </span>
            )}
          </div>
          {onNew && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onNew}
              aria-label="Nouvelle conversation"
              className="text-neutral-600 hover:text-primary-700"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div
          role="tablist"
          className="mt-3 inline-flex w-full items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100/60 p-1"
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => onFilterChange(f.value)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors",
                  active
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        {loading && conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyListState onNew={onNew} />
        ) : (
          <ul role="list" className="flex flex-col gap-1">
            <AnimatePresence>
              {filtered.map((c) => (
                <motion.li
                  key={c.id}
                  layout
                >
                  <ConversationItem
                    conversation={c}
                    active={c.id === activeId}
                    onClick={() => onSelect(c.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </aside>
  );
}

function EmptyListState({ onNew }: { onNew?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-100 text-neutral-400">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="text-sm font-semibold text-neutral-700">
        Pas encore de conversation
      </p>
      <p className="text-xs text-neutral-500">
        Démarre-en une avec Support ou un agent.
      </p>
      {onNew && (
        <Button type="button" variant="primary" size="sm" onClick={onNew}>
          <MessageSquarePlus className="h-4 w-4" />
          Nouvelle
        </Button>
      )}
    </div>
  );
}
