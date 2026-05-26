import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/influencers/quick
 *
 * Saisie rapide d'une lead convertie : le prospecteur a contacté l'influenceur
 * en dehors de l'app (DM TikTok, IG, etc.), l'influenceur a accepté, le
 * prospecteur entre les infos.
 *
 * Crée en transaction :
 *   1. influencer (avec global_status='accepted')
 *   2. prospection (status='accepted', assigned_to=current user)
 *
 * Si brand_id fourni, lie la prospection à une campagne "Prospection libre"
 * de cette marque (auto-créée si besoin).
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
      display_name?: string;
      handle_tiktok?: string;
      handle_instagram?: string;
      profile_url?: string;
      followers_count?: number;
      niche?: string;
      country?: string;
      contact_email?: string;
      contact_phone?: string;
      pricing_cents?: number;
      expected_deliverables?: string;
      notes?: string;
      brand_id?: string;
      channel?: string; // 'dm_instagram' | 'dm_tiktok' | 'email' | 'whatsapp'
    };

    if (!body.display_name?.trim() && !body.handle_tiktok && !body.handle_instagram) {
      return NextResponse.json(
        { error: "Au minimum : un nom ou un handle TikTok/Instagram" },
        { status: 400 }
      );
    }

    // Détermine le nom à afficher
    const displayName =
      body.display_name?.trim() ||
      body.handle_tiktok ||
      body.handle_instagram ||
      "Influenceur";

    // Construit l'URL profil si pas fournie
    let profileUrl = body.profile_url?.trim() ?? null;
    if (!profileUrl) {
      if (body.handle_tiktok)
        profileUrl = `https://www.tiktok.com/@${body.handle_tiktok}`;
      else if (body.handle_instagram)
        profileUrl = `https://www.instagram.com/${body.handle_instagram}`;
    }

    // Check duplicate par handle (anti-doublons)
    if (body.handle_tiktok) {
      const { data: existing } = await supabase
        .from("influencers")
        .select("id")
        .eq("handle_tiktok", body.handle_tiktok)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          {
            error: `@${body.handle_tiktok} existe déjà en base. Va sur sa fiche pour ajouter une prospection.`,
            existingId: existing.id,
          },
          { status: 409 }
        );
      }
    }
    if (body.handle_instagram) {
      const { data: existing } = await supabase
        .from("influencers")
        .select("id")
        .eq("handle_instagram", body.handle_instagram)
        .maybeSingle();
      if (existing) {
        return NextResponse.json(
          {
            error: `@${body.handle_instagram} existe déjà en base.`,
            existingId: existing.id,
          },
          { status: 409 }
        );
      }
    }

    // Création de l'influenceur
    const { data: influencer, error: infErr } = await supabase
      .from("influencers")
      .insert({
        display_name: displayName,
        handle_tiktok: body.handle_tiktok || null,
        handle_instagram: body.handle_instagram || null,
        profile_url: profileUrl,
        followers_count: body.followers_count ?? 0,
        niche: body.niche?.trim() || null,
        country: body.country?.trim() || null,
        contact_email: body.contact_email?.trim() || null,
        contact_phone: body.contact_phone?.trim() || null,
        pricing_min_cents: body.pricing_cents ?? null,
        pricing_max_cents: body.pricing_cents ?? null,
        global_status: "accepted", // c'est une lead convertie
        notes: body.notes?.trim() || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (infErr) {
      console.error("[quick.influencer]", infErr);
      return NextResponse.json({ error: infErr.message }, { status: 500 });
    }

    // Création d'une prospection en statut "accepted"
    let campaignId: string | null = null;
    if (body.brand_id) {
      // Cherche ou crée une campagne "Prospection libre" pour cette marque
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

    const { data: prospection } = await supabase
      .from("prospections")
      .insert({
        influencer_id: influencer.id,
        campaign_id: campaignId,
        assigned_to: user.id,
        status: "accepted",
        channel: body.channel ?? null,
        first_contacted_at: new Date().toISOString(),
        last_interaction_at: new Date().toISOString(),
        agreed_price_cents: body.pricing_cents ?? null,
        expected_deliverables: body.expected_deliverables?.trim() || null,
      })
      .select()
      .single();

    // Log activity pour le leaderboard
    await logActivity("prospection.accept", prospection?.id, {
      influencer_id: influencer.id,
      quick_entry: true,
    });

    return NextResponse.json({
      ok: true,
      influencer,
      prospection,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    console.error("[quick]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
