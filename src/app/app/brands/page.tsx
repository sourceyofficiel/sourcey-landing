import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BrandsView } from "./BrandsView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marques · Creator Agency" };

export default async function BrandsPage() {
  await requireAdmin();
  const supabase = createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("created_at", { ascending: false });
  return <BrandsView initialBrands={brands ?? []} />;
}
