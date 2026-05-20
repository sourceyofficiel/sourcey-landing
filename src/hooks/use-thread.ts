"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ConversationDetail,
  MessageDTO,
  ProductContext,
} from "@/lib/types/messaging";
import type { Attachment } from "@/lib/attachments";
import { serializeAttachments } from "@/lib/attachments";

interface OptimisticMessage extends MessageDTO {
  /** true if not yet acknowledged by the server */
  pending?: boolean;
  /** true if server returned an error and message could not be sent */
  failed?: boolean;
}

/**
 * Loads + polls a single conversation thread.
 * Handles optimistic send: user message appears immediately,
 * gets replaced when the server confirms.
 */
export function useThread(conversationId: string | null, intervalMs = 5_000) {
  const [conversation, setConversation] = useState<ConversationDetail | null>(
    null
  );
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const optimisticIdsRef = useRef<Set<string>>(new Set());

  const fetchThread = useCallback(async (cid: string) => {
    const res = await fetch(`/api/conversations/${cid}/messages`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.json())?.error ?? "Erreur");
    return (await res.json()) as {
      conversation: ConversationDetail;
      messages: MessageDTO[];
      productContext: ProductContext | null;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!conversationId) return;
    try {
      const data = await fetchThread(conversationId);
      setConversation(data.conversation);
      setProductContext(data.productContext);
      setMessages((prev) => {
        const serverIds = new Set(data.messages.map((m) => m.id));
        const stillPending = prev.filter(
          (m) => m.pending && !serverIds.has(m.id)
        );
        return [...data.messages, ...stillPending];
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, [conversationId, fetchThread]);

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      setConversation(null);
      setMessages([]);
      return;
    }
    setLoading(true);
    refresh();
    const id = window.setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [conversationId, refresh, intervalMs]);

  useEffect(() => {
    if (!conversationId) return;
    fetch(`/api/conversations/${conversationId}/read`, {
      method: "POST",
    }).catch(() => {});
  }, [conversationId, messages.length]);

  const send = useCallback(
    async (content: string, attachments?: Attachment[]) => {
      if (!conversationId) return;
      const trimmed = content.trim();
      if (!trimmed && !(attachments && attachments.length > 0)) return;

      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      const optimistic: OptimisticMessage = {
        id: tempId,
        conversationId,
        senderType: "user",
        senderId: "me",
        content: trimmed,
        attachments: attachments?.length ? serializeAttachments(attachments) : null,
        translatedContent: null,
        readByUserAt: new Date().toISOString(),
        readByCounterpartAt: null,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      optimisticIdsRef.current.add(tempId);
      setMessages((prev) => [...prev, optimistic]);
      setSending(true);
      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: trimmed,
              attachments: attachments ?? undefined,
            }),
          }
        );
        if (!res.ok) throw new Error((await res.json())?.error ?? "Erreur");
        const { message } = (await res.json()) as { message: MessageDTO };
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...message, pending: false } : m
          )
        );
        optimisticIdsRef.current.delete(tempId);
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, pending: false, failed: true } : m
          )
        );
        setError(e instanceof Error ? e.message : "Erreur d'envoi");
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  return {
    conversation,
    messages,
    productContext,
    loading,
    sending,
    error,
    send,
    refresh,
  };
}
