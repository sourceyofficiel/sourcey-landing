import { Suspense } from "react";
import { BillingSuccessClient } from "./BillingSuccessClient";

export const metadata = { title: "Paiement réussi · Sourcey" };
export const dynamic = "force-dynamic";

/**
 * Page de retour après checkout Stripe réussi.
 *
 * Le composant client appelle /api/billing/sync au mount pour forcer la maj
 * du plan en DB depuis Stripe — sans attendre le webhook qui peut prendre
 * quelques secondes ou échouer si mal configuré.
 */
export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BillingSuccessClient />
    </Suspense>
  );
}
