import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { content } = (await req.json()) as { content?: string };
    const trimmed = content?.trim();
    if (!trimmed) {
      return NextResponse.json(
        { error: "Content required" },
        { status: 400 }
      );
    }

    // Make sure conversation exists
    const conv = await prisma.conversation.findUnique({
      where: { id: params.id },
      select: { id: true, type: true, unreadByUser: true },
    });
    if (!conv) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Create the message + bump conversation in one transaction
    const senderType = conv.type === "support" ? "support" : "agent";

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conv.id,
          senderType,
          senderId: null,
          content: trimmed,
        },
      }),
      prisma.conversation.update({
        where: { id: conv.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview:
            trimmed.length > 80 ? trimmed.slice(0, 77) + "…" : trimmed,
          unreadByUser: conv.unreadByUser + 1,
        },
      }),
    ]);

    return NextResponse.json({ ok: true, message });
  } catch (e) {
    console.error("[/api/admin/conversations/:id/messages]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
