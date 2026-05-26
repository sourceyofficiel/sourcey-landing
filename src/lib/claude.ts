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

export interface SponsoredPostAnalysis {
  url: string | null;
  brand: string | null;
  caption_preview: string;
  performance_vs_organic: "above" | "average" | "below";
  views: number | null;
  likes: number;
  comments: number;
  posted_at: string | null;
  // Avis Claude sur la qualité de l'intégration
  quality: "natural" | "average" | "forced";
  notes: string;
}

export interface TopPostAnalysis {
  url: string | null;
  caption_preview: string;
  views: number | null;
  likes: number;
  comments: number;
  posted_at: string | null;
  // Pourquoi ça a marché selon Claude
  reason_for_success: string;
}

export interface ProfileAnalysis {
  detectedNiche: string;
  estimatedEngagementRate: number;
  audienceAge: Record<string, number>;
  audienceGender: Record<string, number>;
  audienceCountry: Record<string, number>;
  profitabilityScore: number; // 0-100
  recommendation: "priority" | "contact" | "avoid";
  reasoning: string;
  // NOUVEAUX champs enrichis
  detectedBrandPartners: string[];
  sponsoredPosts: SponsoredPostAnalysis[];
  topPosts: TopPostAnalysis[];
  sponsoredVsOrganic: {
    sponsored_count: number;
    sponsored_avg_views: number | null;
    organic_avg_views: number | null;
    verdict: string; // ex "Ses sponsos sous-performent de 35% vs son organique"
  } | null;
  postingPattern: {
    posts_per_week: number;
    consistency: "régulier" | "irrégulier" | "rare";
    activity_30d_summary: string;
  };
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
Tu reçois des stats détaillées sur un profil TikTok/Instagram (followers, posts récents, posts pré-flaggés comme potentielle pub via heuristique simple) et tu produis une analyse COMPLÈTE.

Tu réponds UNIQUEMENT en JSON valide, avec ce schéma exact (aucun champ supplémentaire, aucun markdown, juste le JSON brut) :

{
  "detected_niche": "string (ex: 'mode féminine streetwear', 'tech gadgets', 'humour relationnel')",
  "estimated_engagement_rate": number (taux d'engagement estimé en %, ex 4.2),
  "audience_age": { "13-17": number, "18-24": number, "25-34": number, "35-44": number, "45+": number } (proportions qui somment à 1),
  "audience_gender": { "male": number, "female": number, "other": number } (proportions qui somment à 1),
  "audience_country": { "FR": number, "BE": number, "CH": number, "MA": number, "DZ": number, "other": number } (proportions qui somment à 1),
  "profitability_score": number (0 à 100, basé sur l'adéquation niche + audience + engagement + qualité historique sponso avec la marque cible),
  "recommendation": "priority" | "contact" | "avoid",
  "reasoning": "string (3-5 phrases max, en français, qui explique le score et la reco)",

  "detected_brand_partners": ["nom_marque1", "nom_marque2", ...] (3-6 max — marques avec lesquelles il a clairement déjà bossé, basé sur les posts; renvoie [] si aucune détectée),

  "sponsored_posts": [
    {
      "url": "string ou null",
      "brand": "nom de la marque ou null si pas clair",
      "caption_preview": "extrait de la caption (60 chars max)",
      "performance_vs_organic": "above" | "average" | "below",
      "views": number ou null,
      "likes": number,
      "comments": number,
      "posted_at": "string ISO ou null",
      "quality": "natural" | "average" | "forced",
      "notes": "1-2 phrases sur l'intégration de la pub dans son contenu"
    },
    ...
  ] (jusqu'à 5 posts sponsorisés détectés, [] sinon),

  "top_posts": [
    {
      "url": "string ou null",
      "caption_preview": "extrait (60 chars max)",
      "views": number ou null,
      "likes": number,
      "comments": number,
      "posted_at": "string ISO ou null",
      "reason_for_success": "1 phrase explicative"
    },
    ...
  ] (top 3 posts les plus performants, basés sur engagement total),

  "sponsored_vs_organic": {
    "sponsored_count": number,
    "sponsored_avg_views": number ou null,
    "organic_avg_views": number ou null,
    "verdict": "string (ex: 'Ses pubs sous-performent de 35% vs organique', 'Pubs aussi performantes que l'organique', 'Pas assez de data sponso pour conclure')"
  } ou null si aucune pub détectée,

  "posting_pattern": {
    "posts_per_week": number,
    "consistency": "régulier" | "irrégulier" | "rare",
    "activity_30d_summary": "string (ex: '12 vidéos en 30 jours, 850k vues cumulées, 1 post tous les 2-3 jours')"
  }
}

Critères de scoring :
- "priority" : score ≥ 75, audience FR > 50%, niche très alignée, sponsos passés performants (pas sous-perf)
- "contact" : score 50-74, audience FR > 30%, niche partielle, sponsos OK
- "avoid" : score < 50, sponsos qui sous-perf de >30%, audience non FR ou niche off

IMPORTANT pour les sponsored_posts :
- Le système t'envoie une liste "SUSPECTED_SPONSORED" (heuristique côté code). Confirme/infirme et complète avec ton analyse fine de la caption.
- Identifie la marque par le @mention dominant ou le nom dans la caption.
- Compare views à la médiane organique pour "performance_vs_organic".
- "quality" = "natural" si bien intégré au content habituel, "forced" si placement maladroit.`;

  const userPrompt = buildAnalysisUserPrompt(profile, brand);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 3500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
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
    detectedBrandPartners: Array.isArray(parsed.detected_brand_partners)
      ? (parsed.detected_brand_partners as string[]).slice(0, 6)
      : [],
    sponsoredPosts: Array.isArray(parsed.sponsored_posts)
      ? (parsed.sponsored_posts as SponsoredPostAnalysis[]).slice(0, 5)
      : [],
    topPosts: Array.isArray(parsed.top_posts)
      ? (parsed.top_posts as TopPostAnalysis[]).slice(0, 3)
      : [],
    sponsoredVsOrganic:
      (parsed.sponsored_vs_organic as ProfileAnalysis["sponsoredVsOrganic"]) ??
      null,
    postingPattern:
      (parsed.posting_pattern as ProfileAnalysis["postingPattern"]) ?? {
        posts_per_week: 0,
        consistency: "rare",
        activity_30d_summary: "Pas assez de data",
      },
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

  lines.push(`# MARQUE CIBLE`);
  lines.push(`Nom : ${brand.name}`);
  if (brand.description) lines.push(`Pitch : ${brand.description}`);
  if (brand.brandContext) lines.push(`Contexte : ${brand.brandContext}`);
  lines.push("");

  lines.push(`# PROFIL À ANALYSER`);
  lines.push(`Plateforme : ${profile.platform}`);
  lines.push(`Handle : @${profile.handle}`);
  if (profile.displayName) lines.push(`Nom : ${profile.displayName}`);
  if (profile.bio) lines.push(`Bio : ${profile.bio}`);
  lines.push(`Followers : ${profile.followersCount.toLocaleString()}`);
  if (profile.followingCount > 0)
    lines.push(`Following : ${profile.followingCount.toLocaleString()}`);
  if (profile.postsCount > 0) lines.push(`Posts totaux : ${profile.postsCount}`);
  if (profile.verified) lines.push(`Compte vérifié : oui`);
  if (profile.engagementRate != null)
    lines.push(`Taux d'engagement observé : ${profile.engagementRate}%`);
  if (profile.averageLikes != null)
    lines.push(`Likes moyens : ${Math.round(profile.averageLikes).toLocaleString()}`);
  if (profile.averageComments != null)
    lines.push(`Commentaires moyens : ${Math.round(profile.averageComments).toLocaleString()}`);
  if (profile.averageViews != null && profile.averageViews > 0)
    lines.push(`Vues moyennes globales : ${Math.round(profile.averageViews).toLocaleString()}`);
  lines.push("");

  // Activité 30j
  lines.push(`# ACTIVITÉ 30 DERNIERS JOURS`);
  lines.push(`Posts publiés : ${profile.activity.postsLast30d}`);
  lines.push(`Total vues : ${profile.activity.totalViews30d.toLocaleString()}`);
  lines.push(`Total likes : ${profile.activity.totalLikes30d.toLocaleString()}`);
  if (profile.activity.avgViewsPerPost != null)
    lines.push(`Vues moyennes (30j) : ${Math.round(profile.activity.avgViewsPerPost).toLocaleString()}`);
  if (profile.activity.medianViewsPerPost != null)
    lines.push(`Vues médianes (30j) : ${Math.round(profile.activity.medianViewsPerPost).toLocaleString()}`);
  lines.push(`Fréquence : ${profile.activity.postsPerWeek} posts/semaine`);
  lines.push("");

  // Suspected sponsored — l'heuristique côté Node pré-flagge
  if (profile.suspectedSponsoredPosts.length > 0) {
    lines.push(`# SUSPECTED_SPONSORED (posts pré-flaggés comme potentielle pub via heuristique)`);
    lines.push(`Le système a détecté ${profile.suspectedSponsoredPosts.length} posts avec signaux de sponsorisation (hashtags #ad, codes promos, mentions de marques). Confirme/infirme et identifie les marques.`);
    for (const p of profile.suspectedSponsoredPosts.slice(0, 8)) {
      const cap = p.caption.slice(0, 250).replace(/\s+/g, " ");
      const signals = p.sponsorshipSignals;
      const flags = signals
        ? [
            signals.hasAdHashtag ? "hashtag-ad" : null,
            signals.hasPromoCode ? "code-promo" : null,
            signals.mentionedBrands.length > 0
              ? `mentions:${signals.mentionedBrands.slice(0, 3).join(",")}`
              : null,
          ]
            .filter(Boolean)
            .join("|")
        : "";
      lines.push(
        `- [${flags}] "${cap}" — ${p.likes.toLocaleString()} likes / ${p.comments.toLocaleString()} comments${p.views ? ` / ${p.views.toLocaleString()} vues` : ""} | URL: ${p.url ?? "n/a"} | posté: ${p.postedAt ?? "?"}`
      );
    }
    lines.push("");
  }

  // Top posts
  if (profile.topPosts.length > 0) {
    lines.push(`# TOP_POSTS (5 meilleures perfs récentes)`);
    for (const p of profile.topPosts) {
      const cap = p.caption.slice(0, 200).replace(/\s+/g, " ");
      lines.push(
        `- "${cap}" — ${p.likes.toLocaleString()} likes / ${p.comments.toLocaleString()} comments${p.views ? ` / ${p.views.toLocaleString()} vues` : ""} | URL: ${p.url ?? "n/a"} | posté: ${p.postedAt ?? "?"}`
      );
    }
    lines.push("");
  }

  // Recent posts (sans ceux déjà listés en top/sponsored)
  const otherPosts = profile.recentPosts
    .filter(
      (p) =>
        !profile.topPosts.some((t) => t.url === p.url) &&
        !profile.suspectedSponsoredPosts.some((s) => s.url === p.url)
    )
    .slice(0, 10);
  if (otherPosts.length > 0) {
    lines.push(`# AUTRES POSTS RÉCENTS (échantillon)`);
    for (const p of otherPosts) {
      const cap = p.caption.slice(0, 150).replace(/\s+/g, " ");
      lines.push(
        `- "${cap}" — ${p.likes.toLocaleString()} likes / ${p.comments.toLocaleString()} comments${p.views ? ` / ${p.views.toLocaleString()} vues` : ""}`
      );
    }
    lines.push("");
  }

  lines.push("Analyse complètement ce profil et renvoie le JSON demandé. Sois lucide et précis.");
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
