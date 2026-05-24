import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PATCH /api/autosav/workspace/[slug]/members/[memberId]
 * Body: { role: 'agent' | 'admin' }
 *
 * Met à jour le rôle d'un membre. Seul owner peut.
 * Owner ne peut pas être rétrogradé via cette route.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { slug: string; memberId: string } }
) {
  try {
    const body = (await req.json()) as { role?: string };
    if (!body.role || !["agent", "admin"].includes(body.role)) {
      return NextResponse.json(
        { error: "Role invalide (agent|admin)" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner") {
      return NextResponse.json(
        { error: "Réservé au propriétaire" },
        { status: 403 }
      );
    }

    const member = await prisma.autosavWorkspaceMember.findFirst({
      where: { id: params.memberId, workspaceId: ctx.workspaceId },
    });
    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (member.role === "owner") {
      return NextResponse.json(
        { error: "Impossible de modifier le rôle du propriétaire" },
        { status: 400 }
      );
    }

    const updated = await prisma.autosavWorkspaceMember.update({
      where: { id: member.id },
      data: { role: body.role },
    });

    return NextResponse.json({ ok: true, member: updated });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.member.patch]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

/**
 * DELETE /api/autosav/workspace/[slug]/members/[memberId]
 * Retire un membre du workspace. Owner uniquement, owner ne peut pas se
 * retirer lui-même via cette route.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string; memberId: string } }
) {
  try {
    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const member = await prisma.autosavWorkspaceMember.findFirst({
      where: { id: params.memberId, workspaceId: ctx.workspaceId },
    });
    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (member.role === "owner") {
      return NextResponse.json(
        { error: "Impossible de retirer le propriétaire" },
        { status: 400 }
      );
    }

    await prisma.autosavWorkspaceMember.delete({ where: { id: member.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.member.delete]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
