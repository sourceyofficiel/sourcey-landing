import { redirect } from "next/navigation";
import {
  Package,
  TrendingDown,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlan, normalizePlanSlug } from "@/lib/plans";

export const metadata = {
  title: "Mes commandes · Sourcey",
};

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app/orders");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const totalSaved = orders.reduce((s, o) => s + o.savedAmount, 0);
  const totalSpent = orders.reduce((s, o) => s + o.netAmount, 0);

  return (
    <div className="mx-auto max-w-[1100px] p-5 md:p-8">
      {/* Header */}
      <header>
        <div className="text-[12px] font-semibold uppercase tracking-wider text-neutral-400">
          Historique
        </div>
        <h1 className="mt-1 font-display text-[28px] font-extrabold tracking-tight text-neutral-900 md:text-[32px]">
          Mes commandes
        </h1>
        <p className="mt-2 text-[13.5px] text-neutral-500 md:text-[14px]">
          Toutes les commandes passées via Sourcey avec leur réduction.
        </p>
      </header>

      {/* === Total économisé — argument de rétention === */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 md:p-8">
        <div className="flex items-center gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg">
            <TrendingDown className="h-7 w-7" />
          </span>
          <div>
            <div className="text-[11.5px] font-bold uppercase tracking-wider text-primary-700">
              Total économisé avec Sourcey
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-display text-[40px] font-extrabold leading-none text-neutral-900 md:text-[48px]">
                {totalSaved.toLocaleString("fr-FR")}€
              </span>
              <span className="text-[12px] text-neutral-500">
                sur {orders.length} commande
                {orders.length > 1 ? "s" : ""}
              </span>
            </div>
            {totalSpent > 0 && (
              <div className="mt-2 text-[12px] text-neutral-500">
                Net dépensé : {totalSpent.toLocaleString("fr-FR")}€
              </div>
            )}
          </div>
        </div>
      </section>

      {/* === Liste des commandes === */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-100 px-5 py-3.5">
          <h2 className="text-[14px] font-bold text-neutral-900">
            Historique ({orders.length})
          </h2>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <Package className="h-10 w-10 text-neutral-300" />
            <div className="text-[14.5px] font-semibold text-neutral-700">
              Aucune commande pour l&apos;instant
            </div>
            <p className="max-w-[400px] text-[12.5px] text-neutral-500">
              Quand tu passes ta première commande via Sourcey, elle apparaîtra
              ici avec la réduction appliquée selon ton plan.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {orders.map((o) => {
              const planAtOrder = normalizePlanSlug(o.planAtOrder);
              const planName = getPlan(planAtOrder)?.name ?? "Plan";
              return (
                <li key={o.id} className="px-5 py-4 md:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    {/* Left : produit + fournisseur + date */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14.5px] font-bold text-neutral-900">
                          {o.productDescription}
                        </h3>
                        <StatusBadge status={o.status} />
                      </div>
                      <div className="mt-1 text-[12.5px] text-neutral-500">
                        Fournisseur :{" "}
                        <strong className="text-neutral-700">
                          {o.supplierName}
                        </strong>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                        <span>{o.createdAt.toLocaleDateString("fr-FR")}</span>
                        <span>·</span>
                        <span>Plan au moment : {planName}</span>
                      </div>
                    </div>

                    {/* Right : montants */}
                    <div className="grid shrink-0 grid-cols-3 gap-4 text-right">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Brut
                        </div>
                        <div className="mt-0.5 text-[13px] font-semibold text-neutral-500 line-through">
                          {o.grossAmount.toLocaleString("fr-FR")}€
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                          −{o.discountPct}%
                        </div>
                        <div className="mt-0.5 text-[13px] font-semibold text-primary-600">
                          −{o.savedAmount.toLocaleString("fr-FR")}€
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                          Payé
                        </div>
                        <div className="mt-0.5 font-display text-[16px] font-extrabold text-neutral-900">
                          {o.netAmount.toLocaleString("fr-FR")}€
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ============================================================
   Status badge
   ============================================================ */

function StatusBadge({ status }: { status: string }) {
  const MAP: Record<
    string,
    { label: string; cls: string; Icon: typeof Clock }
  > = {
    pending: { label: "En attente", cls: "bg-amber-100 text-amber-700", Icon: Clock },
    confirmed: {
      label: "Confirmée",
      cls: "bg-blue-100 text-blue-700",
      Icon: CheckCircle2,
    },
    shipped: {
      label: "Expédiée",
      cls: "bg-purple-100 text-purple-700",
      Icon: Truck,
    },
    delivered: {
      label: "Livrée",
      cls: "bg-green-100 text-green-700",
      Icon: CheckCircle2,
    },
    cancelled: {
      label: "Annulée",
      cls: "bg-rose-100 text-rose-700",
      Icon: XCircle,
    },
  };
  const m = MAP[status] ?? MAP.pending;
  const Icon = m.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${m.cls}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {m.label}
    </span>
  );
}
