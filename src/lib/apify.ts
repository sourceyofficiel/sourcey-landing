/**
 * Apify wrapper — scrape les profils TikTok et Instagram.
 *
 * On utilise des actors publics éprouvés :
 *   - clockworks/tiktok-profile-scraper   (~$0.001/profile, rapide)
 *   - apify/instagram-profile-scraper     (~$0.05/profile)
 *
 * Le token est lu depuis APIFY_API_TOKEN. Si manquant, on throw un message
 * clair pour que l'utilisateur sache quoi configurer.
 */

import { ApifyClient } from "apify-client";

const TIKTOK_ACTOR = "clockworks~tiktok-profile-scraper";
const INSTAGRAM_ACTOR = "apify~instagram-profile-scraper";

export interface ScrapedPost {
  caption: string;
  likes: number;
  comments: number;
  views?: number;
  shares?: number;
  url?: string;
  postedAt?: string;
  // Score de pertinence (likes + comments + shares relative aux médianes)
  performanceScore?: number;
  // Signaux de sponsorisation pré-détectés côté Apify (à raffiner par Claude)
  sponsorshipSignals?: {
    hasAdHashtag: boolean;
    hasPromoCode: boolean;
    mentionedBrands: string[];
  };
}

export interface ProfileActivity {
  // Stats 30 derniers jours
  totalViews30d: number;
  totalLikes30d: number;
  postsLast30d: number;
  avgViewsPerPost: number | null;
  medianViewsPerPost: number | null;
  postsPerWeek: number;
  // Date du post le + récent / le + ancien dans la fenêtre
  mostRecentPostAt: string | null;
  oldestSampledPostAt: string | null;
}

export interface ScrapedProfile {
  platform: "tiktok" | "instagram";
  handle: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  verified: boolean;
  // Sur la base des posts récupérés
  engagementRate: number | null;
  averageLikes: number | null;
  averageComments: number | null;
  averageViews: number | null;
  // Activité agrégée 30j
  activity: ProfileActivity;
  // Posts triés par date desc — les 30 derniers
  recentPosts: ScrapedPost[];
  // Top 5 posts par engagement (likes + comments)
  topPosts: ScrapedPost[];
  // Posts pré-flaggés comme potentielle sponsorisation (à confirmer par Claude)
  suspectedSponsoredPosts: ScrapedPost[];
  // Email/contact détecté dans la bio
  contactEmail: string | null;
  raw: unknown;
}

/* ============================================================
   DÉTECTION SPONSORISATION (heuristique côté Node)
   ============================================================ */

const AD_HASHTAGS = [
  "ad", "ads", "publicit", "sponsor", "sponsored", "sponso",
  "partenariat", "partner", "partnership", "collab", "collaboration",
  "promo", "promocode", "codepromo", "discount", "remise",
  "gifted", "cadeau", "offert", "presented",
];

const PROMO_CODE_REGEX = /\b(code|promo|use)\s*[:\-]?\s*[A-Z0-9]{3,15}\b|\b[A-Z0-9]{4,12}\s*=\s*-?\d+%/i;
const MENTION_REGEX = /@([a-zA-Z0-9_.]{2,30})/g;

function detectSponsorshipSignals(caption: string): ScrapedPost["sponsorshipSignals"] {
  const lower = caption.toLowerCase();
  const hasAdHashtag = AD_HASHTAGS.some((tag) =>
    new RegExp(`#${tag}\\b`, "i").test(caption)
  ) || /\b(this is an ad|paid partnership|en partenariat avec)\b/i.test(lower);

  const hasPromoCode = PROMO_CODE_REGEX.test(caption);

  const mentionedBrands: string[] = [];
  let match: RegExpExecArray | null;
  // Reset regex global
  const re = new RegExp(MENTION_REGEX.source, "g");
  while ((match = re.exec(caption)) !== null) {
    const handle = match[1].toLowerCase();
    // Filtre les mentions évidentes non-marque (ex: pote, personne) — on garde large, Claude tranchera
    if (handle.length >= 3 && !mentionedBrands.includes(handle)) {
      mentionedBrands.push(handle);
    }
  }

  return { hasAdHashtag, hasPromoCode, mentionedBrands };
}

function isLikelySponsored(signals: ScrapedPost["sponsorshipSignals"]): boolean {
  if (!signals) return false;
  // Au moins 2 signaux sur 3, OU hashtag #ad explicite
  if (signals.hasAdHashtag) return true;
  if (signals.hasPromoCode && signals.mentionedBrands.length > 0) return true;
  return false;
}

function computeActivity(posts: ScrapedPost[]): ProfileActivity {
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 3600 * 1000;

  const posts30d = posts.filter((p) => {
    if (!p.postedAt) return false;
    return new Date(p.postedAt).getTime() >= monthAgo;
  });

  const totalViews30d = posts30d.reduce((s, p) => s + (p.views ?? 0), 0);
  const totalLikes30d = posts30d.reduce((s, p) => s + p.likes, 0);
  const viewsArr = posts30d.map((p) => p.views ?? 0).filter((v) => v > 0).sort((a, b) => a - b);

  const avg = viewsArr.length > 0 ? viewsArr.reduce((s, v) => s + v, 0) / viewsArr.length : null;
  const median = viewsArr.length > 0 ? viewsArr[Math.floor(viewsArr.length / 2)] : null;

  // Fréquence : si on a la date du plus ancien post de la fenêtre 30j, on calcule
  const sortedDates = posts30d
    .map((p) => p.postedAt!)
    .filter(Boolean)
    .sort();
  const oldest = sortedDates[0] ?? null;
  const newest = sortedDates[sortedDates.length - 1] ?? null;

  let postsPerWeek = 0;
  if (oldest && newest && posts30d.length > 1) {
    const span = (new Date(newest).getTime() - new Date(oldest).getTime()) / (24 * 3600 * 1000);
    const days = Math.max(1, span);
    postsPerWeek = Math.round(((posts30d.length / days) * 7) * 10) / 10;
  } else if (posts30d.length > 0) {
    // Fallback : on assume sur 30j
    postsPerWeek = Math.round(((posts30d.length / 30) * 7) * 10) / 10;
  }

  return {
    totalViews30d,
    totalLikes30d,
    postsLast30d: posts30d.length,
    avgViewsPerPost: avg,
    medianViewsPerPost: median,
    postsPerWeek,
    mostRecentPostAt: newest,
    oldestSampledPostAt: oldest,
  };
}

function performanceScoreOf(post: ScrapedPost): number {
  return post.likes + post.comments * 3 + (post.shares ?? 0) * 5;
}

function getClient(): ApifyClient {
  const token = process.env.APIFY_API_TOKEN;
  if (!token || token === "placeholder") {
    throw new Error(
      "APIFY_API_TOKEN manquante. Récupère-la sur console.apify.com → Settings → Integrations et ajoute-la dans tes env vars Vercel."
    );
  }
  return new ApifyClient({ token });
}

function extractEmail(text: string | null): string | null {
  if (!text) return null;
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0] : null;
}

/**
 * Scrape un profil TikTok via l'actor clockworks. Le résultat varie un peu
 * selon les versions de l'actor — on normalise tout en ScrapedProfile.
 */
export async function scrapeTikTok(handle: string): Promise<ScrapedProfile> {
  const client = getClient();
  const cleaned = handle.replace(/^@/, "");

  // On augmente à 30 posts pour avoir une vraie fenêtre 30 jours + détection
  // sponsorisation fiable + top posts pertinents.
  const run = await client.actor(TIKTOK_ACTOR).call(
    {
      profiles: [cleaned],
      resultsPerPage: 30,
      shouldDownloadCovers: false,
      shouldDownloadSlideshowImages: false,
      shouldDownloadVideos: false,
    },
    { waitSecs: 120 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  if (items.length === 0) {
    throw new Error(
      `Profil TikTok @${cleaned} introuvable ou privé. Vérifie l'orthographe du handle.`
    );
  }

  type TikTokPost = {
    authorMeta?: {
      name?: string;
      nickName?: string;
      signature?: string;
      avatar?: string;
      verified?: boolean;
      fans?: number;
      following?: number;
      heart?: number;
      video?: number;
    };
    text?: string;
    diggCount?: number;
    commentCount?: number;
    playCount?: number;
    shareCount?: number;
    createTime?: number;
    webVideoUrl?: string;
  };

  const posts = items as TikTokPost[];
  const meta = posts[0]?.authorMeta;
  if (!meta) {
    throw new Error(`Profil TikTok @${cleaned} : données auteur manquantes.`);
  }

  const followers = meta.fans ?? 0;

  // Normalisation des posts + détection sponsorisation
  const recentPosts: ScrapedPost[] = posts
    .map((p) => {
      const caption = p.text ?? "";
      const signals = detectSponsorshipSignals(caption);
      return {
        caption,
        likes: p.diggCount ?? 0,
        comments: p.commentCount ?? 0,
        views: p.playCount ?? 0,
        shares: p.shareCount ?? 0,
        url: p.webVideoUrl,
        postedAt: p.createTime
          ? new Date(p.createTime * 1000).toISOString()
          : undefined,
        sponsorshipSignals: signals,
      };
    })
    .sort((a, b) => {
      const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return db - da;
    });

  // Scores de performance pour le tri
  for (const p of recentPosts) p.performanceScore = performanceScoreOf(p);

  const totalLikes = recentPosts.reduce((s, p) => s + p.likes, 0);
  const totalComments = recentPosts.reduce((s, p) => s + p.comments, 0);
  const totalViews = recentPosts.reduce((s, p) => s + (p.views ?? 0), 0);
  const avgLikes =
    recentPosts.length > 0 ? totalLikes / recentPosts.length : null;
  const avgComments =
    recentPosts.length > 0 ? totalComments / recentPosts.length : null;
  const avgViews =
    recentPosts.length > 0 ? totalViews / recentPosts.length : null;

  const engagementRate =
    followers > 0 && avgLikes != null && avgComments != null
      ? Math.round(((avgLikes + avgComments) / followers) * 10000) / 100
      : null;

  const topPosts = [...recentPosts]
    .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))
    .slice(0, 5);

  const suspectedSponsoredPosts = recentPosts.filter((p) =>
    isLikelySponsored(p.sponsorshipSignals)
  );

  const activity = computeActivity(recentPosts);

  return {
    platform: "tiktok",
    handle: cleaned,
    displayName: meta.nickName ?? meta.name ?? null,
    bio: meta.signature ?? null,
    avatarUrl: meta.avatar ?? null,
    profileUrl: `https://www.tiktok.com/@${cleaned}`,
    followersCount: followers,
    followingCount: meta.following ?? 0,
    postsCount: meta.video ?? recentPosts.length,
    verified: meta.verified ?? false,
    engagementRate,
    averageLikes: avgLikes,
    averageComments: avgComments,
    averageViews: avgViews,
    activity,
    recentPosts,
    topPosts,
    suspectedSponsoredPosts,
    contactEmail: extractEmail(meta.signature ?? null),
    raw: meta,
  };
}

/**
 * Scrape un profil Instagram via apify/instagram-profile-scraper.
 */
export async function scrapeInstagram(handle: string): Promise<ScrapedProfile> {
  const client = getClient();
  const cleaned = handle.replace(/^@/, "");

  const run = await client.actor(INSTAGRAM_ACTOR).call(
    {
      usernames: [cleaned],
      resultsLimit: 30,
    },
    { waitSecs: 150 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  if (items.length === 0) {
    throw new Error(
      `Profil Instagram @${cleaned} introuvable ou privé. Vérifie l'orthographe du handle.`
    );
  }

  type IGProfile = {
    username?: string;
    fullName?: string;
    biography?: string;
    profilePicUrl?: string;
    profilePicUrlHD?: string;
    followersCount?: number;
    followsCount?: number;
    postsCount?: number;
    verified?: boolean;
    isBusinessAccount?: boolean;
    businessCategoryName?: string;
    externalUrl?: string;
    latestPosts?: Array<{
      caption?: string;
      likesCount?: number;
      commentsCount?: number;
      videoViewCount?: number;
      url?: string;
      timestamp?: string;
    }>;
  };

  const profile = items[0] as IGProfile;
  const followers = profile.followersCount ?? 0;

  const recentPosts: ScrapedPost[] = (profile.latestPosts ?? [])
    .map((p) => {
      const caption = p.caption ?? "";
      const signals = detectSponsorshipSignals(caption);
      return {
        caption,
        likes: p.likesCount ?? 0,
        comments: p.commentsCount ?? 0,
        views: p.videoViewCount,
        url: p.url,
        postedAt: p.timestamp,
        sponsorshipSignals: signals,
      };
    })
    .sort((a, b) => {
      const da = a.postedAt ? new Date(a.postedAt).getTime() : 0;
      const db = b.postedAt ? new Date(b.postedAt).getTime() : 0;
      return db - da;
    });

  for (const p of recentPosts) p.performanceScore = performanceScoreOf(p);

  const avgLikes =
    recentPosts.length > 0
      ? recentPosts.reduce((s, p) => s + p.likes, 0) / recentPosts.length
      : null;
  const avgComments =
    recentPosts.length > 0
      ? recentPosts.reduce((s, p) => s + p.comments, 0) / recentPosts.length
      : null;
  const avgViews =
    recentPosts.length > 0
      ? recentPosts.reduce((s, p) => s + (p.views ?? 0), 0) / recentPosts.length
      : null;

  const engagementRate =
    followers > 0 && avgLikes != null && avgComments != null
      ? Math.round(((avgLikes + avgComments) / followers) * 10000) / 100
      : null;

  const topPosts = [...recentPosts]
    .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))
    .slice(0, 5);

  const suspectedSponsoredPosts = recentPosts.filter((p) =>
    isLikelySponsored(p.sponsorshipSignals)
  );

  const activity = computeActivity(recentPosts);

  return {
    platform: "instagram",
    handle: cleaned,
    displayName: profile.fullName ?? null,
    bio: profile.biography ?? null,
    avatarUrl: profile.profilePicUrlHD ?? profile.profilePicUrl ?? null,
    profileUrl: `https://www.instagram.com/${cleaned}`,
    followersCount: followers,
    followingCount: profile.followsCount ?? 0,
    postsCount: profile.postsCount ?? 0,
    verified: profile.verified ?? false,
    engagementRate,
    averageLikes: avgLikes,
    averageComments: avgComments,
    averageViews: avgViews,
    activity,
    recentPosts,
    topPosts,
    suspectedSponsoredPosts,
    contactEmail: extractEmail(profile.biography ?? null),
    raw: profile,
  };
}

/**
 * Helper unifié : scrape selon la plateforme.
 */
export async function scrapeProfile(
  platform: "tiktok" | "instagram",
  handle: string
): Promise<ScrapedProfile> {
  if (platform === "tiktok") return scrapeTikTok(handle);
  return scrapeInstagram(handle);
}
