import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseProfileUrl } from "@/lib/url-parser";
import { fetchTikTokPublic } from "@/lib/og-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

/**
 * POST /api/profile/preview
 * Body : { url: string }
 *
 * Scrape une URL TikTok publiquement, renvoie les données sans rien
 * sauvegarder. Utilisé par l'analyseur rapide du dashboard pour vérifier
 * un profil avant de décider de le DM ou pas.
 */
export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = (await req.json()) as { url?: string };
    if (!body.url?.trim()) {
      return NextResponse.json({ error: "URL requise" }, { status: 400 });
    }

    const parsed = parseProfileUrl(body.url);
    if (!parsed || parsed.platform !== "tiktok") {
      return NextResponse.json(
        { error: "URL TikTok valide requise (ex: tiktok.com/@charlidamelio)" },
        { status: 400 }
      );
    }

    // Check si déjà en base — bonus info pour le frontend
    const { data: existing } = await supabase
      .from("influencers")
      .select("id, display_name, global_status, created_at")
      .eq("handle_tiktok", parsed.handle)
      .maybeSingle();

    const data = await fetchTikTokPublic(parsed.url, 8000);

    return NextResponse.json({
      ok: true,
      handle: parsed.handle,
      url: parsed.url,
      ...data,
      alreadyInDb: existing
        ? {
            id: existing.id,
            display_name: existing.display_name,
            global_status: existing.global_status,
            created_at: existing.created_at,
          }
        : null,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    console.error("[preview]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
