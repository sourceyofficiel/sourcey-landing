import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";

/**
 * GET /api/conversations/[id]/messages
 *   Returns all messages for a conversation, oldest first.
 *   Also includes the conversation meta for header rendering.
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const conversation = await prisma.conversation.findFirst({
      where: { id: params.id, userId },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }
    const messages = await prisma.message.findMany({
      where: { conversationId: params.id },
      orderBy: { createdAt: "asc" },
    });

    // Look up the linked product request (if any) so the chat header
    // can render a contextual product card.
    const linkedRequest = await prisma.productRequest.findFirst({
      where: { conversationId: params.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            slug: true,
            title: true,
            shortPitch: true,
            images: true,
            moq: true,
            leadTimeDays: true,
            priceTiers: true,
          },
        },
      },
    });

    let productContext: unknown = null;
    if (linkedRequest) {
      let firstImage: string | null = null;
      try {
        const arr = JSON.parse(linkedRequest.product.images);
        if (Array.isArray(arr) && typeof arr[0] === "string") firstImage = arr[0];
      } catch { /* noop */ }
      let fromPrice: number | null = null;
      try {
        const tiers = JSON.parse(linkedRequest.product.priceTiers) as { unitPrice: number }[];
        if (Array.isArray(tiers) && tiers.length > 0) {
          fromPrice = Math.min(...tiers.map((t) => t.unitPrice));
        }
      } catch { /* noop */ }
      productContext = {
        productSlug: linkedRequest.product.slug,
        productTitle: linkedRequest.product.title,
        productPitch: linkedRequest.product.shortPitch,
        productImage: firstImage,
        moq: linkedRequest.product.moq,
        leadTimeDays: linkedRequest.product.leadTimeDays,
        fromPrice,
        requestType: linkedRequest.type,
        quantity: linkedRequest.quantity,
        requestStatus: linkedRequest.status,
      };
    }

    return NextResponse.json({ conversation, messages, productContext });
  } catch (e) {
    console.error("[GET /api/conversations/[id]/messages]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/conversations/[id]/messages
 *   Sends a new message. Body: { content: string, attachments?: string[] }
 *   Returns the created message + updates conversation lastMessage* fields.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const conversation = await prisma.conversation.findFirst({
      where: { id: params.id, userId },
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    const body = (await req.json()) as {
      content?: string;
      attachments?: unknown[];
    };
    const content = body.content?.trim() ?? "";
    const hasAttachments = Array.isArray(body.attachments) && body.attachments.length > 0;

    if (!content && !hasAttachments) {
      return NextResponse.json(
        { error: "Le message ne peut pas être vide" },
        { status: 400 }
      );
    }
    if (content.length > 5000) {
      return NextResponse.json(
        { error: "Le message est trop long (5000 caractères max)" },
        { status: 400 }
      );
    }

    const now = new Date();
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderType: "user",
        senderId: userId,
        content,
        attachments: hasAttachments ? JSON.stringify(body.attachments) : null,
      },
    });

    const preview = (content || (hasAttachments ? "📎 Image envoyée" : "")).slice(0, 120);
    await prisma.conversation.update({
      where: { id: params.id },
      data: {
        lastMessagePreview: preview,
        lastMessageAt: now,
        unreadByCounterpart: { increment: 1 },
      },
    });

    return NextResponse.json({ message });
  } catch (e) {
    console.error("[POST /api/conversations/[id]/messages]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
