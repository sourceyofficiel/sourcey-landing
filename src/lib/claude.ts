/**
 * Claude wrapper — analyse de profil influenceur + rédaction de messages
 * d'approche personnalisés.
 *
 * Modèle utilisé : claude-sonnet-4-5 (le plus capable au moment où on écrit).
 * Pricing : ~3$/M input, ~15$/M output → analyse complète ≈ 0.02€.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ScrapedProfile } from "@/lib/apify";

const MODEL = "claude-sonnet-4-5";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === "placeholder") {
    throw new Error(
      "ANTHROPIC_API_KEY manquante. Récupère-la sur console.anthropic.com → API Keys et ajoute-la dans tes env vars Vercel."
    );
  }
  return new Anthropic({ apiKey });
}

/* ============================================================
   ANALYSE DE PROFIL
   ============================================================ */

export interface ProfileAnalysis {
  detectedNiche: string;
  estimatedEngagementRate: number;
  audienceAge: Record<string, number>;
  audienceGender: Record<string, number>;
  audienceCountry: Record<string, number>;
  profitabilityScore: number; // 0-100
  recommendation: "priority" | "contact" | "avoid";
  reasoning: string;
  inputTokens: number;
  outputTokens: number;
  rawResponse: unknown;
}

export interface BrandTarget {
  name: string;
  description: string | null;
  brandContext: string | null;
}

export async function analyzeProfile(
  profile: ScrapedProfile,
  brand: BrandTarget
): Promise<ProfileAnalysis> {
  const client = getClient();

  const systemPrompt = `Tu es un expert en marketing d'influence et en analyse de créateurs pour des marques e-commerce.
Tu analyses un profil TikTok/Instagram et tu donnes une note de rentabilité pour une marque précise.

Tu réponds UNIQUEMENT en JSON valide, avec ce schéma exact (aucun champ supplémentaire, aucun markdown autour, juste le JSON brut) :

{
  "detected_niche": "string (ex: 'mode féminine streetwear', 'tech gadgets', 'humour relationnel', 'cuisine rapide')",
  "estimated_engagement_rate": number (taux d'engagement estimé en %, ex 4.2),
  "audience_age": { "13-17": number, "18-24": number, "25-34": number, "35-44": number, "45+": number } (proportions qui somment à 1),
  "audience_gender": { "male": number, "female": number, "other": number } (proportions qui somment à 1),
  "audience_country": { "FR": number, "BE": number, "CH": number, "MA": number, "DZ": number, "other": number } (proportions qui somment à 1),
  "profitability_score": number (0 à 100, basé sur l'adéquation niche + audience + engagement avec la marque cible),
  "recommendation": "priority" | "contact" | "avoid",
  "reasoning": "string (3-5 phrases max, en français, qui explique le score et la reco)"
}

Critères de recommendation :
- "priority" : score ≥ 75, audience FR > 50%, niche très alignée avec la marque
- "contact" : score 50-74, ou audience FR > 30%, niche partiellement alignée
- "avoid" : score < 50, ou bot suspect, ou niche complètement off

Sois lucide : si les engagements sont faibles vs la fanbase (sous-engagement = bots), pénalise. Si l'audience est principalement non francophone et que la marque vend en France, pénalise. Si la niche n'a aucun rapport avec la marque, pénalise fort.`;

  const userPrompt = buildAnalysisUserPrompt(profile, brand);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  // Robustesse : on retire les éventuelles balises ```json / ``` si Claude triche
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Claude n'a pas renvoyé un JSON valide. Réponse brute :\n${text.slice(0, 500)}`
    );
  }

  return {
    detectedNiche: String(parsed.detected_niche ?? "non identifiée"),
    estimatedEngagementRate: Number(parsed.estimated_engagement_rate ?? 0),
    audienceAge: (parsed.audience_age as Record<string, number>) ?? {},
    audienceGender: (parsed.audience_gender as Record<string, number>) ?? {},
    audienceCountry: (parsed.audience_country as Record<string, number>) ?? {},
    profitabilityScore: Math.max(
      0,
      Math.min(100, Number(parsed.profitability_score ?? 0))
    ),
    recommendation:
      (parsed.recommendation as "priority" | "contact" | "avoid") ?? "contact",
    reasoning: String(parsed.reasoning ?? ""),
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    rawResponse: parsed,
  };
}

function buildAnalysisUserPrompt(
  profile: ScrapedProfile,
  brand: BrandTarget
): string {
  const lines: string[] = [];

  lines.push(`MARQUE CIBLE : ${brand.name}`);
  if (brand.description) lines.push(`Description : ${brand.description}`);
  if (brand.brandContext) lines.push(`Contexte : ${brand.brandContext}`);
  lines.push("");

  lines.push(`PROFIL À ANALYSER :`);
  lines.push(`Plateforme : ${profile.platform}`);
  lines.push(`Handle : @${profile.handle}`);
  if (profile.displayName) lines.push(`Nom : ${profile.displayName}`);
  if (profile.bio) lines.push(`Bio : ${profile.bio}`);
  lines.push(`Followers : ${profile.followersCount.toLocaleString()}`);
  if (profile.followingCount > 0)
    lines.push(`Following : ${profile.followingCount.toLocaleString()}`);
  if (profile.postsCount > 0) lines.push(`Posts : ${profile.postsCount}`);
  if (profile.verified) lines.push(`Compte vérifié : oui`);
  if (profile.engagementRate != null)
    lines.push(`Taux d'engagement observé (10 derniers posts) : ${profile.engagementRate}%`);
  if (profile.averageLikes != null)
    lines.push(`Likes moyens : ${Math.round(profile.averageLikes).toLocaleString()}`);
  if (profile.averageComments != null)
    lines.push(`Commentaires moyens : ${Math.round(profile.averageComments).toLocaleString()}`);
  if (profile.averageViews != null && profile.averageViews > 0)
    lines.push(`Vues moyennes : ${Math.round(profile.averageViews).toLocaleString()}`);
  lines.push("");

  if (profile.recentPosts.length > 0) {
    lines.push(`DERNIERS POSTS (extraits) :`);
    for (const p of profile.recentPosts.slice(0, 8)) {
      const cap = p.caption.slice(0, 200).replace(/\s+/g, " ");
      lines.push(
        `- "${cap}" — ${p.likes.toLocaleString()} likes / ${p.comments.toLocaleString()} commentaires${
          p.views ? ` / ${p.views.toLocaleString()} vues` : ""
        }`
      );
    }
    lines.push("");
  }

  lines.push("Analyse ce profil et renvoie le JSON demandé.");
  return lines.join("\n");
}

/* ============================================================
   RÉDACTION DE MESSAGE D'APPROCHE PERSONNALISÉ
   ============================================================ */

export interface DraftMessageInput {
  influencerName: string;
  influencerBio: string | null;
  recentPostSample: string | null; // un post récent pour mention perso
  platform: string;
  brand: BrandTarget;
  channel: "email" | "dm_instagram" | "dm_tiktok";
  agentSignature: string;
}

export interface DraftMessageResult {
  subject: string | null;
  body: string;
  inputTokens: number;
  outputTokens: number;
}

export async function draftApproachMessage(
  input: DraftMessageInput
): Promise<DraftMessageResult> {
  const client = getClient();

  const channelGuide = {
    email:
      "Email : ton pro-friendly, ~120 mots, avec sujet accrocheur, formule de politesse FR, signature à la fin.",
    dm_instagram:
      "DM Instagram : ton détendu, 3-4 phrases max, ~80 mots, casual, pas de signature formelle, mais bien identifier la marque.",
    dm_tiktok:
      "DM TikTok : ton très direct, 2-3 phrases, ~60 mots, énergique, on droit au but, juste dire qui on est et ce qu'on propose.",
  }[input.channel];

  const systemPrompt = `Tu rédiges un message d'approche personnalisé d'une marque e-commerce vers un créateur de contenu, en français.

Règles strictes :
- Personnalise réellement (réfère-toi à un élément précis du profil : un post, la bio, la niche). Pas de "j'aime ton contenu" générique.
- N'invente JAMAIS de chiffres précis (ex pas de "ton post à 500k vues" si tu ne sais pas).
- Mentionne la marque par son nom dès le début.
- Sois clair sur la valeur : tu proposes une collaboration (UGC, shoutout, code promo, partenariat).
- Demande une réponse à la fin pour faire avancer la conversation.
- ${channelGuide}

Réponse au format JSON strict :
{
  "subject": "string ou null si ce n'est pas un email",
  "body": "string (le message complet)"
}`;

  const userParts: string[] = [];
  userParts.push(`MARQUE : ${input.brand.name}`);
  if (input.brand.description)
    userParts.push(`Pitch : ${input.brand.description}`);
  if (input.brand.brandContext) userParts.push(`Contexte : ${input.brand.brandContext}`);
  userParts.push("");
  userParts.push(`INFLUENCEUR : ${input.influencerName} (${input.platform})`);
  if (input.influencerBio) userParts.push(`Bio : ${input.influencerBio}`);
  if (input.recentPostSample)
    userParts.push(`Exemple de post récent : "${input.recentPostSample}"`);
  userParts.push("");
  userParts.push(`Canal : ${input.channel}`);
  userParts.push(`Signature à utiliser à la fin : ${input.agentSignature}`);
  userParts.push("");
  userParts.push("Rédige le message en JSON.");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: "user", content: userParts.join("\n") }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: { subject?: string | null; body?: string };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback : on retourne le texte brut comme body
    parsed = { body: text };
  }

  return {
    subject: parsed.subject ?? null,
    body: parsed.body ?? "",
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
