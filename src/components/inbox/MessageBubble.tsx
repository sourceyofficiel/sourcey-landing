"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  Headphones,
  Languages,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { formatHourMinute } from "@/lib/format-time";
import { parseAttachments } from "@/lib/attachments";
import { AnnotatedImage } from "./AnnotatedImage";

export interface MessageBubbleProps {
  id: string;
  senderType: "user" | "agent" | "support" | "system";
  content: string;
  createdAt: string;
  attachments?: string | null;
  agentName?: string | null;
  agentAvatarUrl?: string | null;
  pending?: boolean;
  failed?: boolean;
  read?: boolean;
  /** true if the previous message in the thread has the same sender */
  consecutive?: boolean;
  /** true if this is the latest user message — used to show read receipt */
  showReceipt?: boolean;
  /** true to fetch + display a Chinese translation under the original */
  translateActive?: boolean;
}

export function MessageBubble({
  id,
  senderType,
  content,
  createdAt,
  attachments,
  agentName,
  agentAvatarUrl,
  pending,
  failed,
  read,
  consecutive,
  showReceipt,
  translateActive,
}: MessageBubbleProps) {
  if (senderType === "system") {
    return (
      <div className="my-2 flex items-center justify-center">
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium italic text-neutral-500">
          {content}
        </span>
      </div>
    );
  }

  const isMe = senderType === "user";
  const parsedAttachments = parseAttachments(attachments);

  return (
    <motion.div
      className={cn(
        "flex w-full items-end gap-2",
        isMe ? "flex-row-reverse" : "flex-row",
        consecutive ? "mt-1" : "mt-3"
      )}
    >
      <div className="w-8 shrink-0">
        {!consecutive && !isMe && (
          <CounterpartAvatar
            senderType={senderType}
            agentName={agentName}
            agentAvatarUrl={agentAvatarUrl}
          />
        )}
      </div>

      <div
        className={cn("flex max-w-[78%] flex-col", isMe ? "items-end" : "items-start")}
      >
        {!consecutive && !isMe && (
          <p className="mb-1 ml-1 text-[11px] font-semibold text-neutral-500">
            {senderType === "support" ? "Support Sourcey" : agentName ?? "Agent"}
          </p>
        )}

        {parsedAttachments.length > 0 && (
          <div className="mb-1.5 flex flex-wrap gap-2">
            {parsedAttachments.map((att, i) => (
              <AnnotatedImage key={i} attachment={att} />
            ))}
          </div>
        )}

        {content && (
          <div
            className={cn(
              "rounded-2xl px-3.5 py-2 text-[14.5px] leading-relaxed",
              isMe
                ? "bg-primary-600 text-white rounded-br-md shadow-brand"
                : senderType === "support"
                ? "bg-neutral-100 text-neutral-900 rounded-bl-md"
                : "bg-white text-neutral-900 border border-neutral-200 rounded-bl-md shadow-sm"
            )}
          >
            <p className="whitespace-pre-wrap break-words">{content}</p>

            {/* Translation block (only on counterpart messages) */}
            {translateActive && !isMe && (
              <TranslationLine
                messageId={id}
                content={content}
                target={senderType === "agent" ? "fr" : "fr"}
              />
            )}
          </div>
        )}

        <div
          className={cn(
            "mt-1 flex items-center gap-1 text-[10.5px] text-neutral-400",
            isMe ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span>{formatHourMinute(createdAt)}</span>
          {isMe && (
            <>
              {pending && <Loader2 className="h-3 w-3 animate-spin" />}
              {failed && (
                <span className="inline-flex items-center gap-0.5 text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Échec
                </span>
              )}
              {!pending && !failed && showReceipt && (
                read ? (
                  <CheckCheck className="h-3 w-3 text-primary-500" />
                ) : (
                  <Check className="h-3 w-3" />
                )
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Translation line — fetches on demand + caches in module-scope so the
// same message isn't re-translated on every render.
// ----------------------------------------------------------------------

const translationCache = new Map<string, string>();

function TranslationLine({
  messageId,
  content,
  target,
}: {
  messageId: string;
  content: string;
  target: "fr" | "zh";
}) {
  const cacheKey = `${messageId}::${target}`;
  const [text, setText] = useState<string | null>(
    translationCache.get(cacheKey) ?? null
  );
  const [loading, setLoading] = useState(!text);

  useEffect(() => {
    if (translationCache.has(cacheKey)) {
      setText(translationCache.get(cacheKey)!);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: content, to: target }),
    })
      .then((r) => r.json())
      .then((data: { translated?: string }) => {
        if (cancelled) return;
        const t = data.translated ?? content;
        translationCache.set(cacheKey, t);
        setText(t);
      })
      .catch(() => {
        if (!cancelled) setText(content);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cacheKey, content, target]);

  return (
    <div className="mt-2 border-t border-current/10 pt-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-60">
        <Languages className="h-2.5 w-2.5" />
        Traduction
      </div>
      <p
        className={cn(
          "mt-0.5 text-[13px] italic leading-relaxed opacity-80",
          loading && "animate-pulse"
        )}
      >
        {loading ? "Traduction en cours…" : text}
      </p>
    </div>
  );
}

function CounterpartAvatar({
  senderType,
  agentName,
  agentAvatarUrl,
}: {
  senderType: "agent" | "support";
  agentName?: string | null;
  agentAvatarUrl?: string | null;
}) {
  if (senderType === "support") {
    return (
      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-sm">
        <Headphones className="h-4 w-4" />
      </div>
    );
  }
  if (agentAvatarUrl) {
    return (
      <Image
        src={agentAvatarUrl}
        alt={agentName ?? ""}
        width={32}
        height={32}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-500">
      {agentName?.[0] ?? "?"}
    </div>
  );
}
