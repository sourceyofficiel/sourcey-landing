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
 * POST /api/autosav/tickets/compose
 * Body: {
 *   workspaceSlug, customerEmail, customerName?, subject, body,
 *   category?, priority?
 * }
 *
 * Crée un nouveau ticket manuellement (composé par l'user, pas reçu par
 * email). Utile pour outbound (proactive support, follow-up).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      workspaceSlug?: string;
      customerEmail?: string;
      customerName?: string;
      subject?: string;
      body?: string;
      category?: string;
      priority?: string;
    };

    if (
      !body.workspaceSlug ||
      !body.customerEmail ||
      !body.subject ||
      !body.body
    ) {
      return NextResponse.json(
        { error: "Champs requis : workspaceSlug, customerEmail, subject, body" },
        { status: 400 }
      );
    }

    const ctx = await getWorkspaceBySlug(body.workspaceSlug);

    const externalId = `manual-${crypto.randomBytes(8).toString("hex")}`;

    const ticket = await prisma.autosavTicket.create({
      data: {
        workspaceId: ctx.workspaceId,
        externalId,
        channel: "email",
        customerEmail: body.customerEmail.toLowerCase().trim(),
        customerName: body.customerName ?? null,
        subject: body.subject,
        body: body.body,
        status: "pending",
        priority: (body.priority as "low" | "medium" | "high") ?? "medium",
        category:
          (body.category as
            | "order"
            | "return"
            | "shipping"
            | "complaint"
            | "general") ?? "general",
        unread: false, // L'user vient de le composer, déjà lu
        receivedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, ticket });
  } catch (e) {
    if (e instanceof WorkspaceAccessError) {
      return NextResponse.json({ error: e.code }, { status: 403 });
    }
    console.error("[autosav.tickets.compose]", e);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
