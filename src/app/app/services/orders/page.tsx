import Link from "next/link";
import {
  Camera,
  Box,
  Palette,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { SERVICES, SERVICE_STATUS_LABELS } from "@/lib/data/services";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Mes commandes de services · Sourcey",
};

const ICONS = { photoshoot: Camera, packaging: Box, logo: Palette };

function formatRelative(d: Date): string {
  const diffH = (Date.now() - d.getTime()) / 1000 / 60 / 60;
  if (diffH < 1) return "il y a < 1h";
  if (diffH < 24) return `il y a ${Math.floor(diffH)}h`;
  const days = Math.floor(diffH / 24);
  return `il y a ${days}j`;
}

export default async function ServiceOrdersPage() {
  const userId = await getCurrentUserId();
  const orders = await prisma.serviceOrder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-5 py-8 md:py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/app/services"
            className="text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
          >
            ← Catalogue
          </Link>
          <h1 className="mt-2 font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-neutral-900">
            Mes commandes de services
          </h1>
        </div>
        <Button asChild variant="primary" size="md">
          <Link href="/app/services">
            <Sparkles className="h-4 w-4" />
            Commander un nouveau service
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-neutral-900">
            Pas encore de commande
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Photoshoot, packaging, logo — bookable depuis ton dashboard.
          </p>
          <Button asChild variant="primary" size="md" className="mt-5">
            <Link href="/app/services">Voir le catalogue</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {orders.map((order) => {
            const service = SERVICES[order.type as keyof typeof SERVICES];
            const Icon = ICONS[order.type as keyof typeof ICONS] ?? Sparkles;
            const status = SERVICE_STATUS_LABELS[order.status] ?? {
              label: order.status,
              color: "bg-neutral-100 text-neutral-600 border-neutral-200",
            };
            const tier = service?.tiers.find((t) => t.key === order.tier);
            return (
              <li
                key={order.id}
                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 md:flex-row md:items-center"
              >
                <div className="flex flex-1 items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-neutral-900">
                      {service?.name ?? order.type}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Tier {tier?.name ?? order.tier} ·{" "}
                      <strong className="text-neutral-700">
                        {order.estimatedPrice}€ HT
                      </strong>{" "}
                      · commandé {formatRelative(order.createdAt)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                      {order.brief}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.color}`}
                  >
                    {order.status === "awaiting_quote" && (
                      <Clock className="h-3 w-3" />
                    )}
                    {status.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
