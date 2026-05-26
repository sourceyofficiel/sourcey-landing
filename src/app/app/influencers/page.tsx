import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InfluencersList } from "./InfluencersList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Influenceurs · Creator Agency" };

export default async function InfluencersPage() {
  await requireUser();
  const supabase = createClient();

  const [{ data: influencers }, { data: brands }] = await Promise.all([
    supabase
      .from("influencers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    supabase.from("brands").select("id, name, slug").order("name"),
  ]);

  return (
    <InfluencersList
      initialInfluencers={influencers ?? []}
      brands={brands ?? []}
    />
  );
}
