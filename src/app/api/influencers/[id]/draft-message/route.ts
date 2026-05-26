import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { draftApproachMessage } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/influencers/[id]/draft-message
 * Body: { brandId, channel: 'email'|'dm_instagram'|'dm_tiktok' }
 *
 * Renvoie un message d'approche personnalisé prêt à copier-coller.
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

    const body = (await req.json()) as {
      brandId?: string;
      channel?: "email" | "dm_instagram" | "dm_tiktok";
    };
    if (!body.brandId || !body.channel) {
      return NextResponse.json(
        { error: "brandId et channel requis" },
        { status: 400 }
      );
    }

    const [{ data: influencer }, { data: brand }, { data: profile }] =
      await Promise.all([
        supabase.from("influencers").select("*").eq("id", params.id).maybeSingle(),
        supabase.from("brands").select("*").eq("id", body.brandId).maybeSingle(),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);

    if (!influencer || !brand) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // On utilise les notes comme proxy de bio + la dernière analyse pour un post sample
    const { data: lastAnalysis } = await supabase
      .from("ai_analyses")
      .select("*")
      .eq("influencer_id", influencer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const platform = influencer.handle_tiktok
      ? "TikTok"
      : influencer.handle_instagram
        ? "Instagram"
        : "YouTube";

    const signature = profile?.full_name
      ? `${profile.full_name}\nÉquipe ${brand.name}`
      : `L'équipe ${brand.name}`;

    const result = await draftApproachMessage({
      influencerName: influencer.display_name,
      influencerBio: influencer.notes ?? null,
      recentPostSample: lastAnalysis?.reasoning ?? null,
      platform,
      brand: {
        name: brand.name,
        description: brand.description,
        brandContext: brand.brand_context,
      },
      channel: body.channel,
      agentSignature: signature,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur";
    console.error("[draft-message]", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
