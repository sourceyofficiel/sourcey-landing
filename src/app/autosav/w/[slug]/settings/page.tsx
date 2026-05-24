import { redirect } from "next/navigation";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réglages · AutoSAV" };

export default async function AutosavSettingsPage({
  params,
}: {
  params: { slug: string };
}) {
  let ctx;
  try {
    ctx = await getWorkspaceBySlug(params.slug);
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      if (e.code === "UNAUTHENTICATED") redirect("/login?next=/autosav");
      redirect("/autosav");
    }
    throw e;
  }
  const ws = ctx.workspace!;

  return (
    <div className="h-full overflow-y-auto bg-neutral-50/40">
      <div className="mx-auto max-w-[860px] px-6 py-8">
        <h1 className="font-display text-[24px] font-extrabold tracking-tight text-neutral-900">
          Réglages workspace
        </h1>
        <p className="mt-1 text-[13.5px] text-neutral-500">
          Configure le ton de l&apos;IA, ta signature et ta knowledge base.
        </p>

        <SettingsClient
          workspaceSlug={ws.slug}
          initialName={ws.name}
          initialSignature={ws.signature}
          initialTone={ws.tone}
          initialBrandContext={ws.brandContext}
          initialKbText={ws.kbText}
        />
      </div>
    </div>
  );
}
