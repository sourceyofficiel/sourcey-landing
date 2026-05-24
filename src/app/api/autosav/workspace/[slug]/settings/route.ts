import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/workspace/[slug]/settings
 * Body: { name?, signature?, tone?, brandContext?, kbText? }
 *
 * Mise à jour des réglages workspace. Requiert role >= admin.
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return NextResponse.json(
        { error: "Réservé aux owners/admins" },
        { status: 403 }
      );
    }

    const body = (await req.json()) as {
      name?: string;
      signature?: string;
      tone?: string;
      brandContext?: string;
      kbText?: string;
    };

    await prisma.autosavWorkspace.update({
      where: { id: ctx.workspaceId },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.signature !== undefined ? { signature: body.signature } : {}),
        ...(body.tone !== undefined ? { tone: body.tone } : {}),
        ...(body.brandContext !== undefined
          ? { brandContext: body.brandContext }
          : {}),
        ...(body.kbText !== undefined ? { kbText: body.kbText } : {}),
      },
    });

    await prisma.autosavAuditLog.create({
      data: {
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        action: "workspace.settings.update",
        target: ctx.workspaceId,
        metadata: Object.keys(body) as object,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      const status = e.code === "UNAUTHENTICATED" ? 401 : 403;
      return NextResponse.json({ error: e.code }, { status });
    }
    console.error("[autosav.settings.update]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
