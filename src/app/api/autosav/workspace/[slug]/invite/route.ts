import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/workspace/[slug]/invite
 * Body: { email, role }
 *
 * Crée une invitation. Le token est random, lien d'accès :
 * /autosav/invite/{token}. Expire en 7 jours.
 *
 * Seuls owner et admin peuvent inviter.
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = (await req.json()) as { email?: string; role?: string };
    if (!body.email || !body.email.includes("@")) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return NextResponse.json(
        { error: "Réservé aux propriétaires et admins" },
        { status: 403 }
      );
    }

    const email = body.email.toLowerCase().trim();
    const role = ["agent", "admin"].includes(body.role ?? "agent")
      ? (body.role as "agent" | "admin")
      : "agent";

    // Si déjà membre, on refuse
    const existing = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        autosavMemberships: {
          where: { workspaceId: ctx.workspaceId },
          select: { id: true },
        },
      },
    });
    if (existing?.autosavMemberships?.length) {
      return NextResponse.json(
        { error: "Cet utilisateur est déjà membre du workspace" },
        { status: 409 }
      );
    }

    // Supprime invitations existantes pour cet email + workspace
    await prisma.autosavInvitation.deleteMany({
      where: { workspaceId: ctx.workspaceId, email },
    });

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

    const invitation = await prisma.autosavInvitation.create({
      data: {
        workspaceId: ctx.workspaceId,
        email,
        role,
        token,
        expiresAt,
        invitedById: ctx.userId,
      },
    });

    // TODO phase 2 : envoyer l'email avec Resend
    // const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/autosav/invite/${token}`;
    // await sendInvitationEmail(email, ctx.workspace.name, inviteUrl);

    return NextResponse.json({
      ok: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.invite]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

/**
 * DELETE /api/autosav/workspace/[slug]/invite?id=…
 * Révoque une invitation pendante.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id requis" }, { status: 400 });
    }

    const ctx = await getWorkspaceBySlug(params.slug);
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.autosavInvitation.deleteMany({
      where: { id, workspaceId: ctx.workspaceId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.invite.delete]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
