import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CampaignsView } from "./CampaignsView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Campagnes · Creator Agency" };

export default async function CampaignsPage() {
  const { profile } = await requireUser();
  const supabase = createClient();

  const [{ data: campaigns }, { data: brands }] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*, brand:brands(id, name, slug)")
      .order("created_at", { ascending: false }),
    supabase.from("brands").select("id, name, slug").order("name"),
  ]);

  return (
    <CampaignsView
      initialCampaigns={campaigns ?? []}
      brands={brands ?? []}
      isAdmin={profile?.role === "admin"}
    />
  );
}
