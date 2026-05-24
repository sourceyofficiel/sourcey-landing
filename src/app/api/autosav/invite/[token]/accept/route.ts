import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/invite/[token]/accept
 *
 * L'user connecté accepte une invitation. Crée le membership et supprime
 * l'invitation. Vérifie que l'email du compte connecté correspond bien à
 * l'email invité.
 */
export async function POST(
  _req: Request,
  { params }: { params: { token: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Tu dois être connecté pour accepter une invitation" },
        { status: 401 }
      );
    }

    const invitation = await prisma.autosavInvitation.findUnique({
      where: { token: params.token },
    });
    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation invalide" },
        { status: 404 }
      );
    }
    if (invitation.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Invitation expirée" },
        { status: 410 }
      );
    }
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Cette invitation est destinée à un autre email" },
        { status: 403 }
      );
    }

    // Création idempotente du membership
    await prisma.$transaction(async (tx) => {
      const existing = await tx.autosavWorkspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
          },
        },
      });
      if (!existing) {
        await tx.autosavWorkspaceMember.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            role: invitation.role,
          },
        });
        await tx.autosavAuditLog.create({
          data: {
            workspaceId: invitation.workspaceId,
            userId: user.id,
            action: "member.join",
            target: user.id,
          },
        });
      }
      await tx.autosavInvitation.delete({ where: { id: invitation.id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[autosav.invite.accept]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
