"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fetches smart reply suggestions for a conversation.
 * Re-fetches when messageCount changes (i.e. when new messages arrive).
 */
export function useSuggestions(
  conversationId: string | null,
  messageCount: number
) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!conversationId) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      if (!res.ok) throw new Error("Erreur");
      const data = (await res.json()) as { suggestions: string[] };
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    refresh();
  }, [conversationId, messageCount, refresh]);

  const clear = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, refresh, clear };
}
