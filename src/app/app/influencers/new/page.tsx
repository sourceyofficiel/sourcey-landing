import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewInfluencerForm } from "./NewInfluencerForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ajouter un influenceur · Creator Agency" };

export default async function NewInfluencerPage() {
  await requireUser();
  const supabase = createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug, description, brand_context")
    .order("name");

  return <NewInfluencerForm brands={brands ?? []} />;
}
