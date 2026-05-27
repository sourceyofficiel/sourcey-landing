/**
 * Fetch d'OpenGraph image (le og:image meta tag) depuis une URL.
 *
 * Sert à récupérer automatiquement la photo de profil d'un influenceur
 * quand on colle son URL TikTok / Snapchat / Instagram.
 *
 * Fonctionne pour :
 *   - TikTok (90% des cas, parfois bloqué par captcha)
 *   - Snapchat (oui)
 *   - Instagram (souvent bloqué — exige session connectée)
 *
 * Quand ça échoue, on retourne null et l'app utilise le fallback gradient.
 */

export async function fetchOgImage(
  url: string,
  timeoutMs = 6000
): Promise<string | null> {
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

    if (!res.ok) return null;
    const html = await res.text();

    // Patterns possibles pour og:image / twitter:image
    const patterns = [
      /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i,
      /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i,
      /<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image["']/i,
      // TikTok-specific : avatar JSON-LD or schema.org
      /"avatarLarger"\s*:\s*"([^"]+)"/i,
      /"avatar_thumb"\s*:\s*\{\s*"url_list"\s*:\s*\[\s*"([^"]+)"/i,
    ];

    for (const re of patterns) {
      const match = html.match(re);
      if (match?.[1]) {
        // Décode les entités HTML basiques + slashes échappés JSON
        return match[1]
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/\\u002F/g, "/")
          .replace(/\\\//g, "/");
      }
    }

    return null;
  } catch {
    return null;
  }
}
