import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { InboxView } from "../InboxView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Résolus · AutoSAV" };

/**
 * Tickets marqués comme résolus (status = "resolved"). Sert d'archive
 * consultable + base de données pour la KB / l'apprentissage.
 */
export default async function ResolvedPage({
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
      statusFilter="resolved"
      pageTitle="Résolus"
      emptyState={{
        title: "Aucun ticket résolu pour le moment",
        description:
          "Les conversations terminées s'archivent ici. Tu peux toujours les rouvrir si le client revient.",
      }}
    />
  );
}
