import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { InboxView } from "../InboxView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spam · AutoSAV" };

/**
 * Tickets identifiés comme spam (auto par l'IA ou manuellement par l'agent).
 * Pas envoyés au quota, conservés 30j puis purgés.
 */
export default async function SpamPage({
  params,
}: {
  params: { slug: string };
}) {
  let ctx;
  try {
    ctx = await getWorkspaceBySlug(params.slug);
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      if (e.code === "UNAUTHENTICATED") redirect("/login");
      redirect("/autosav");
    }
    throw e;
  }
  const ws = ctx.workspace!;

  return (
    <InboxView
      workspaceSlug={ws.slug}
      workspaceName={ws.name}
      signature={ws.signature}
      tone={ws.tone}
      kbText={ws.kbText}
      statusFilter="spam"
      pageTitle="Spam"
      emptyState={{
        title: "Pas de spam",
        description:
          "Les emails que l'IA filtre comme spam (promos, phishing, automatisé…) atterrissent ici. Ils sont purgés au bout de 30 jours.",
      }}
    />
  );
}
