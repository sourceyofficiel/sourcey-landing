import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/prospections?status=...&assigned=me
 * Liste les prospections (filtrées par RLS automatiquement).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const supabase = createClient();

  let query = supabase
    .from("prospections")
    .select(
      "*, influencer:influencers(id, display_name, followers_count, size_tier, handle_tiktok, handle_instagram), campaign:campaigns(id, name, brand_id), assignee:profiles!assigned_to(id, full_name, email)"
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prospections: data ?? [] });
}

/**
 * POST /api/prospections
 * Body: { influencer_id, campaign_id?, brand_id? }
 *
 * Si brand_id fourni sans campaign_id, on cherche/crée une campagne "Prospection libre"
 * pour cette marque. Sinon prospection libre sans campagne.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = (await req.json()) as {
    influencer_id?: string;
    campaign_id?: string;
    brand_id?: string;
    channel?: string;
  };

  if (!body.influencer_id) {
    return NextResponse.json({ error: "influencer_id requis" }, { status: 400 });
  }

  // Si pas de campaign_id mais brand_id : on cherche une campagne "free" existante ou on la crée
  let campaignId = body.campaign_id ?? null;
  if (!campaignId && body.brand_id) {
    const { data: existingCampaign } = await supabase
      .from("campaigns")
      .select("id")
      .eq("brand_id", body.brand_id)
      .eq("name", "Prospection libre")
      .maybeSingle();

    if (existingCampaign) {
      campaignId = existingCampaign.id;
    } else {
      const { data: created } = await supabase
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
      campaignId = created?.id ?? null;
    }
  }

  const { data, error } = await supabase
    .from("prospections")
    .insert({
      influencer_id: body.influencer_id,
      campaign_id: campaignId,
      assigned_to: user.id,
      channel: body.channel ?? null,
      status: "to_contact",
    })
    .select("*, influencer:influencers(display_name), campaign:campaigns(id, name)")
    .single();

  if (error) {
    // Si erreur unique constraint, on récupère l'existante
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("prospections")
        .select(
          "*, influencer:influencers(display_name), campaign:campaigns(id, name)"
        )
        .eq("influencer_id", body.influencer_id)
        .eq("campaign_id", campaignId ?? "")
        .maybeSingle();
      if (existing)
        return NextResponse.json({ ok: true, prospection: existing, alreadyExists: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logActivity("prospection.create", data.id, {
    influencer_id: body.influencer_id,
    campaign_id: campaignId,
  });

  return NextResponse.json({ ok: true, prospection: data });
}
