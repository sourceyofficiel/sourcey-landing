import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ClipboardList,
  MessagesSquare,
  ExternalLink,
  CreditCard,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminUserDetail({
  params,
}: {
  params: { id: string };
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      briefs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 20,
      },
    },
  });
  if (!user) return notFound();

  const firstName = (user.fullName ?? user.email).split(" ")[0];

  return (
    <div className="mx-auto max-w-[1100px] p-5 md:p-8">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux utilisateurs
      </Link>

      {/* Header */}
      <header className="mt-5 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center md:p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-[22px] font-bold text-white">
          {firstName[0]?.toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-display text-[22px] font-extrabold tracking-tight text-neutral-900 md:text-[26px]">
              {user.fullName ?? "Nom non renseigné"}
            </h1>
            {user.isAdmin && (
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-700">
                Admin
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </span>
            {user.whatsapp && (
              <>
                <span>·</span>
                <Link
                  href={`https://wa.me/${user.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-green-700 hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  {user.whatsapp}
                </Link>
              </>
            )}
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Inscrit le {user.createdAt.toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={`rounded-md px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider ${
              user.plan === "free"
                ? "bg-neutral-100 text-neutral-700"
                : "bg-primary-100 text-primary-700"
            }`}
          >
            Plan {user.plan}
          </span>
          {user.subscriptionStatus && (
            <span className="text-[10.5px] text-neutral-500">
              {user.subscriptionStatus}
            </span>
          )}
        </div>
      </header>

      {/* Profile additional */}
      {(user.companyName || user.ecomPlatform || user.monthlyVolume) && (
        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Profil business
          </h2>
          <dl className="mt-3 grid gap-4 md:grid-cols-3">
            {user.companyName && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                  Société
                </dt>
                <dd className="mt-1 text-[14px] font-semibold text-neutral-900">
                  {user.companyName}
                </dd>
              </div>
            )}
            {user.ecomPlatform && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                  Plateforme
                </dt>
                <dd className="mt-1 text-[14px] font-semibold capitalize text-neutral-900">
                  {user.ecomPlatform}
                </dd>
              </div>
            )}
            {user.monthlyVolume && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                  Volume mensuel
                </dt>
                <dd className="mt-1 text-[14px] font-semibold text-neutral-900">
                  {user.monthlyVolume}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Stripe */}
      {(user.stripeCustomerId || user.stripeSubscriptionId) && (
        <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <CreditCard className="h-3 w-3" />
            Stripe
          </h2>
          <dl className="mt-3 grid gap-3 md:grid-cols-2">
            {user.stripeCustomerId && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                  Customer ID
                </dt>
                <dd className="mt-1 font-mono text-[12.5px] text-neutral-700">
                  {user.stripeCustomerId}
                </dd>
              </div>
            )}
            {user.stripeSubscriptionId && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                  Subscription ID
                </dt>
                <dd className="mt-1 font-mono text-[12.5px] text-neutral-700">
                  {user.stripeSubscriptionId}
                </dd>
              </div>
            )}
            {user.planRenewsAt && (
              <div>
                <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-neutral-400">
                  Prochaine échéance
                </dt>
                <dd className="mt-1 text-[12.5px] text-neutral-700">
                  {user.planRenewsAt.toLocaleDateString("fr-FR", {
                    dateStyle: "long",
                  })}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* Briefs */}
      <section className="mt-5 rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-neutral-900">
            <ClipboardList className="h-4 w-4 text-neutral-400" />
            Briefs ({user.briefs.length})
          </h2>
        </div>
        {user.briefs.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-neutral-500">
            Pas encore soumis de brief.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {user.briefs.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/admin/briefs/${b.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold text-neutral-900">
                      {b.productName}
                    </div>
                    <div className="truncate text-[11.5px] text-neutral-500">
                      Qté {b.targetQuantity} ·{" "}
                      {b.createdAt.toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                  <AdminStatusBadge status={b.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Conversations */}
      <section className="mt-5 rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-neutral-900">
            <MessagesSquare className="h-4 w-4 text-neutral-400" />
            Conversations ({user.conversations.length})
          </h2>
        </div>
        {user.conversations.length === 0 ? (
          <div className="p-6 text-center text-[13px] text-neutral-500">
            Aucune conversation.
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {user.conversations.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/conversations/${c.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-50"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                      c.type === "support"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-primary-100 text-primary-700"
                    }`}
                  >
                    {c.type === "support" ? "S" : c.agentName?.[0] ?? "A"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-semibold text-neutral-900">
                      {c.title ??
                        (c.type === "support"
                          ? "Support Sourcey"
                          : c.agentName ?? "Agent")}
                    </div>
                    <div className="truncate text-[11.5px] text-neutral-500">
                      {c.lastMessagePreview ?? "—"}
                    </div>
                  </div>
                  {c.unreadByCounterpart > 0 && (
                    <span className="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-[10.5px] font-bold text-rose-700">
                      {c.unreadByCounterpart}
                    </span>
                  )}
                  <ExternalLink className="h-3 w-3 text-neutral-300" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
