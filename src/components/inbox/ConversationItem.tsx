"use client";

import Image from "next/image";
import { Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/format-time";
import type { ConversationSummary } from "@/lib/types/messaging";

export function ConversationItem({
  conversation,
  active,
  onClick,
}: {
  conversation: ConversationSummary;
  active: boolean;
  onClick: () => void;
}) {
  const isSupport = conversation.type === "support";
  const title = isSupport
    ? "Support Sourcey"
    : conversation.agentName ?? "Agent";
  const subtitle = isSupport
    ? "Équipe Sourcey · Réponse < 2h"
    : `Agent · ${conversation.agentCity ?? "Chine"}`;

  return (
    <button
      type="button"
      onClick={onClick}
      role="listitem"
      aria-selected={active}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors",
        "hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        active && "bg-primary-50/80 border-primary-100 hover:bg-primary-50"
      )}
    >
      <Avatar conversation={conversation} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-[14.5px] font-semibold",
              active ? "text-primary-900" : "text-neutral-900"
            )}
          >
            {title}
          </p>
          <span className="shrink-0 text-[11px] font-medium text-neutral-500">
            {formatRelative(conversation.lastMessageAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-neutral-500">
          {subtitle}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-[13px] text-neutral-600">
            {conversation.lastMessagePreview ?? "—"}
          </p>
          {conversation.unreadByUser > 0 && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary-600 px-1.5 text-[10px] font-bold text-white">
              {conversation.unreadByUser > 9 ? "9+" : conversation.unreadByUser}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function Avatar({ conversation }: { conversation: ConversationSummary }) {
  if (conversation.type === "support") {
    return (
      <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-sm">
        <Headphones className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-neutral-100">
      {conversation.agentAvatarUrl ? (
        <Image
          src={conversation.agentAvatarUrl}
          alt={conversation.agentName ?? ""}
          width={44}
          height={44}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center text-sm font-bold text-neutral-400">
          {conversation.agentName?.[0] ?? "?"}
        </div>
      )}
    </div>
  );
}
