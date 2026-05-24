import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { InboxView } from "../InboxView";

export const dynamic = "force-dynamic";
export const metadata = { title: "En attente · AutoSAV" };

/**
 * Tickets en attente — soit snoozés (snoozeUntil dans le futur), soit
 * envoyés et toujours en attente d'une réponse client. On expose tous les
 * tickets non-résolus + l'utilisateur peut filtrer via la barre de filtre.
 */
export default async function WaitingPage({
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
      statusFilter="pending"
      pageTitle="En attente"
      emptyState={{
        title: "Rien en attente",
        description:
          "Aucun ticket en pause ou en attente de réponse du client. Tu peux snoozer un ticket depuis sa conversation pour le retrouver ici.",
      }}
    />
  );
}
