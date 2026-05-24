import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "AutoSAV · Réglages" };

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
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[900px] items-center px-5 md:px-8">
          <Link
            href={`/autosav/w/${ws.slug}`}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-5 py-8 md:px-8 md:py-10">
        <h1 className="font-display text-[28px] font-extrabold tracking-tight">
          Réglages
        </h1>
        <p className="mt-1 text-[14px] text-neutral-500">
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
    </main>
  );
}
