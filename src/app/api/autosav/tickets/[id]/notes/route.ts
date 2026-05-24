import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/tickets/[id]/notes
 * Body: { workspaceSlug, body }
 *
 * Ajoute une note interne sur le ticket (visible que par l'équipe, pas
 * envoyée au client).
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json()) as {
      workspaceSlug?: string;
      body?: string;
    };
    if (!body.workspaceSlug || !body.body?.trim()) {
      return NextResponse.json(
        { error: "workspaceSlug et body requis" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(body.workspaceSlug);

    const ticket = await prisma.autosavTicket.findFirst({
      where: { id: params.id, workspaceId: ctx.workspaceId },
      select: { id: true },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const note = await prisma.autosavTicketNote.create({
      data: {
        ticketId: ticket.id,
        body: body.body.trim(),
        authorId: ctx.userId,
      },
    });

    return NextResponse.json({ ok: true, note });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.ticket.notes]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
