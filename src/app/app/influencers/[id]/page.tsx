import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { InfluencerDetail } from "./InfluencerDetail";

export const dynamic = "force-dynamic";

export default async function InfluencerPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser();
  const supabase = createClient();

  const [{ data: influencer }, { data: brands }, { data: analyses }, { data: prospections }] =
    await Promise.all([
      supabase
        .from("influencers")
        .select("*")
        .eq("id", params.id)
        .maybeSingle(),
      supabase.from("brands").select("id, name, slug, description, brand_context").order("name"),
      supabase
        .from("ai_analyses")
        .select("*, brand:brands(id, name, slug)")
        .eq("influencer_id", params.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("prospections")
        .select("*, campaign:campaigns(id, name, brand_id)")
        .eq("influencer_id", params.id)
        .order("created_at", { ascending: false }),
    ]);

  if (!influencer) notFound();

  return (
    <InfluencerDetail
      influencer={influencer}
      brands={brands ?? []}
      initialAnalyses={analyses ?? []}
      initialProspections={prospections ?? []}
    />
  );
}
