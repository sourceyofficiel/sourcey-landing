import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/autosav/workspace/[slug]/counts
 *
 * Retourne les vrais compteurs DB pour le sidebar :
 *   - byFolder : pending+drafted ("À traiter") / drafted / sent / resolved / spam / snoozed
 *   - byCategory : top catégories utilisées avec leur count (tickets non résolus)
 *   - unreadActive : non-lus dans l'inbox active (pour le badge topbar)
 *
 * Tickets archivés exclus partout.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const ctx = await getWorkspaceBySlug(params.slug);

    // Group par status (exclut archivés)
    const byStatusRaw = await prisma.autosavTicket.groupBy({
      by: ["status"],
      where: { workspaceId: ctx.workspaceId, archivedAt: null },
      _count: { _all: true },
    });
    const statusMap = new Map<string, number>();
    for (const row of byStatusRaw) {
      statusMap.set(row.status, row._count._all);
    }

    const pending = statusMap.get("pending") ?? 0;
    const drafted = statusMap.get("drafted") ?? 0;
    const sent = statusMap.get("sent") ?? 0;
    const resolved = statusMap.get("resolved") ?? 0;
    const spam = statusMap.get("spam") ?? 0;

    // Snoozés = tickets pending/sent avec snoozeUntil dans le futur
    const snoozed = await prisma.autosavTicket.count({
      where: {
        workspaceId: ctx.workspaceId,
        archivedAt: null,
        snoozeUntil: { gt: new Date() },
      },
    });

    // Non-lus dans l'active inbox (pour le badge topbar)
    const unreadActive = await prisma.autosavTicket.count({
      where: {
        workspaceId: ctx.workspaceId,
        archivedAt: null,
        unread: true,
        status: { in: ["pending", "drafted"] },
      },
    });

    // Catégories utilisées (tickets non résolus, non archivés)
    const byCategoryRaw = await prisma.autosavTicket.groupBy({
      by: ["category"],
      where: {
        workspaceId: ctx.workspaceId,
        archivedAt: null,
        status: { notIn: ["resolved", "spam"] },
      },
      _count: { _all: true },
      orderBy: { _count: { category: "desc" } },
      take: 5,
    });
    const byCategory = byCategoryRaw.map((c) => ({
      category: c.category,
      count: c._count._all,
    }));

    return NextResponse.json({
      byFolder: {
        active: pending + drafted, // "À traiter"
        drafted, // "Drafts IA"
        waiting: snoozed, // "En attente" = snoozés
        sent, // "Envoyés"
        resolved, // "Résolus"
        spam, // "Spam"
      },
      byCategory,
      unreadActive,
    });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.counts]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
