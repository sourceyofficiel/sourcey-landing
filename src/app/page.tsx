import { redirect } from "next/navigation";
import { getOptionalUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Page racine : redirige direct selon l'état d'auth.
 *   - Connecté → /app
 *   - Sinon → /login
 *
 * On pourra plus tard remplacer par une vraie landing "agence" pour
 * crédibiliser le contact aux influenceurs.
 */
export default async function RootPage() {
  const auth = await getOptionalUser();
  if (auth) redirect("/app");
  redirect("/login");
}
