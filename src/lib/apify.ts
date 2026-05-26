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
  // Sur la base des 10 derniers posts si disponibles
  engagementRate: number | null; // %
  averageLikes: number | null;
  averageComments: number | null;
  averageViews: number | null;
  // Posts récents pour donner du contexte à l'IA
  recentPosts: Array<{
    caption: string;
    likes: number;
    comments: number;
    views?: number;
    url?: string;
    postedAt?: string;
  }>;
  // Détection email/contact dans la bio (très souvent les créateurs mettent leur email pour les marques)
  contactEmail: string | null;
  raw: unknown;
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

  const run = await client.actor(TIKTOK_ACTOR).call(
    {
      profiles: [cleaned],
      resultsPerPage: 10,
      shouldDownloadCovers: false,
      shouldDownloadSlideshowImages: false,
      shouldDownloadVideos: false,
    },
    { waitSecs: 90 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  if (items.length === 0) {
    throw new Error(
      `Profil TikTok @${cleaned} introuvable ou privé. Vérifie l'orthographe du handle.`
    );
  }

  // L'actor renvoie un objet par post ; on en extrait les infos profil + on
  // agrège les engagements. Le profil est dans authorMeta de chaque post.
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
  const recentPosts = posts.slice(0, 10).map((p) => ({
    caption: p.text ?? "",
    likes: p.diggCount ?? 0,
    comments: p.commentCount ?? 0,
    views: p.playCount ?? 0,
    url: p.webVideoUrl,
    postedAt: p.createTime ? new Date(p.createTime * 1000).toISOString() : undefined,
  }));

  const totalLikes = recentPosts.reduce((s, p) => s + p.likes, 0);
  const totalComments = recentPosts.reduce((s, p) => s + p.comments, 0);
  const totalViews = recentPosts.reduce((s, p) => s + (p.views ?? 0), 0);
  const avgLikes = recentPosts.length > 0 ? totalLikes / recentPosts.length : null;
  const avgComments = recentPosts.length > 0 ? totalComments / recentPosts.length : null;
  const avgViews = recentPosts.length > 0 ? totalViews / recentPosts.length : null;

  // Engagement rate : (avg likes + avg comments) / followers * 100
  const engagementRate =
    followers > 0 && avgLikes != null && avgComments != null
      ? Math.round(((avgLikes + avgComments) / followers) * 10000) / 100
      : null;

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
    recentPosts,
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
      resultsLimit: 10,
    },
    { waitSecs: 120 }
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
  const recentPosts = (profile.latestPosts ?? []).slice(0, 10).map((p) => ({
    caption: p.caption ?? "",
    likes: p.likesCount ?? 0,
    comments: p.commentsCount ?? 0,
    views: p.videoViewCount,
    url: p.url,
    postedAt: p.timestamp,
  }));

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
    recentPosts,
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
