/**
 * AI adapter — single source of truth for OpenAI calls.
 *
 * When `OPENAI_API_KEY` is set, all AI features (Visual Search, Brand Coach,
 * translation, smart suggestions) use real GPT-4o / Vision / Embeddings.
 *
 * Without the key, every helper gracefully falls back to the mocked
 * implementation that ships with the demo. This keeps the UI working
 * for local dev / demos and lets prod swap to real LLM with a single env var.
 *
 * Why an adapter rather than direct SDK calls in each route :
 *  - One place to swap providers (OpenAI → Anthropic → DeepL → Mistral…)
 *  - One place to add caching, retries, rate-limit handling, cost tracking
 *  - Type-safe surface for the rest of the app
 */

export const AI_ENABLED = Boolean(process.env.OPENAI_API_KEY);

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
const VISION_MODEL = process.env.OPENAI_VISION_MODEL ?? "gpt-4o";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ChatContent[];
}

interface ChatContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: { url: string };
}

interface CompletionOptions {
  /** Override default model. Use VISION_MODEL for image-aware calls. */
  model?: string;
  temperature?: number;
  /** Force JSON output via `response_format: { type: "json_object" }`. */
  json?: boolean;
  /** Max output tokens. Default 800. */
  maxTokens?: number;
}

/**
 * Low-level chat completion. Returns the raw assistant message content
 * (string), or `null` if AI is disabled / failed. Callers decide how to
 * parse it (JSON or plain text).
 */
export async function chatComplete(
  messages: ChatMessage[],
  opts: CompletionOptions = {}
): Promise<string | null> {
  if (!AI_ENABLED) return null;
  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        messages,
        temperature: opts.temperature ?? 0.4,
        max_tokens: opts.maxTokens ?? 800,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      console.error("[ai.chatComplete]", res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) {
    console.error("[ai.chatComplete]", e);
    return null;
  }
}

/**
 * High-level helper: parse a JSON response with a schema, falling back to
 * a default value on failure.
 */
export async function chatCompleteJson<T>(
  messages: ChatMessage[],
  fallback: T,
  opts: Omit<CompletionOptions, "json"> = {}
): Promise<T> {
  const raw = await chatComplete(messages, { ...opts, json: true });
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ============================================================
// USE-CASE HELPERS
// ============================================================

export interface VisionAnalysisResult {
  category:
    | "mode"
    | "maison"
    | "electronique"
    | "beaute"
    | "sport"
    | "bijouterie"
    | "enfant"
    | "cuisine"
    | "general";
  categoryLabel: string;
  detectedAttributes: string[];
  estimatedFactoryPrice: { min: number; max: number };
  estimatedComplexity: number;
  recommendedRegion: string;
  confidence: number;
}

/**
 * Vision-powered product analysis. Pass a publicly reachable image URL
 * (CDN, /uploads, etc.). Returns `null` if AI disabled or request failed —
 * caller should use the deterministic mock in that case.
 */
export async function analyzeProductImage(
  imageUrl: string,
  hint?: string
): Promise<VisionAnalysisResult | null> {
  if (!AI_ENABLED) return null;

  const systemPrompt = `You are a sourcing expert helping European e-commerce founders
find Chinese suppliers via Sourcey. Analyze a product image and respond
in French. Always answer in JSON matching this schema:
{
  "category": "mode|maison|electronique|beaute|sport|bijouterie|enfant|cuisine|general",
  "categoryLabel": "Mode & textile|Maison & décoration|...",
  "detectedAttributes": ["string", "string", ...],  // 3-5 short technical observations
  "estimatedFactoryPrice": { "min": number, "max": number },  // EUR FOB unit price
  "estimatedComplexity": 1-5,
  "recommendedRegion": "Yiwu|Guangzhou|Shenzhen|Shanghai|Ningbo",
  "confidence": 0-100
}`;

  const userContent: ChatContent[] = [
    {
      type: "text",
      text: hint
        ? `Indice utilisateur : "${hint}". Analyse l'image et réponds en JSON.`
        : "Analyse cette image produit et réponds en JSON.",
    },
    { type: "image_url", image_url: { url: imageUrl } },
  ];

  return chatCompleteJson<VisionAnalysisResult | null>(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    null,
    { model: VISION_MODEL, temperature: 0.3 }
  );
}

/**
 * Translate a single message between FR and ZH.
 */
export async function translateText(
  text: string,
  target: "fr" | "zh"
): Promise<string | null> {
  if (!AI_ENABLED) return null;
  const targetLabel = target === "zh" ? "Chinese (Simplified)" : "French";
  return chatComplete(
    [
      {
        role: "system",
        content: `Translate the user's message into ${targetLabel}. Preserve tone, emojis, and numbers exactly. Output only the translation, no preamble.`,
      },
      { role: "user", content: text },
    ],
    { temperature: 0.2, maxTokens: 400 }
  );
}

/**
 * Smart reply suggestions for a thread. Returns 3 short reply options.
 */
export async function generateSmartReplies(
  conversation: { senderType: string; content: string }[],
  context: { agentName?: string | null; convType: "agent" | "support" }
): Promise<string[] | null> {
  if (!AI_ENABLED) return null;
  const transcript = conversation
    .slice(-6)
    .map((m) => `[${m.senderType}] ${m.content}`)
    .join("\n");
  const prefix =
    context.convType === "agent"
      ? `Tu es un e-commerçant français qui discute avec ${context.agentName ?? "ton agent en Chine"}.`
      : `Tu es un utilisateur qui parle au support Sourcey.`;
  const out = await chatCompleteJson<{ suggestions?: string[] } | null>(
    [
      {
        role: "system",
        content: `${prefix}
Génère 3 réponses courtes (10-20 mots max) pertinentes pour ce que vient de dire l'interlocuteur.
Réponds en JSON: { "suggestions": ["reply1", "reply2", "reply3"] }`,
      },
      { role: "user", content: transcript },
    ],
    null,
    { temperature: 0.7, maxTokens: 300 }
  );
  return out?.suggestions ?? null;
}

export interface BrandCoachAdvice {
  positioning: {
    archetype: string;
    toneOfVoice: string[];
    visualMood: string[];
    competitorReference: string;
    uniqueAngle: string;
  };
  detectedCategory: string;
  strategy: { title: string; text: string; priority: "now" | "next" | "later" }[];
}

/**
 * Brand coach: analyzes a brand brief and returns positioning + 5-step strategy.
 */
export async function brandCoach(
  description: string,
  extras: { audience?: string; budget?: string; goal?: string }
): Promise<BrandCoachAdvice | null> {
  if (!AI_ENABLED) return null;
  return chatCompleteJson<BrandCoachAdvice | null>(
    [
      {
        role: "system",
        content: `You are a senior DTC brand strategist for French e-commerce founders.
Given a brand brief, return JSON with:
{
  "positioning": {
    "archetype": "Premium | Éco | Minimaliste | Bold | DTC accessible | ...",
    "toneOfVoice": ["string", "string", "string"],
    "visualMood": ["string", "string", "string"],
    "competitorReference": "3 brand names, comma separated",
    "uniqueAngle": "one sentence in French"
  },
  "detectedCategory": "mode|maison|electronique|beaute|sport|bijouterie|enfant|cuisine",
  "strategy": [
    { "title": "string in French", "text": "1-2 sentences in French", "priority": "now|next|later" },
    ...5 items
  ]
}`,
      },
      {
        role: "user",
        content: `BRIEF: ${description}\nPUBLIC: ${extras.audience ?? "—"}\nBUDGET: ${extras.budget ?? "—"}\nOBJECTIF: ${extras.goal ?? "—"}`,
      },
    ],
    null,
    { temperature: 0.6, maxTokens: 1200 }
  );
}
