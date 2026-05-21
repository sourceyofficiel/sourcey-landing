import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { AdminReplyForm } from "@/components/admin/AdminReplyForm";

export const dynamic = "force-dynamic";

export default async function AdminConversationDetail({
  params,
}: {
  params: { id: string };
}) {
  const conv = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          whatsapp: true,
          plan: true,
        },
      },
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!conv) return notFound();

  // Mark as read by counterpart
  if (conv.unreadByCounterpart > 0) {
    await prisma.conversation.update({
      where: { id: conv.id },
      data: { unreadByCounterpart: 0 },
    });
  }

  return (
    <div className="mx-auto max-w-[900px] p-5 md:p-8">
      <Link
        href="/admin/conversations"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux conversations
      </Link>

      {/* Header */}
      <header className="mt-4 flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center md:p-6">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[16px] font-bold ${
            conv.type === "support"
              ? "bg-amber-100 text-amber-700"
              : "bg-primary-100 text-primary-700"
          }`}
        >
          {conv.type === "support"
            ? "S"
            : conv.agentName?.[0]?.toUpperCase() ?? "A"}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[20px] font-extrabold tracking-tight text-neutral-900 md:text-[22px]">
            {conv.title ??
              (conv.type === "support"
                ? "Support Sourcey"
                : conv.agentName ?? "Agent")}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-neutral-500">
            <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              {conv.type}
            </span>
            <span>·</span>
            <Link
              href={`/admin/users/${conv.user.id}`}
              className="inline-flex items-center gap-1 font-semibold text-neutral-700 hover:text-neutral-900 hover:underline"
            >
              {conv.user.fullName ?? conv.user.email}
              <ExternalLink className="h-2.5 w-2.5" />
            </Link>
            <span>·</span>
            <a
              href={`mailto:${conv.user.email}`}
              className="inline-flex items-center gap-1 hover:text-neutral-700"
            >
              <Mail className="h-3 w-3" />
              {conv.user.email}
            </a>
            {conv.user.whatsapp && (
              <>
                <span>·</span>
                <Link
                  href={`https://wa.me/${conv.user.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline"
                >
                  WhatsApp
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <section className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
        {conv.messages.length === 0 ? (
          <div className="py-6 text-center text-[13px] text-neutral-500">
            Aucun message dans cette conversation.
          </div>
        ) : (
          <ul className="space-y-3">
            {conv.messages.map((m) => {
              const isClient = m.senderType === "user";
              const isSupport =
                m.senderType === "support" || m.senderType === "agent";
              const isSystem = m.senderType === "system";
              if (isSystem) {
                return (
                  <li key={m.id} className="my-4 flex justify-center">
                    <div className="rounded-full bg-neutral-100 px-3 py-1 text-center text-[11px] font-semibold text-neutral-600">
                      {m.content}
                    </div>
                  </li>
                );
              }
              return (
                <li
                  key={m.id}
                  className={`flex ${
                    isSupport ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[80%]">
                    <div className="mb-1 flex items-center gap-2 text-[10.5px] text-neutral-400">
                      <span className="font-semibold uppercase tracking-wider">
                        {isClient
                          ? conv.user.fullName ?? "Client"
                          : "Sourcey support"}
                      </span>
                      <span>·</span>
                      <span>
                        {m.createdAt.toLocaleString("fr-FR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed ${
                        isClient
                          ? "rounded-tl-sm bg-neutral-100 text-neutral-900"
                          : "rounded-tr-sm bg-primary-600 text-white"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Reply form */}
      <AdminReplyForm conversationId={conv.id} />
    </div>
  );
}
