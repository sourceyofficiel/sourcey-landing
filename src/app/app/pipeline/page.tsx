import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PipelineKanban } from "./PipelineKanban";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pipeline · Creator Agency" };

export default async function PipelinePage() {
  await requireUser();
  const supabase = createClient();

  const { data: prospections } = await supabase
    .from("prospections")
    .select(
      "*, influencer:influencers(id, display_name, followers_count, size_tier, handle_tiktok, handle_instagram), campaign:campaigns(id, name, brand_id, brand:brands(id, name)), assignee:profiles!assigned_to(id, full_name, email)"
    )
    .order("updated_at", { ascending: false })
    .limit(500);

  return <PipelineKanban initialProspections={prospections ?? []} />;
}
