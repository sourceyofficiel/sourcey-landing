/**
 * Parsing d'URLs TikTok et Instagram pour en extraire le handle.
 *
 * Exemples acceptés :
 *   https://www.tiktok.com/@charlidamelio  → { platform: "tiktok", handle: "charlidamelio" }
 *   https://tiktok.com/@khaby.lame         → { platform: "tiktok", handle: "khaby.lame" }
 *   @charlidamelio                         → { platform: "tiktok", handle: "charlidamelio" }
 *   https://instagram.com/zendaya          → { platform: "instagram", handle: "zendaya" }
 *   https://www.instagram.com/zendaya/     → { platform: "instagram", handle: "zendaya" }
 *   instagram.com/zendaya                  → { platform: "instagram", handle: "zendaya" }
 */

export interface ParsedHandle {
  platform: "tiktok" | "instagram" | "youtube";
  handle: string;
  url: string;
}

export function parseProfileUrl(input: string): ParsedHandle | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Handle direct "@xxx" → assume TikTok
  if (/^@[\w.]+$/.test(trimmed)) {
    const handle = trimmed.slice(1);
    return {
      platform: "tiktok",
      handle,
      url: `https://www.tiktok.com/@${handle}`,
    };
  }

  // Préfixe https si absent pour parser
  let urlString = trimmed;
  if (!/^https?:\/\//i.test(urlString)) urlString = `https://${urlString}`;

  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (host.includes("tiktok.com")) {
    const handle = pathParts[0]?.startsWith("@")
      ? pathParts[0].slice(1)
      : pathParts[0];
    if (!handle) return null;
    return {
      platform: "tiktok",
      handle,
      url: `https://www.tiktok.com/@${handle}`,
    };
  }

  if (host.includes("instagram.com")) {
    const handle = pathParts[0];
    if (!handle || handle === "p" || handle === "reel") return null;
    return {
      platform: "instagram",
      handle,
      url: `https://www.instagram.com/${handle}`,
    };
  }

  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    // youtube.com/@name | youtube.com/c/name | youtube.com/channel/...
    let handle = pathParts[0]?.startsWith("@")
      ? pathParts[0].slice(1)
      : pathParts[0] === "c"
        ? pathParts[1]
        : pathParts[0] === "channel"
          ? pathParts[1]
          : pathParts[0];
    if (!handle) return null;
    return {
      platform: "youtube",
      handle,
      url: `https://www.youtube.com/@${handle}`,
    };
  }

  return null;
}
