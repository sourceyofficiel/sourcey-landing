import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { agents } from "@/lib/data/agents";

/**
 * GET /api/conversations
 *   Returns all conversations for the authenticated user, ordered by
 *   most recent activity. Includes minimal counterpart info for the list view.
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const conversations = await prisma.conversation.findMany({
      where: { userId, archivedAt: null },
      orderBy: { lastMessageAt: "desc" },
      select: {
        id: true,
        type: true,
        agentId: true,
        agentName: true,
        agentCity: true,
        agentAvatarUrl: true,
        title: true,
        lastMessagePreview: true,
        lastMessageAt: true,
        unreadByUser: true,
      },
    });
    return NextResponse.json({ conversations });
  } catch (e) {
    console.error("[GET /api/conversations]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/conversations
 *   Creates a new conversation. Body:
 *     { type: 'support' }                    -> support thread
 *     { type: 'agent', agentSlug: 'chen-mei' } -> thread with an agent
 *     { firstMessage?: string }              -> optional first user message
 */
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = (await req.json()) as {
      type?: "support" | "agent";
      agentSlug?: string;
      firstMessage?: string;
    };

    if (body.type !== "support" && body.type !== "agent") {
      return NextResponse.json(
        { error: "type doit être 'support' ou 'agent'" },
        { status: 400 }
      );
    }

    let agentName: string | null = null;
    let agentCity: string | null = null;
    let agentAvatar: string | null = null;
    let agentId: string | null = null;

    if (body.type === "agent") {
      const slug = body.agentSlug;
      const agent = agents.find((a) => a.slug === slug);
      if (!agent) {
        return NextResponse.json(
          { error: "Agent introuvable" },
          { status: 404 }
        );
      }
      agentId = agent.slug;
      agentName = agent.fullName;
      agentCity = agent.city;
      agentAvatar = agent.avatar;
    }

    const firstMsg = body.firstMessage?.trim();
    const previewSource = firstMsg ?? "Conversation démarrée";

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        type: body.type,
        agentId,
        agentName,
        agentCity,
        agentAvatarUrl: agentAvatar,
        title:
          body.type === "support"
            ? "Support Sourcey"
            : `${agentName} · ${agentCity}`,
        lastMessagePreview: previewSource,
        lastMessageAt: new Date(),
      },
    });

    if (firstMsg) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderType: "user",
          senderId: userId,
          content: firstMsg,
        },
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { unreadByCounterpart: 1 },
      });
    }

    return NextResponse.json({ conversation });
  } catch (e) {
    console.error("[POST /api/conversations]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
