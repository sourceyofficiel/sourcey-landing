import { NextResponse } from "next/server";
import { translateText, AI_ENABLED } from "@/lib/ai";

/**
 * POST /api/translate
 *   Body: { text: string, to: 'fr' | 'zh' }
 *
 * Uses GPT-4o-mini when OPENAI_API_KEY is set, otherwise falls back to
 * a deterministic mock so the UI still works in dev/demo.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; to?: "fr" | "zh" };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "text est requis" }, { status: 400 });
    }
    const to = body.to === "zh" ? "zh" : "fr";

    const real = AI_ENABLED ? await translateText(text, to) : null;
    if (real) {
      return NextResponse.json({
        translated: real,
        to,
        poweredBy: "gpt-4o-mini",
      });
    }

    await new Promise((r) => setTimeout(r, 350));
    const translated =
      to === "zh" ? `[译] ${pseudoZh(text)}` : `[FR] ${pseudoFr(text)}`;
    return NextResponse.json({ translated, to, poweredBy: "mock" });
  } catch (e) {
    console.error("[/api/translate]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Cheesy stand-ins so the demo "feels" real. Replace with the real
// model output once the OpenAI key is configured.
function pseudoZh(s: string): string {
  const map: Record<string, string> = {
    bonjour: "你好",
    salut: "你好",
    merci: "谢谢",
    oui: "是的",
    non: "不",
    devis: "报价",
    usine: "工厂",
    commande: "订单",
    livraison: "发货",
    qualité: "质量",
    produit: "产品",
    prix: "价格",
  };
  let out = s;
  for (const [fr, zh] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\b${fr}\\b`, "gi"), zh);
  }
  return out;
}

function pseudoFr(s: string): string {
  return s;
}
