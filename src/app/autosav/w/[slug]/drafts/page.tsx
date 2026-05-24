import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { InboxView } from "../InboxView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Drafts IA · AutoSAV" };

/**
 * Liste tous les tickets dont le statut = "drafted" (l'IA a généré une
 * réponse, l'humain doit valider avant envoi).
 */
export default async function DraftsPage({
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
      statusFilter="drafted"
      pageTitle="Drafts IA"
      emptyState={{
        title: "Aucun draft en attente",
        description:
          "Quand l'IA prépare une réponse, elle apparaît ici. Tu peux la valider ou l'éditer avant envoi.",
      }}
    />
  );
}
