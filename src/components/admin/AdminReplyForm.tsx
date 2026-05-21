"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";

export function AdminReplyForm({
  conversationId,
}: {
  conversationId: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(
        `/api/admin/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text.trim() }),
        }
      );
      if (!res.ok) throw new Error("send failed");
      setText("");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSend}
      className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6"
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
        Répondre en tant que Sourcey support
      </h2>
      <textarea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Bonjour Marie, merci pour ton message. Voici ce qu'on peut faire…"
        className="mt-3 block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] leading-relaxed text-neutral-900 transition-colors hover:border-neutral-300 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px] text-neutral-400">
          Ce message apparaîtra côté client comme venant de "Équipe Sourcey".
        </div>
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {sending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Envoyer
        </button>
      </div>
    </form>
  );
}
