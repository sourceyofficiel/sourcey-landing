import { AcceptInviteForm } from "./AcceptInviteForm";
import { createClient } from "@/lib/supabase/server";
import { Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invitation · Creator Agency" };

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createClient();
  const { data: invitation } = await supabase
    .from("invitations")
    .select("*, inviter:profiles!invited_by(id, full_name, email)")
    .eq("token", params.token)
    .maybeSingle();

  if (!invitation) {
    return (
      <ErrorScreen
        title="Invitation introuvable"
        message="Ce lien n'existe pas ou a déjà été utilisé. Demande un nouveau lien à l'admin."
      />
    );
  }
  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    return (
      <ErrorScreen
        title="Invitation expirée"
        message="Ce lien a dépassé 7 jours. Demande à l'admin de t'en renvoyer un nouveau."
      />
    );
  }
  if (invitation.accepted_at) {
    return (
      <ErrorScreen
        title="Déjà acceptée"
        message="Cette invitation a déjà été utilisée. Connecte-toi directement."
        actionHref="/login"
        actionLabel="Se connecter"
      />
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFF00] shadow-lg shadow-black/10">
            <Sparkles className="h-5 w-5 text-neutral-900" />
          </div>
          <h1 className="mt-4 text-[22px] font-extrabold tracking-tight text-neutral-900">
            Creator Agency
          </h1>
          <p className="mt-1 text-[12.5px] text-neutral-500">
            Tu as été invité à rejoindre l&apos;équipe.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200/80 bg-white p-7 shadow-2xl">
          <div className="rounded-xl border border-black/20 bg-[#FFFF00]/10 p-3 text-center">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-black">
              Invitation de
            </div>
            <div className="mt-0.5 text-[13px] font-bold text-neutral-900">
              {invitation.inviter?.full_name ?? invitation.inviter?.email}
            </div>
            <div className="mt-2 inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-700 ring-1 ring-inset ring-amber-200">
              Rôle : {invitation.role}
            </div>
          </div>

          <h2 className="mt-5 text-[14px] font-bold text-neutral-900">
            Crée ton compte
          </h2>
          <p className="mt-1 text-[12px] text-neutral-500">
            Email pré-rempli. Crée un mot de passe pour finaliser.
          </p>

          <AcceptInviteForm
            email={invitation.email}
            token={params.token}
          />
        </div>
      </div>
    </main>
  );
}

function ErrorScreen({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200/80 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-[18px] font-extrabold text-neutral-900">{title}</h2>
        <p className="mt-2 text-[13px] text-neutral-500">{message}</p>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[#FFFF00] px-4 text-[13px] font-bold text-black hover:brightness-110"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </main>
  );
}
