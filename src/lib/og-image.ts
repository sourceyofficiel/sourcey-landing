/**
 * Scraping public de pages TikTok : extrait photo de profil, nb de followers,
 * nom complet, bio. Tout depuis le HTML public (pas besoin d'Apify).
 *
 * Marche en lisant le JSON inline embarqué par TikTok dans le HTML
 * (script SIGI_STATE / __UNIVERSAL_DATA_FOR_REHYDRATION__).
 */

export interface PublicProfileData {
  avatarUrl: string | null;
  followersCount: number | null;
  displayName: string | null;
  bio: string | null;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/g, "/")
    .replace(/&#39;/g, "'")
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/\\n/g, "\n");
}

/**
 * Récupère les données publiques d'un profil TikTok depuis son URL.
 * Si le fetch échoue ou est bloqué, on retourne des null partout.
 */
export async function fetchTikTokPublic(
  url: string,
  timeoutMs = 8000
): Promise<PublicProfileData> {
  const empty: PublicProfileData = {
    avatarUrl: null,
    followersCount: null,
    displayName: null,
    bio: null,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    if (!res.ok) return empty;
    const html = await res.text();

    // 1. Avatar — priorité avatarLarger (qualité HD), sinon og:image
    let avatarUrl: string | null = null;
    const avatarPatterns = [
      /"avatarLarger"\s*:\s*"([^"]+)"/,
      /"avatarMedium"\s*:\s*"([^"]+)"/,
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
    ];
    for (const re of avatarPatterns) {
      const m = html.match(re);
      if (m?.[1]) {
        avatarUrl = decodeHtml(m[1]);
        break;
      }
    }

    // 2. Followers — TikTok embarque le count dans plusieurs JSON inline
    let followersCount: number | null = null;
    const followerPatterns = [
      /"followerCount"\s*:\s*(\d+)/,
      /"stats"\s*:\s*\{[^}]*"followerCount"\s*:\s*(\d+)/,
    ];
    for (const re of followerPatterns) {
      const m = html.match(re);
      if (m?.[1]) {
        followersCount = parseInt(m[1], 10);
        break;
      }
    }

    // 3. Nom complet (nickname)
    let displayName: string | null = null;
    const nameMatch = html.match(/"nickname"\s*:\s*"([^"]+)"/);
    if (nameMatch?.[1]) displayName = decodeHtml(nameMatch[1]);

    // 4. Bio (signature)
    let bio: string | null = null;
    const bioMatch = html.match(/"signature"\s*:\s*"([^"]+)"/);
    if (bioMatch?.[1]) bio = decodeHtml(bioMatch[1]);

    return { avatarUrl, followersCount, displayName, bio };
  } catch {
    return empty;
  }
}

/**
 * Compat : pour les callers qui n'attendent que l'avatar.
 */
export async function fetchOgImage(
  url: string,
  timeoutMs = 6000
): Promise<string | null> {
  const data = await fetchTikTokPublic(url, timeoutMs);
  return data.avatarUrl;
}
