import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { generateSmartReplies, AI_ENABLED } from "@/lib/ai";

/**
 * POST /api/suggest-reply
 *   Body: { conversationId: string }
 *
 * Returns 3 contextual reply suggestions based on the last message in
 * the thread. Mocked rule-based system for now; swap for GPT-4o later.
 */
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const body = (await req.json()) as { conversationId?: string };
    if (!body.conversationId) {
      return NextResponse.json({ error: "conversationId requis" }, { status: 400 });
    }

    const conv = await prisma.conversation.findFirst({
      where: { id: body.conversationId, userId },
      select: { id: true, type: true, agentName: true },
    });
    if (!conv) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    const lastMessages = await prisma.message.findMany({
      where: { conversationId: body.conversationId },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    const transcript = lastMessages
      .slice()
      .reverse()
      .map((m) => ({
        senderType: m.senderType as "user" | "agent" | "support" | "system",
        content: m.content,
      }));

    let suggestions = AI_ENABLED
      ? await generateSmartReplies(transcript, {
          agentName: conv.agentName,
          convType: conv.type as "agent" | "support",
        })
      : null;

    if (!suggestions) {
      await new Promise((r) => setTimeout(r, 350));
      suggestions = buildSuggestions(
        transcript,
        conv.type as "agent" | "support",
        conv.agentName ?? undefined
      );
    }

    return NextResponse.json({
      suggestions,
      poweredBy: AI_ENABLED ? "gpt-4o-mini" : "mock",
    });
  } catch (e) {
    console.error("[/api/suggest-reply]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// ----------------------------------------------------------------------
// Rule-based suggestion engine. Detects intent in the last counterpart
// message and proposes 3 useful next steps. Easy to swap for GPT-4o.
// ----------------------------------------------------------------------

interface Snippet {
  senderType: "user" | "agent" | "support" | "system";
  content: string;
}

function buildSuggestions(
  history: Snippet[],
  convType: "agent" | "support",
  agentName?: string
): string[] {
  const last = history.find((m) => m.senderType !== "user");
  const text = (last?.content ?? "").toLowerCase();

  // Devis received
  if (
    text.includes("devis") ||
    text.includes("€/unité") ||
    text.includes("eur/unité") ||
    text.match(/\d+[.,]\d+€/)
  ) {
    return [
      "✅ Je valide le devis, on lance la production.",
      "🤔 Peux-tu négocier 5-10% de baisse sur le prix unitaire ?",
      "📦 Tu peux m'envoyer un échantillon avant la production ?",
    ];
  }

  // Sample / échantillon
  if (text.includes("échantillon") || text.includes("sample")) {
    return [
      "Yes, envoie-moi l'échantillon STP. Mon adresse est sur mon profil.",
      "Combien ça coûte l'envoi de l'échantillon ?",
      "Pas besoin d'échantillon, j'ai confiance — on passe direct à la prod.",
    ];
  }

  // Quality / qualité / certif
  if (
    text.includes("qualité") ||
    text.includes("certif") ||
    text.includes("test")
  ) {
    return [
      "Top, peux-tu m'envoyer les certifs au format PDF ?",
      "Je veux une vidéo QC complète avant l'expédition.",
      "Quel pourcentage de rebut tu acceptes max ?",
    ];
  }

  // Shipping / livraison / expédition
  if (
    text.includes("livraison") ||
    text.includes("expédition") ||
    text.includes("transport")
  ) {
    return [
      "Quelle est l'option la plus rapide ?",
      "Tu peux me partager le tracking dès l'expédition ?",
      "Privilégie le moins cher, c'est OK pour 15 jours de plus.",
    ];
  }

  // Greeting from counterpart
  if (text.match(/\bbonjour\b|\bsalut\b|\bhello\b/)) {
    return [
      `Salut ${agentName?.split(" ")[0] ?? ""} ! J'ai un nouveau projet pour toi.`.trim(),
      "Hello, j'ai besoin d'aide sur une nouvelle référence produit.",
      "Bonjour ! Je peux te poser une question rapide ?",
    ];
  }

  // No prior message or generic — opening prompts
  if (!last || convType === "support") {
    return convType === "support"
      ? [
          "👋 Hello l'équipe, j'ai une question sur ma facture.",
          "Je n'arrive pas à uploader une image dans une demande.",
          "Comment passer du plan Starter au plan Pro ?",
        ]
      : [
          "👋 Hello, présente-moi un peu ton parcours.",
          "Quelles catégories tu manies le mieux ?",
          "Je cherche un produit, je peux te décrire mon besoin ?",
        ];
  }

  // Default fallback
  return [
    "Merci pour ton retour.",
    "Tu peux me donner plus de détails ?",
    "Top, on continue. Quelles sont les prochaines étapes ?",
  ];
}
