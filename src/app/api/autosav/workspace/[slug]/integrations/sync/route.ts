import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { syncImapIntegration } from "@/lib/autosav/imap-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel Hobby = 60s max, on prend de la marge
export const maxDuration = 60;

/**
 * POST /api/autosav/workspace/[slug]/integrations/sync
 * Body: { type: 'ionos' | 'gmail' | 'outlook' }
 *
 * Déclenche manuellement un sync IMAP. L'intégration doit déjà être
 * enregistrée. Seuls owner/admin peuvent.
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = (await req.json()) as { type?: string };
    if (!body.type) {
      return NextResponse.json({ error: "type requis" }, { status: 400 });
    }

    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const integration = await prisma.autosavIntegration.findFirst({
      where: { workspaceId: ctx.workspaceId, type: body.type },
    });
    if (!integration) {
      return NextResponse.json(
        { error: "Aucune intégration connectée de ce type" },
        { status: 404 }
      );
    }

    // Pour l'instant : seules les intégrations IMAP-compatibles
    if (!["ionos", "gmail", "outlook"].includes(integration.type)) {
      return NextResponse.json(
        { error: "Sync non supporté pour ce type d'intégration" },
        { status: 400 }
      );
    }

    const result = await syncImapIntegration(ctx.workspaceId, integration.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    const message = e instanceof Error ? e.message : "Erreur";
    console.error("[autosav.integrations.sync]", e);
    return NextResponse.json(
      { error: `Sync échoué : ${message}` },
      { status: 500 }
    );
  }
}
