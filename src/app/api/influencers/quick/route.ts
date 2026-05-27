import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { parseProfileUrl } from "@/lib/url-parser";
import { fetchOgImage } from "@/lib/og-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Petit overhead pour l'auto-fetch de la photo de profil
export const maxDuration = 15;

/**
 * Mapping bucket de followers → représentation numérique stockée en DB.
 * Le size_tier en DB est auto-calculé via le generated column.
 */
const BUCKET_TO_COUNT: Record<string, number> = {
  small: 50_000, // 0 – 100k → tier "micro"
  medium: 250_000, // 100k – 500k → tier "mid"
  large: 750_000, // 500k + → tier "macro"
};

/**
 * POST /api/influencers/quick
 *
 * Saisie ultra-rapide d'une lead convertie.
 *
 * Body simplifié :
 *   {
 *     platform: 'tiktok' | 'instagram' | 'snapchat',
 *     url: 'https://...',           // URL collée par le prospecteur
 *     followers_bucket: 'below_100k' | 'above_100k' | 'above_1m',
 *     whatsapp?: string,
 *     email?: string,
 *     other_contact?: string,        // ex : ID Telegram, Discord, snap autre que celui contacté
 *     pricing_eur?: number,          // facultatif
 *     brand_id?: string
 *   }
 *
 * Crée l'influenceur (global_status=accepted) + une prospection (status=accepted)
 * et log l'activité dans activity_log pour le leaderboard.
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

    const body = (await req.json()) as {
      platform?: "tiktok" | "instagram" | "snapchat";
      url?: string;
      followers_bucket?: "small" | "medium" | "large";
      whatsapp?: string;
      email?: string;
      other_contact?: string;
      pricing_eur?: number;
      brand_id?: string;
    };

    if (!body.platform || !body.url?.trim()) {
      return NextResponse.json(
        { error: "Plateforme + URL requis" },
        { status: 400 }
      );
    }
    if (!body.followers_bucket) {
      return NextResponse.json(
        { error: "Tranche de followers requise" },
        { status: 400 }
      );
    }

    // Parse l'URL pour extraire le handle. Si l'URL ne matche pas le format
    // attendu pour la plateforme, on stocke quand même l'URL brute et on
    // extrait un handle "best effort" depuis la fin du path.
    const parsed = parseProfileUrl(body.url);
    let handle: string;
    let profileUrl: string;

    if (parsed && parsed.platform === body.platform) {
      handle = parsed.handle;
      profileUrl = parsed.url;
    } else {
      // Fallback : extrait le dernier segment de path comme handle
      const cleaned = body.url
        .trim()
        .replace(/^@/, "")
        .replace(/[?#].*$/, "")
        .replace(/\/$/, "");
      const lastSegment = cleaned.split("/").pop() ?? cleaned;
      handle = lastSegment.replace(/^@/, "");
      profileUrl = body.url.trim();
    }

    if (!handle) {
      return NextResponse.json(
        { error: "Impossible d'extraire un handle depuis l'URL" },
        { status: 400 }
      );
    }

    const followersCount = BUCKET_TO_COUNT[body.followers_bucket] ?? 0;

    // Construit la string "autres contacts" (regroupe other_contact dans les notes)
    const contactNotes: string[] = [];
    if (body.other_contact?.trim())
      contactNotes.push(`Autre contact : ${body.other_contact.trim()}`);

    // Anti-doublons par handle pour la plateforme choisie
    const handleField =
      body.platform === "tiktok"
        ? "handle_tiktok"
        : body.platform === "instagram"
          ? "handle_instagram"
          : "handle_snapchat";

    const { data: existing } = await supabase
      .from("influencers")
      .select("id, display_name")
      .eq(handleField, handle)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        {
          error: `@${handle} existe déjà en base (${existing.display_name}).`,
          existingId: existing.id,
        },
        { status: 409 }
      );
    }

    // Tentative auto-fetch de la photo de profil via OpenGraph (TikTok/Snapchat
    // exposent leur og:image dans le HTML public). Timeout court : si ça ne
    // répond pas en 5s, on laisse l'avatar gradient fallback.
    let avatarUrl: string | null = null;
    try {
      avatarUrl = await fetchOgImage(profileUrl, 5000);
    } catch {
      // silencieux : pas grave si on n'a pas la photo, le user peut l'upload manuellement
    }

    // Construit l'insert payload
    const insertPayload: Record<string, unknown> = {
      display_name: handle,
      profile_url: profileUrl,
      avatar_url: avatarUrl,
      followers_count: followersCount,
      contact_phone: body.whatsapp?.trim() || null,
      contact_email: body.email?.trim() || null,
      pricing_min_cents:
        body.pricing_eur != null
          ? Math.round(Number(body.pricing_eur) * 100)
          : null,
      pricing_max_cents:
        body.pricing_eur != null
          ? Math.round(Number(body.pricing_eur) * 100)
          : null,
      global_status: "accepted",
      notes: contactNotes.length > 0 ? contactNotes.join("\n") : null,
      created_by: user.id,
      [handleField]: handle,
    };

    const { data: influencer, error: infErr } = await supabase
      .from("influencers")
      .insert(insertPayload)
      .select()
      .single();

    if (infErr) {
      console.error("[quick.influencer]", infErr);
      return NextResponse.json({ error: infErr.message }, { status: 500 });
    }

    // Prospection auto-créée en statut "accepted"
    let campaignId: string | null = null;
    if (body.brand_id) {
      const { data: existingCampaign } = await supabase
        .from("campaigns")
        .select("id")
        .eq("brand_id", body.brand_id)
        .eq("name", "Prospection libre")
        .maybeSingle();

      if (existingCampaign) {
        campaignId = existingCampaign.id;
      } else {
        const { data: createdCampaign } = await supabase
          .from("campaigns")
          .insert({
            brand_id: body.brand_id,
            name: "Prospection libre",
            status: "active",
            objective: "ugc",
            created_by: user.id,
          })
          .select("id")
          .single();
        campaignId = createdCampaign?.id ?? null;
      }
    }

    const channelMap = {
      tiktok: "dm_tiktok",
      instagram: "dm_instagram",
      snapchat: "snapchat",
    } as const;

    const { data: prospection } = await supabase
      .from("prospections")
      .insert({
        influencer_id: influencer.id,
        campaign_id: campaignId,
        assigned_to: user.id,
        status: "accepted",
        channel: channelMap[body.platform],
        first_contacted_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        agreed_price_cents:
          body.pricing_eur != null
            ? Math.round(Number(body.pricing_eur) * 100)
            : null,
      })
      .select()
      .single();

    await logActivity("prospection.accept", prospection?.id, {
      influencer_id: influencer.id,
      platform: body.platform,
      bucket: body.followers_bucket,
      quick_entry: true,
    });

    return NextResponse.json({ ok: true, influencer, prospection });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    console.error("[quick]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
