import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/tickets/[id]/reply
 * Body: { workspaceSlug, body: string, sendNow?: boolean }
 *
 * Enregistre une réponse au ticket :
 *   - Crée AutosavTicketReply avec draftedBy=userId
 *   - Si sendNow=true : marque le ticket comme 'sent'
 *   - Sinon : juste sauvegarde comme draft
 *
 * Note : pas de vrai SMTP branché ici — pour brancher Resend ou un SMTP
 * personnalisé, c'est dans cette route qu'il faudrait l'appeler.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json()) as {
      workspaceSlug?: string;
      body?: string;
      sendNow?: boolean;
    };

    if (!body.workspaceSlug || !body.body) {
      return NextResponse.json(
        { error: "workspaceSlug et body requis" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(body.workspaceSlug);

    const ticket = await prisma.autosavTicket.findFirst({
      where: { id: params.id, workspaceId: ctx.workspaceId },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const reply = await prisma.autosavTicketReply.create({
      data: {
        ticketId: ticket.id,
        draftedBy: ctx.userId,
        sentBody: body.body,
        userId: ctx.userId,
        sentAt: new Date(),
      },
    });

    if (body.sendNow) {
      await prisma.autosavTicket.update({
        where: { id: ticket.id },
        data: { status: "sent", unread: false },
      });
    }

    // TODO en phase 2 : si l'user a configuré SMTP via Integration, envoyer
    // vraiment via nodemailer. Sinon log seulement.

    return NextResponse.json({ ok: true, reply });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.ticket.reply]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
