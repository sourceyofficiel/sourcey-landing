import Link from "next/link";
import Image from "next/image";
import { Package, Headphones, MessageCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth-mock";
import { formatRelative } from "@/lib/format-time";

export const metadata = {
  title: "Mes commandes · Sourcey",
};

export default async function OrdersPage() {
  const userId = await getCurrentUserId();

  // Une "commande" Sourcey = une conversation avec un agent (= sourcing en cours)
  const conversations = await prisma.conversation.findMany({
    where: { userId, archivedAt: null, type: "agent" },
    orderBy: { lastMessageAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 md:py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-tight text-neutral-900">
            Mes commandes
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            <strong className="text-neutral-900">{conversations.length}</strong>{" "}
            sourcing{conversations.length !== 1 ? "s" : ""} en cours
          </p>
        </div>
        <Link
          href="/app/inbox"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-primary-500 to-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5"
        >
          <Headphones className="h-4 w-4" />
          Nouvelle demande
        </Link>
      </div>

      {/* Empty state */}
      {conversations.length === 0 ? (
        <div className="mt-12 grid place-items-center rounded-3xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
          <Package className="h-10 w-10 text-neutral-300" />
          <h2 className="mt-4 font-display text-xl font-bold text-neutral-900">
            Aucun sourcing en cours
          </h2>
          <p className="mt-2 max-w-[400px] text-sm text-neutral-500">
            Démarre ton premier sourcing en discutant avec notre support — on te
            mettra en relation avec l'agent qui matche ta niche.
          </p>
          <Link
            href="/app/inbox"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <MessageCircle className="h-4 w-4" />
            Démarrer un sourcing
          </Link>
        </div>
      ) : (
        /* Conversations list (= sourcings) */
        <ul className="mt-8 grid gap-3">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href="/app/inbox"
                className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md"
              >
                {c.agentAvatarUrl ? (
                  <Image
                    src={c.agentAvatarUrl}
                    alt={c.agentName ?? ""}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 shrink-0 rounded-full bg-neutral-200" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-neutral-900">
                    {c.title ?? "Sourcing"}
                  </p>
                  <p className="mt-0.5 truncate text-[12.5px] text-neutral-500">
                    Avec {c.agentName} · {c.agentCity ?? "Chine"}
                  </p>
                  {c.lastMessagePreview && (
                    <p className="mt-1.5 line-clamp-1 text-[12.5px] text-neutral-600">
                      « {c.lastMessagePreview} »
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                    En cours
                  </span>
                  <span className="text-[10.5px] text-neutral-400">
                    {formatRelative(c.lastMessageAt)}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
