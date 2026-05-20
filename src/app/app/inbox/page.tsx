"use client";

import { useEffect, useState } from "react";
import { ConversationList } from "@/components/inbox/ConversationList";
import { ThreadView } from "@/components/inbox/ThreadView";
import { useConversations } from "@/hooks/use-conversations";
import { useThread } from "@/hooks/use-thread";
import type { Attachment } from "@/lib/attachments";

type Filter = "all" | "agent" | "support";

export default function InboxPage() {
  const { conversations, loading: listLoading, refresh: refreshList } =
    useConversations(15_000);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const {
    conversation,
    messages,
    productContext,
    loading: threadLoading,
    sending,
    send,
  } = useThread(activeId, 5_000);

  async function handleSend(content: string, attachments?: Attachment[]) {
    await send(content, attachments);
    refreshList();
  }

  return (
    <div className="grid h-[calc(100vh-56px)] grid-cols-1 md:h-screen md:grid-cols-[360px_1fr]">
      <ConversationList
        conversations={conversations}
        activeId={activeId}
        loading={listLoading}
        filter={filter}
        onFilterChange={setFilter}
        onSelect={(id) => setActiveId(id)}
        className={activeId ? "hidden md:flex" : "flex"}
      />
      <ThreadView
        conversation={conversation}
        messages={messages}
        productContext={productContext}
        loading={threadLoading}
        sending={sending}
        onSend={handleSend}
        onBack={() => setActiveId(null)}
        className={activeId ? "flex" : "hidden md:flex"}
      />
    </div>
  );
}
