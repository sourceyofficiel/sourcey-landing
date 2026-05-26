import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseProfileUrl } from "@/lib/url-parser";
import { scrapeProfile } from "@/lib/apify";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // Apify peut prendre 60-90s

/**
 * POST /api/influencers/scrape
 * Body: { url: string }
 *
 * Workflow :
 *   1. Parse l'URL → platform + handle
 *   2. Check si l'influenceur existe déjà (par handle_tiktok ou handle_instagram)
 *   3. Sinon scrape via Apify
 *   4. Crée/update la ligne influencers
 *   5. Renvoie l'influenceur créé/trouvé
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
    if (!body.url) {
      return NextResponse.json({ error: "url requise" }, { status: 400 });
    }

    const parsed = parseProfileUrl(body.url);
    if (!parsed) {
      return NextResponse.json(
        {
          error:
            "URL non reconnue. Formats acceptés : tiktok.com/@handle, instagram.com/handle, ou @handle",
        },
        { status: 400 }
      );
    }
    if (parsed.platform === "youtube") {
      return NextResponse.json(
        { error: "YouTube pas encore supporté pour le scraping (bientôt)" },
        { status: 400 }
      );
    }

    // Check si déjà en DB
    const handleField =
      parsed.platform === "tiktok" ? "handle_tiktok" : "handle_instagram";
    const { data: existing } = await supabase
      .from("influencers")
      .select("*")
      .eq(handleField, parsed.handle)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyExists: true,
        influencer: existing,
      });
    }

    // Scrape via Apify
    const scraped = await scrapeProfile(parsed.platform, parsed.handle);

    // Insert
    const insertPayload: Record<string, unknown> = {
      display_name: scraped.displayName ?? scraped.handle,
      profile_url: scraped.profileUrl,
      followers_count: scraped.followersCount,
      engagement_rate: scraped.engagementRate,
      contact_email: scraped.contactEmail,
      notes: scraped.bio ?? null,
      created_by: user.id,
    };
    if (scraped.platform === "tiktok") insertPayload.handle_tiktok = scraped.handle;
    if (scraped.platform === "instagram")
      insertPayload.handle_instagram = scraped.handle;

    const { data: created, error } = await supabase
      .from("influencers")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("[scrape] insert error", error);
      return NextResponse.json(
        { error: `Erreur création : ${error.message}` },
        { status: 500 }
      );
    }

    await logActivity("influencer.add", created.id, {
      platform: scraped.platform,
      handle: scraped.handle,
      followers: scraped.followersCount,
    });

    return NextResponse.json({
      ok: true,
      alreadyExists: false,
      influencer: created,
      scrapedData: {
        bio: scraped.bio,
        avatarUrl: scraped.avatarUrl,
        verified: scraped.verified,
        averageLikes: scraped.averageLikes,
        averageComments: scraped.averageComments,
        averageViews: scraped.averageViews,
        recentPosts: scraped.recentPosts,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("[scrape]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
