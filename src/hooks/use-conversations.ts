"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConversationSummary } from "@/lib/types/messaging";

/**
 * Polls `/api/conversations` every `intervalMs` ms.
 * Returns the latest list, loading/error states, and a refresh helper.
 */
export function useConversations(intervalMs = 30_000) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", { cache: "no-store" });
      if (!res.ok) throw new Error((await res.json())?.error ?? "Erreur");
      const data = (await res.json()) as { conversations: ConversationSummary[] };
      setConversations(data.conversations);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    refresh();
    const id = window.setInterval(() => {
      if (!stopped) refresh();
    }, intervalMs);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [refresh, intervalMs]);

  return { conversations, loading, error, refresh };
}
