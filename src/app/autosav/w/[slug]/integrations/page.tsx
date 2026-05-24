import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { IntegrationsView } from "./IntegrationsView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Intégrations · AutoSAV" };

export default async function IntegrationsPage({
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
    <IntegrationsView
      workspaceSlug={ws.slug}
      workspaceName={ws.name}
      canManage={ctx.role === "owner" || ctx.role === "admin"}
    />
  );
}
