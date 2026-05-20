import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";

/**
 * POST /api/conversations/[id]/read
 *   Marks all unread messages in a conversation as read by the user.
 *   Resets the conversation's unreadByUser counter to 0.
 */
export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getCurrentUserId();
    const conv = await prisma.conversation.findFirst({
      where: { id: params.id, userId },
      select: { id: true },
    });
    if (!conv) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    const now = new Date();
    await prisma.message.updateMany({
      where: {
        conversationId: params.id,
        readByUserAt: null,
        senderType: { not: "user" },
      },
      data: { readByUserAt: now },
    });

    await prisma.conversation.update({
      where: { id: params.id },
      data: { unreadByUser: 0 },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/conversations/[id]/read]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
