import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { TeamView } from "./TeamView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Équipe · AutoSAV" };

export default async function TeamPage({
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
    <TeamView
      workspaceSlug={ws.slug}
      workspaceName={ws.name}
      myRole={ctx.role}
    />
  );
}
