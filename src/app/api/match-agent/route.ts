import { NextResponse } from "next/server";
import { matchAgents } from "@/lib/agent-matching";

/**
 * POST /api/match-agent
 *   Body: { description: string, targetQuantity?: number }
 *   Returns: { analysis, matches, totalCandidates }
 *
 * For demo purposes uses the deterministic scoring engine.
 * Swap `matchAgents` with an OpenAI-backed implementation later.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      description?: string;
      targetQuantity?: number;
    };

    const description = body.description?.trim();
    if (!description || description.length < 10) {
      return NextResponse.json(
        {
          error:
            "Décris ton besoin en au moins 10 caractères (catégorie, matière, particularités…).",
        },
        { status: 400 }
      );
    }

    // Add a tiny artificial delay to feel like an LLM call (UX choice)
    await new Promise((r) => setTimeout(r, 800));

    const result = matchAgents({
      description,
      targetQuantity: body.targetQuantity,
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("[/api/match-agent]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
