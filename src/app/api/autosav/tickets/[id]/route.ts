import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/autosav/tickets/[id]?workspaceSlug=…
 * Retourne un ticket complet avec ses replies + notes internes + historique
 * client (autres tickets du même customer).
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url);
    const workspaceSlug = url.searchParams.get("workspaceSlug");
    if (!workspaceSlug) {
      return NextResponse.json(
        { error: "workspaceSlug requis" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(workspaceSlug);

    const ticket = await prisma.autosavTicket.findFirst({
      where: { id: params.id, workspaceId: ctx.workspaceId },
      include: {
        replies: { orderBy: { sentAt: "asc" } },
        notes: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!ticket) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Marque comme lu automatiquement à l'ouverture
    if (ticket.unread) {
      await prisma.autosavTicket.update({
        where: { id: ticket.id },
        data: { unread: false },
      });
    }

    // Historique client : autres tickets de ce customer
    const customerHistory = await prisma.autosavTicket.findMany({
      where: {
        workspaceId: ctx.workspaceId,
        customerEmail: ticket.customerEmail,
        id: { not: ticket.id },
      },
      orderBy: { receivedAt: "desc" },
      take: 10,
      select: {
        id: true,
        subject: true,
        status: true,
        category: true,
        receivedAt: true,
        detectedOrderId: true,
      },
    });

    // Stats client (count par status)
    const customerStats = await prisma.autosavTicket.groupBy({
      by: ["status"],
      where: {
        workspaceId: ctx.workspaceId,
        customerEmail: ticket.customerEmail,
      },
      _count: { _all: true },
    });
    const ordersCount = await prisma.autosavTicket.count({
      where: {
        workspaceId: ctx.workspaceId,
        customerEmail: ticket.customerEmail,
        detectedOrderId: { not: null },
      },
    });
    const firstSeen = await prisma.autosavTicket.findFirst({
      where: {
        workspaceId: ctx.workspaceId,
        customerEmail: ticket.customerEmail,
      },
      orderBy: { receivedAt: "asc" },
      select: { receivedAt: true },
    });

    return NextResponse.json({
      ticket: {
        ...ticket,
        // Marquer comme lu dans la réponse aussi
        unread: false,
      },
      customerHistory,
      customerStats: {
        total: customerStats.reduce((sum, s) => sum + s._count._all, 0),
        resolved:
          customerStats.find((s) => s.status === "resolved")?._count._all ?? 0,
        ordersCount,
        firstSeen: firstSeen?.receivedAt ?? ticket.receivedAt,
      },
    });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.ticket.get]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}

/**
 * PATCH /api/autosav/tickets/[id]
 * Body: { workspaceSlug, ...partial update }
 *
 * Met à jour le ticket (starred, status, archive, snooze, etc.)
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await req.json()) as {
      workspaceSlug?: string;
      starred?: boolean;
      status?: string;
      archived?: boolean;
      snoozeUntil?: string | null;
      category?: string;
      priority?: string;
    };

    if (!body.workspaceSlug) {
      return NextResponse.json(
        { error: "workspaceSlug requis" },
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

    const data: Record<string, unknown> = {};
    if (body.starred !== undefined) data.starred = body.starred;
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === "resolved") data.resolvedAt = new Date();
    }
    if (body.archived !== undefined) {
      data.archivedAt = body.archived ? new Date() : null;
    }
    if (body.snoozeUntil !== undefined) {
      data.snoozeUntil = body.snoozeUntil ? new Date(body.snoozeUntil) : null;
    }
    if (body.category !== undefined) data.category = body.category;
    if (body.priority !== undefined) data.priority = body.priority;

    const updated = await prisma.autosavTicket.update({
      where: { id: ticket.id },
      data,
    });

    return NextResponse.json({ ok: true, ticket: updated });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.ticket.patch]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
