import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/autosav/tickets?workspaceSlug=…&status=…&starred=…&category=…&q=…
 *
 * Liste les tickets du workspace avec filtres optionnels.
 * Retourne aussi le dernier draft IA si présent (pour affichage dans la liste).
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const workspaceSlug = url.searchParams.get("workspaceSlug");
    const status = url.searchParams.get("status"); // 'pending' | 'drafted' | ... | 'all'
    const starred = url.searchParams.get("starred"); // '1' pour filtrer
    const category = url.searchParams.get("category");
    const unread = url.searchParams.get("unread"); // '1'
    const q = url.searchParams.get("q"); // search query
    const hasDraft = url.searchParams.get("hasDraft"); // '1' = avec draft IA
    const archived = url.searchParams.get("archived"); // '1' pour voir les archivés

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: "workspaceSlug requis" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(workspaceSlug);

    const where: Record<string, unknown> = {
      workspaceId: ctx.workspaceId,
    };
    if (archived === "1") {
      where.archivedAt = { not: null };
    } else {
      where.archivedAt = null;
    }
    if (status && status !== "all") where.status = status;
    if (starred === "1") where.starred = true;
    if (unread === "1") where.unread = true;
    if (category) where.category = category;
    if (q) {
      where.OR = [
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
      ];
    }

    const tickets = await prisma.autosavTicket.findMany({
      where,
      orderBy: { receivedAt: "desc" },
      take: 200,
      include: {
        replies: {
          orderBy: { sentAt: "desc" },
          take: 1, // le dernier draft/reply pour preview
        },
      },
    });

    return NextResponse.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        customerEmail: t.customerEmail,
        customerName: t.customerName,
        subject: t.subject,
        body: t.body,
        status: t.status,
        priority: t.priority,
        category: t.category,
        starred: t.starred,
        unread: t.unread,
        snoozeUntil: t.snoozeUntil,
        archivedAt: t.archivedAt,
        resolvedAt: t.resolvedAt,
        orderId: t.detectedOrderId,
        orderStatus: t.orderStatus,
        orderEta: t.orderEta,
        orderTracking: t.orderTracking,
        receivedAt: t.receivedAt,
        // Latest reply (draft IA ou sent) si présent
        latestReply: t.replies[0]
          ? {
              draftedBy: t.replies[0].draftedBy,
              sentBody: t.replies[0].sentBody,
              aiModel: t.replies[0].aiModel,
              sentAt: t.replies[0].sentAt,
            }
          : null,
      })),
    });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.tickets.list]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
