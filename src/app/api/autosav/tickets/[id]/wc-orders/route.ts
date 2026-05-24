import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { fetchCustomerOrders } from "@/lib/autosav/woocommerce";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Court timeout : si WC répond pas en 12s on rend juste []
export const maxDuration = 15;

/**
 * GET /api/autosav/tickets/[id]/wc-orders?workspaceSlug=…
 *
 * Endpoint séparé pour ne pas bloquer le chargement du ticket si WC est
 * lent / mal configuré. Le client UI fait ce fetch en parallèle après
 * affichage du message.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url);
    const workspaceSlug = url.searchParams.get("workspaceSlug");
    if (!workspaceSlug) {
      return NextResponse.json({ wcOrders: [] });
    }

    const ctx = await getWorkspaceBySlug(workspaceSlug);

    const ticket = await prisma.autosavTicket.findFirst({
      where: { id: params.id, workspaceId: ctx.workspaceId },
      select: { customerEmail: true },
    });
    if (!ticket) {
      return NextResponse.json({ wcOrders: [] });
    }

    const wcOrders = await fetchCustomerOrders(
      ctx.workspaceId,
      ticket.customerEmail,
      5
    );

    return NextResponse.json({ wcOrders });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    // Fail-soft : on log mais on rend [] pour pas casser l'UI
    console.error("[autosav.ticket.wc-orders]", e);
    return NextResponse.json({ wcOrders: [] });
  }
}
