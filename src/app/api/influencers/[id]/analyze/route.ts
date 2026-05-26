import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeProfile } from "@/lib/apify";
import { analyzeProfile } from "@/lib/claude";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/influencers/[id]/analyze
 * Body: { brandId: string, force?: boolean }
 *
 * Workflow :
 *   1. Cache check : si analyse déjà existante pour ce (influencer, brand)
 *      datée < 7j et force != true, on renvoie l'ancienne
 *   2. Sinon : re-scrape le profil + envoie à Claude + sauvegarde ai_analyses
 *   3. Update aussi influencers.followers_count + engagement_rate si plus récents
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = (await req.json()) as { brandId?: string; force?: boolean };
    if (!body.brandId) {
      return NextResponse.json({ error: "brandId requis" }, { status: 400 });
    }

    const [{ data: influencer }, { data: brand }] = await Promise.all([
      supabase.from("influencers").select("*").eq("id", params.id).maybeSingle(),
      supabase.from("brands").select("*").eq("id", body.brandId).maybeSingle(),
    ]);

    if (!influencer) {
      return NextResponse.json(
        { error: "Influenceur introuvable" },
        { status: 404 }
      );
    }
    if (!brand) {
      return NextResponse.json({ error: "Marque introuvable" }, { status: 404 });
    }

    // Cache check (7 jours)
    if (!body.force) {
      const { data: cached } = await supabase
        .from("ai_analyses")
        .select("*")
        .eq("influencer_id", influencer.id)
        .eq("target_brand_id", brand.id)
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cached) {
        return NextResponse.json({ ok: true, cached: true, analysis: cached });
      }
    }

    // Détermine la plateforme à scrape (prio TikTok, sinon Instagram)
    const platform: "tiktok" | "instagram" = influencer.handle_tiktok
      ? "tiktok"
      : "instagram";
    const handle = influencer.handle_tiktok ?? influencer.handle_instagram;
    if (!handle) {
      return NextResponse.json(
        {
          error:
            "Cet influenceur n'a pas de handle TikTok/Instagram. Impossible de re-scraper.",
        },
        { status: 400 }
      );
    }

    // Re-scrape pour avoir les données fraîches
    const scraped = await scrapeProfile(platform, handle);

    // Update influencer si les chiffres ont changé
    await supabase
      .from("influencers")
      .update({
        followers_count: scraped.followersCount,
        engagement_rate: scraped.engagementRate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", influencer.id);

    // Analyse Claude
    const analysis = await analyzeProfile(scraped, {
      name: brand.name,
      description: brand.description,
      brandContext: brand.brand_context,
    });

    // Sauvegarde
    const { data: saved, error } = await supabase
      .from("ai_analyses")
      .insert({
        influencer_id: influencer.id,
        target_brand_id: brand.id,
        detected_niche: analysis.detectedNiche,
        estimated_engagement_rate: analysis.estimatedEngagementRate,
        audience_age: analysis.audienceAge,
        audience_gender: analysis.audienceGender,
        audience_country: analysis.audienceCountry,
        profitability_score: analysis.profitabilityScore,
        recommendation: analysis.recommendation,
        reasoning: analysis.reasoning,
        raw_response: analysis.rawResponse,
        model: "claude-sonnet-4-5",
        input_tokens: analysis.inputTokens,
        output_tokens: analysis.outputTokens,
      })
      .select()
      .single();

    if (error) {
      console.error("[analyze] insert error", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await logActivity("influencer.analyze", influencer.id, {
      brandId: brand.id,
      score: analysis.profitabilityScore,
      recommendation: analysis.recommendation,
    });

    return NextResponse.json({
      ok: true,
      cached: false,
      analysis: saved,
      scrapedData: {
        bio: scraped.bio,
        avatarUrl: scraped.avatarUrl,
        verified: scraped.verified,
        followersCount: scraped.followersCount,
        engagementRate: scraped.engagementRate,
        averageLikes: scraped.averageLikes,
        averageComments: scraped.averageComments,
        averageViews: scraped.averageViews,
        recentPosts: scraped.recentPosts.slice(0, 5),
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("[analyze]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
