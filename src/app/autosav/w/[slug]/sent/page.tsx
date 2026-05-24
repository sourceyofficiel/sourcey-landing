import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { InboxView } from "../InboxView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Envoyés · AutoSAV" };

/**
 * Liste les tickets dont la réponse a déjà été envoyée au client (status =
 * "sent") mais pas encore marqués comme résolus.
 */
export default async function SentPage({
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
      statusFilter="sent"
      pageTitle="Envoyés"
      emptyState={{
        title: "Aucun message envoyé",
        description:
          "Les conversations dont tu as déjà envoyé une réponse apparaîtront ici, en attendant la suite du client.",
      }}
    />
  );
}
