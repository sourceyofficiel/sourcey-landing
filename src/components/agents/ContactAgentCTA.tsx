"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Agent } from "@/lib/data/agents";

interface Props {
  agent: Agent;
}

export function ContactAgentCTA({ agent }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function contactAgent() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "agent",
          agentSlug: agent.slug,
          firstMessage: `Hello ${agent.fullName.split(" ")[0]} ! Je viens de découvrir ton profil sur Sourcey et j'aimerais discuter d'un projet de sourcing avec toi.`,
        }),
      });
      const data = await res.json();
      if (res.ok) router.push("/app/inbox");
      else throw new Error(data?.error ?? "Erreur");
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
      <Button
        type="button"
        variant="primary"
        size="md"
        onClick={contactAgent}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Ouverture du chat…
          </>
        ) : (
          <>
            <MessageCircle className="h-4 w-4" />
            Démarrer une conversation
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-[10.5px] text-neutral-500">
        Gratuit · {agent.responseTime ?? "< 4h"} de réponse
      </p>
    </div>
  );
}
