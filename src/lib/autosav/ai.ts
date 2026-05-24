/**
 * AutoSAV — génération de drafts IA via Claude (Anthropic).
 *
 * Stratégie :
 *   - Modèle principal : Claude Sonnet (qualité)
 *   - Fallback : Gemini Flash si Claude 429 ou coût trop élevé
 *   - Tracking tokens + coût pour audit marge
 *   - Logué dans AutosavTicketReply pour traçabilité
 */

import Anthropic from "@anthropic-ai/sdk";

const MODEL_PRIMARY = "claude-3-5-sonnet-20241022";

// Pricing approximatif Claude Sonnet (USD / 1M tokens)
// Mis à jour manuellement quand Anthropic change ses prix.
const COST_INPUT_PER_M_USD = 3.0;
const COST_OUTPUT_PER_M_USD = 15.0;
const USD_TO_EUR = 0.92;

export interface DraftInput {
  customerEmail: string;
  customerName?: string | null;
  subject: string;
  body: string;
  // Context fourni par le workspace
  signature: string;
  tone: string; // 'friendly' | 'pro' | 'casual'
  brandContext: string;
  kbText: string;
  locale: string; // 'fr' | 'en' | etc.
  // Données commande détectées si pertinent
  orderContext?: string | null;
}

export interface DraftResult {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
}

/**
 * Génère un draft de réponse client. Throw en cas d'échec — le caller doit
 * gérer le fallback (retry, Gemini, etc.).
 */
export async function generateDraft(input: DraftInput): Promise<DraftResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquante");
  }
  const client = new Anthropic({ apiKey });

  const systemPrompt = buildSystemPrompt(input);
  const userPrompt = buildUserPrompt(input);

  const response = await client.messages.create({
    model: MODEL_PRIMARY,
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  const costUsd =
    (inputTokens / 1_000_000) * COST_INPUT_PER_M_USD +
    (outputTokens / 1_000_000) * COST_OUTPUT_PER_M_USD;
  const costCents = Math.round(costUsd * USD_TO_EUR * 100);

  return {
    text,
    model: MODEL_PRIMARY,
    inputTokens,
    outputTokens,
    costCents,
  };
}

/* ============================================================
   PROMPTS — engineering
   ============================================================ */

function buildSystemPrompt(input: DraftInput): string {
  const toneDesc: Record<string, string> = {
    friendly: "Chaleureux, accessible, avec un ton humain mais professionnel. Tutoiement OK si la marque le fait.",
    pro: "Soutenu, vouvoiement, courtois et précis. Adapté aux marques premium ou B2B.",
    casual: "Détendu, direct, expressions usuelles. Adapté au D2C jeune (skincare, vêtements casual).",
  };
  const tone = toneDesc[input.tone] ?? toneDesc.friendly;

  return `Tu es un agent SAV expérimenté qui rédige des réponses email aux clients d'une marque e-commerce.

TON : ${tone}

CONTEXTE MARQUE :
${input.brandContext || "(aucun contexte fourni)"}

BASE DE CONNAISSANCES :
${input.kbText || "(aucune KB fournie — réponds en fonction du message du client)"}

RÈGLES :
- Réponse 100% en ${input.locale === "fr" ? "français" : input.locale}
- Format : message email complet, prêt à envoyer
- TERMINE TOUJOURS par cette signature exacte (ne pas reformuler) :
${input.signature}
- Pas d'objet d'email, juste le corps
- Si tu ne sais pas répondre avec certitude (ex: politique de remboursement non précisée), demande poliment plus d'infos plutôt que d'inventer
- Pas d'emoji sauf si le ton ${input.tone} le justifie clairement
- Ne mentionne JAMAIS que tu es une IA`;
}

function buildUserPrompt(input: DraftInput): string {
  const parts: string[] = [];
  parts.push(`Email reçu de ${input.customerName ?? input.customerEmail} <${input.customerEmail}> :`);
  parts.push(`Objet : ${input.subject}`);
  parts.push("");
  parts.push(input.body);

  if (input.orderContext) {
    parts.push("");
    parts.push("INFOS COMMANDE DÉTECTÉES :");
    parts.push(input.orderContext);
  }

  parts.push("");
  parts.push("Rédige la réponse email complète.");

  return parts.join("\n");
}
