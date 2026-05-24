import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { InboxView } from "./InboxView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox · AutoSAV" };

/**
 * Page principale du workspace = vue Inbox (3 colonnes ticket list + conv).
 * Le sidebar et topbar sont rendus par le layout.
 */
export default async function WorkspaceHomePage({
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

  // Si onboarding pas fini, rediriger vers l'onboarding
  if (!ws.onboardingDone) {
    // Pour l'instant on laisse passer car l'onboarding ne pose pas ce flag —
    // on activera ce check quand on aura le full onboarding step 5.
  }

  return (
    <InboxView
      workspaceSlug={ws.slug}
      workspaceName={ws.name}
      signature={ws.signature}
      tone={ws.tone}
      kbText={ws.kbText}
    />
  );
}
