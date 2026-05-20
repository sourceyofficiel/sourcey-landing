import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/briefs
 *   Returns all briefs for the authenticated user.
 *
 * POST /api/briefs
 *   Body : { productName, productType?, description, targetQuantity, targetPrice?, targetDelivery?, inspirationUrl? }
 *   Creates a new brief in status "new".
 */

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const briefs = await prisma.brief.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ briefs });
  } catch (e) {
    console.error("[GET /api/briefs]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });

    const body = (await req.json()) as {
      productName?: string;
      productType?: string;
      description?: string;
      targetQuantity?: string;
      targetPrice?: string;
      targetDelivery?: string;
      inspirationUrl?: string;
    };

    if (!body.productName || !body.description || !body.targetQuantity) {
      return NextResponse.json(
        { error: "Le nom du produit, la description et la quantité sont obligatoires" },
        { status: 400 }
      );
    }

    const brief = await prisma.brief.create({
      data: {
        userId: user.id,
        productName: body.productName.trim(),
        productType: body.productType?.trim() || null,
        description: body.description.trim(),
        targetQuantity: body.targetQuantity.trim(),
        targetPrice: body.targetPrice?.trim() || null,
        targetDelivery: body.targetDelivery?.trim() || null,
        inspirationUrl: body.inspirationUrl?.trim() || null,
        status: "new",
      },
    });

    // Also create a "brief received" message in the welcome conversation
    const welcomeConv = await prisma.conversation.findFirst({
      where: { userId: user.id, type: "support" },
      orderBy: { createdAt: "asc" },
    });
    if (welcomeConv) {
      await prisma.message.create({
        data: {
          conversationId: welcomeConv.id,
          senderType: "system",
          senderId: null,
          content: `📋 Brief reçu : « ${brief.productName} » — Quantité : ${brief.targetQuantity}\n\nNotre équipe te contacte sur WhatsApp sous 24h pour avancer sur ce sourcing.`,
        },
      });
      await prisma.conversation.update({
        where: { id: welcomeConv.id },
        data: {
          lastMessagePreview: `📋 Brief reçu : ${brief.productName}`,
          lastMessageAt: new Date(),
          unreadByUser: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ ok: true, brief });
  } catch (e) {
    console.error("[POST /api/briefs]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
