import Link from "next/link";
import { CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";

export const metadata = { title: "Paiement réussi · Sourcey" };

export default function BillingSuccessPage() {
  return (
    <div className="mx-auto max-w-md px-5 py-16 text-center">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle2 className="h-9 w-9" />
      </div>

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-neutral-900">
        Paiement réussi 🎉
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-neutral-600">
        Ton abonnement est actif. On reçoit la notification dans quelques
        secondes et on te recontacte sur WhatsApp pour t'aider à profiter de
        ton nouveau plan.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/app/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-600 text-[14.5px] font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <MessageSquare className="h-4 w-4" />
          Soumettre un nouveau brief
        </Link>
        <Link
          href="/app"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white text-[14px] font-semibold text-neutral-900 transition-colors hover:border-neutral-300"
        >
          Retour au tableau de bord
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
