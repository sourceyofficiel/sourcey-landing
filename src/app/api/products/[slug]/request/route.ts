import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import type { PriceTier } from "@/lib/types/products";

/**
 * POST /api/products/[slug]/request
 *   Body: { type: 'quote' | 'sample', quantity?: number, message?: string }
 *
 *   - Creates a ProductRequest
 *   - Reuses or creates a Conversation with the product's agent
 *   - Sends a system message + the user's brief
 *   - Returns { request, conversationId } so the client can navigate to chat
 */
export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const body = (await req.json()) as {
      type?: "quote" | "sample";
      quantity?: number;
      message?: string;
    };

    if (body.type !== "quote" && body.type !== "sample") {
      return NextResponse.json(
        { error: "type doit être 'quote' ou 'sample'" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
    });
    if (!product) {
      return NextResponse.json(
        { error: "Produit introuvable" },
        { status: 404 }
      );
    }

    // Reuse the most recent active conversation with the same agent if any,
    // otherwise create a fresh one anchored to this product.
    let conversation = await prisma.conversation.findFirst({
      where: {
        userId,
        type: "agent",
        agentId: product.agentSlug,
        archivedAt: null,
      },
      orderBy: { lastMessageAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          type: "agent",
          agentId: product.agentSlug,
          agentName: product.agentName,
          agentCity: product.agentCity,
          agentAvatarUrl: product.agentAvatarUrl,
          title: `${product.agentName} · ${product.title}`,
          lastMessagePreview: `Demande sur ${product.title}`,
          lastMessageAt: new Date(),
        },
      });
    }

    // System anchor message linking the product
    const tiers: PriceTier[] = JSON.parse(product.priceTiers);
    const cheapest = Math.min(...tiers.map((t) => t.unitPrice));
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "system",
        content:
          body.type === "sample"
            ? `Demande d'échantillon : ${product.title} (${product.samplePrice ?? "?"}€).`
            : `Demande de devis : ${product.title} (MOQ ${product.moq}, à partir de ${cheapest}€/u).`,
      },
    });

    // User message with brief
    const briefLines = [];
    if (body.quantity) briefLines.push(`Quantité visée : ${body.quantity} unités`);
    if (body.message?.trim()) briefLines.push(body.message.trim());
    if (briefLines.length === 0) {
      briefLines.push(
        body.type === "sample"
          ? `Salut ${product.agentName.split(" ")[0]} ! Je voudrais commander un échantillon de "${product.title}" pour évaluer la qualité avant une commande plus large.`
          : `Salut ${product.agentName.split(" ")[0]} ! Je suis intéressé par "${product.title}". Tu peux me faire un devis précis ?`
      );
    }
    const userMessage = briefLines.join("\n\n");

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderType: "user",
        senderId: userId,
        content: userMessage,
      },
    });

    const previewSource =
      body.type === "sample"
        ? `Échantillon : ${product.title}`
        : `Devis : ${product.title}`;
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessagePreview: previewSource.slice(0, 120),
        lastMessageAt: new Date(),
        unreadByCounterpart: { increment: 1 },
      },
    });

    const request = await prisma.productRequest.create({
      data: {
        userId,
        productId: product.id,
        type: body.type,
        quantity: body.quantity ?? null,
        message: body.message ?? null,
        conversationId: conversation.id,
        status: "new",
      },
    });

    return NextResponse.json({ request, conversationId: conversation.id });
  } catch (e) {
    console.error("[POST /api/products/[slug]/request]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
