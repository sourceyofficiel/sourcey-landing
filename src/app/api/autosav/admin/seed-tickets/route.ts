import { NextResponse } from "next/server";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { seedDemoTickets, clearSeedTickets } from "@/lib/autosav/seed-tickets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/admin/seed-tickets
 * Body: { workspaceSlug: string, action: 'seed' | 'clear' }
 *
 * Crée 15 tickets de démo réalistes dans le workspace (idempotent).
 * Ou les supprime tous si action='clear'.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      workspaceSlug?: string;
      action?: "seed" | "clear";
    };

    if (!body.workspaceSlug) {
      return NextResponse.json(
        { error: "workspaceSlug requis" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(body.workspaceSlug);
    if (ctx.role !== "owner" && ctx.role !== "admin") {
      return NextResponse.json(
        { error: "Réservé aux owners/admins" },
        { status: 403 }
      );
    }

    if (body.action === "clear") {
      const result = await clearSeedTickets(ctx.workspaceId);
      return NextResponse.json({ ok: true, action: "clear", ...result });
    }

    const result = await seedDemoTickets(ctx.workspaceId);
    return NextResponse.json({ ok: true, action: "seed", ...result });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.seed]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
