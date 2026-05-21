import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BriefForm } from "@/components/brief/BriefForm";

export const metadata = {
  title: "Nouveau brief · Sourcey",
};

export const dynamic = "force-dynamic";

export default async function NewBriefPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app/new");

  return <BriefForm emailFromSession={user.email} />;
}
