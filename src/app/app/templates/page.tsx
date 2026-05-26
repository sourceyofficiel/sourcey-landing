import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TemplatesView } from "./TemplatesView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modèles · Creator Agency" };

export default async function TemplatesPage() {
  await requireUser();
  const supabase = createClient();
  const [{ data: templates }, { data: brands }] = await Promise.all([
    supabase
      .from("message_templates")
      .select("*, brand:brands(id, name)")
      .order("created_at", { ascending: false }),
    supabase.from("brands").select("id, name").order("name"),
  ]);
  return (
    <TemplatesView
      initialTemplates={templates ?? []}
      brands={brands ?? []}
    />
  );
}
