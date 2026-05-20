import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { SERVICE_STATUS_LABELS } from "@/lib/data/services";
import { OrdersTabs } from "@/components/orders/OrdersTabs";

export const metadata = {
  title: "Mes commandes · Sourcey",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const userId = await getCurrentUserId();

  const [productRequests, serviceOrders] = await Promise.all([
    prisma.productRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            slug: true,
            title: true,
            images: true,
            agentName: true,
            agentCity: true,
            agentAvatarUrl: true,
            agentSlug: true,
          },
        },
      },
    }),
    prisma.serviceOrder.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalActive =
    productRequests.filter((r) => r.status !== "closed").length +
    serviceOrders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    ).length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-neutral-900">
            Mes commandes
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            <strong className="text-neutral-900">{totalActive}</strong> en cours
            · {productRequests.length + serviceOrders.length} total
          </p>
        </div>
        <Link
          href="/catalog"
          className="hidden rounded-full bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-brand transition-colors hover:bg-primary-700 sm:inline-flex"
        >
          + Nouvelle commande
        </Link>
      </div>

      <div className="mt-8">
        <OrdersTabs
          initialTab={(searchParams.tab as "all" | "quote" | "sample" | "service") ?? "all"}
          quotes={productRequests
            .filter((r) => r.type === "quote")
            .map((r) => ({
              id: r.id,
              kind: "quote" as const,
              productTitle: r.product.title,
              productSlug: r.product.slug,
              productImage:
                (parseImages(r.product.images) ?? [])[0] ?? null,
              agentName: r.product.agentName,
              agentCity: r.product.agentCity,
              agentAvatarUrl: r.product.agentAvatarUrl,
              agentSlug: r.product.agentSlug,
              quantity: r.quantity,
              status: r.status,
              statusLabel: requestStatusLabel(r.status),
              conversationId: r.conversationId,
              createdAt: r.createdAt.toISOString(),
            }))}
          samples={productRequests
            .filter((r) => r.type === "sample")
            .map((r) => ({
              id: r.id,
              kind: "sample" as const,
              productTitle: r.product.title,
              productSlug: r.product.slug,
              productImage:
                (parseImages(r.product.images) ?? [])[0] ?? null,
              agentName: r.product.agentName,
              agentCity: r.product.agentCity,
              agentAvatarUrl: r.product.agentAvatarUrl,
              agentSlug: r.product.agentSlug,
              quantity: r.quantity,
              status: r.status,
              statusLabel: requestStatusLabel(r.status),
              conversationId: r.conversationId,
              createdAt: r.createdAt.toISOString(),
            }))}
          services={serviceOrders.map((o) => ({
            id: o.id,
            kind: "service" as const,
            serviceType: o.type,
            tier: o.tier,
            brief: o.brief,
            status: o.status,
            statusLabel: SERVICE_STATUS_LABELS[o.status]?.label ?? o.status,
            statusColor:
              SERVICE_STATUS_LABELS[o.status]?.color ??
              "bg-neutral-100 text-neutral-600 border-neutral-200",
            estimatedPrice: o.estimatedPrice,
            finalPrice: o.finalPrice,
            createdAt: o.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}

function parseImages(raw: string): string[] | null {
  try {
    const x = JSON.parse(raw);
    return Array.isArray(x) ? x.filter((u) => typeof u === "string") : null;
  } catch {
    return null;
  }
}

function requestStatusLabel(s: string): {
  label: string;
  color: string;
} {
  switch (s) {
    case "new":
      return {
        label: "En attente de réponse",
        color: "bg-amber-50 text-amber-700 border-amber-100",
      };
    case "replied":
      return {
        label: "Agent a répondu",
        color: "bg-primary-50 text-primary-700 border-primary-100",
      };
    case "converted":
      return {
        label: "Convertie en commande",
        color: "bg-emerald-50 text-emerald-700 border-emerald-100",
      };
    case "closed":
      return {
        label: "Clôturée",
        color: "bg-neutral-100 text-neutral-600 border-neutral-200",
      };
    default:
      return {
        label: s,
        color: "bg-neutral-100 text-neutral-600 border-neutral-200",
      };
  }
}
