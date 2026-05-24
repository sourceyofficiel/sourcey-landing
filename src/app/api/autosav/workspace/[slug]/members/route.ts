import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/autosav/workspace/[slug]/members
 * Liste les membres + invitations en cours du workspace.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ctx = await getWorkspaceBySlug(params.slug);

    const [members, invitations] = await Promise.all([
      prisma.autosavWorkspaceMember.findMany({
        where: { workspaceId: ctx.workspaceId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.autosavInvitation.findMany({
        where: {
          workspaceId: ctx.workspaceId,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.id,
        userId: m.userId,
        email: m.user.email,
        name: m.user.fullName,
        role: m.role,
        joinedAt: m.createdAt,
        isMe: m.userId === ctx.userId,
      })),
      invitations: invitations.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        expiresAt: i.expiresAt,
        createdAt: i.createdAt,
      })),
      myRole: ctx.role,
    });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.team.list]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
