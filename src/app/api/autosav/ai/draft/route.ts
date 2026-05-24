import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getWorkspaceBySlug,
  WorkspaceAccessError,
} from "@/lib/autosav/workspace";
import { consumeTicketQuota, isWorkspaceQuotaBlocked } from "@/lib/autosav/quota";
import { generateDraft } from "@/lib/autosav/ai";
import {
  fetchCustomerOrders,
  formatOrdersForAi,
} from "@/lib/autosav/woocommerce";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/autosav/ai/draft
 * Body: { workspaceSlug, ticketId } OU { workspaceSlug, subject, body, customerEmail }
 *
 * Génère un draft IA :
 *   1. Vérifie l'appartenance au workspace
 *   2. Check si quota bloqué (trial abuser)
 *   3. Appelle Claude
 *   4. Increment quota + crée UsageRecord si overflow
 *   5. Persiste la réponse dans AutosavTicketReply (draftedBy='ai')
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      workspaceSlug?: string;
      ticketId?: string;
      // Fallback : draft "ad-hoc" sans ticket (pour preview/test)
      subject?: string;
      body?: string;
      customerEmail?: string;
      customerName?: string;
    };

    if (!body.workspaceSlug) {
      return NextResponse.json(
        { error: "workspaceSlug requis" },
        { status: 400 }
      );
    }

    // 1. Workspace access
    let ctx;
    try {
      ctx = await getWorkspaceBySlug(body.workspaceSlug);
    } catch (e) {
      if (e instanceof WorkspaceAccessError) {
        const map = {
          UNAUTHENTICATED: { status: 401, msg: "Non authentifié" },
          FORBIDDEN: { status: 403, msg: "Accès refusé à ce workspace" },
          NOT_FOUND: { status: 404, msg: "Workspace introuvable" },
        } as const;
        const r = map[e.code];
        return NextResponse.json({ error: r.msg }, { status: r.status });
      }
      throw e;
    }
    if (!ctx.workspace) {
      return NextResponse.json({ error: "Workspace KO" }, { status: 500 });
    }

    // 2. Quota check
    if (await isWorkspaceQuotaBlocked(ctx.workspaceId)) {
      return NextResponse.json(
        {
          error:
            "Quota dépassé. Passe sur un plan payant pour continuer à drafter.",
          code: "QUOTA_BLOCKED",
        },
        { status: 402 }
      );
    }

    // 3. Récupère soit le ticket en DB, soit l'input ad-hoc
    let ticketData: {
      ticketId: string | null;
      customerEmail: string;
      customerName: string | null;
      subject: string;
      body: string;
    };

    if (body.ticketId) {
      const ticket = await prisma.autosavTicket.findFirst({
        where: { id: body.ticketId, workspaceId: ctx.workspaceId },
      });
      if (!ticket) {
        return NextResponse.json(
          { error: "Ticket introuvable" },
          { status: 404 }
        );
      }
      ticketData = {
        ticketId: ticket.id,
        customerEmail: ticket.customerEmail,
        customerName: ticket.customerName,
        subject: ticket.subject,
        body: ticket.body,
      };
    } else {
      if (!body.subject || !body.body || !body.customerEmail) {
        return NextResponse.json(
          { error: "subject, body, customerEmail requis pour draft ad-hoc" },
          { status: 400 }
        );
      }
      ticketData = {
        ticketId: null,
        customerEmail: body.customerEmail,
        customerName: body.customerName ?? null,
        subject: body.subject,
        body: body.body,
      };
    }

    // 3.5. Enrichissement WooCommerce — passe en contexte au prompt si dispo
    const wcOrders = await fetchCustomerOrders(
      ctx.workspaceId,
      ticketData.customerEmail,
      3
    );
    const orderContext = formatOrdersForAi(wcOrders);

    // 4. Génère le draft
    const draft = await generateDraft({
      customerEmail: ticketData.customerEmail,
      customerName: ticketData.customerName,
      subject: ticketData.subject,
      body: ticketData.body,
      signature: ctx.workspace.signature,
      tone: ctx.workspace.tone,
      brandContext: ctx.workspace.brandContext,
      kbText: ctx.workspace.kbText,
      locale: ctx.workspace.defaultLocale,
      orderContext,
    });

    // 5. Consomme le quota + log
    const quota = await consumeTicketQuota(ctx.workspaceId);

    // 6. Persiste la réponse si on a un ticketId
    if (ticketData.ticketId) {
      await prisma.autosavTicketReply.create({
        data: {
          ticketId: ticketData.ticketId,
          draftedBy: "ai",
          sentBody: draft.text,
          aiModel: draft.model,
          inputTokens: draft.inputTokens,
          outputTokens: draft.outputTokens,
          costCents: draft.costCents,
          isMetered: quota.isMetered,
        },
      });
      await prisma.autosavTicket.update({
        where: { id: ticketData.ticketId },
        data: { status: "drafted" },
      });
    }

    return NextResponse.json({
      ok: true,
      draft: draft.text,
      model: draft.model,
      usage: {
        inputTokens: draft.inputTokens,
        outputTokens: draft.outputTokens,
        costCents: draft.costCents,
        isMetered: quota.isMetered,
        ticketsUsedThisMonth: quota.newUsage,
        quotaLimit: quota.quotaLimit,
      },
    });
  } catch (e) {
    console.error("[autosav.ai.draft]", e);
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Erreur lors de la génération du draft",
      },
      { status: 500 }
    );
  }
}
