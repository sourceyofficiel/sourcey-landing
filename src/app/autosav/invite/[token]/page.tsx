import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AcceptInviteButton } from "./AcceptInviteButton";
import { Mail, Crown, Shield, User as UserIcon, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invitation · AutoSAV" };

const ROLE_META: Record<
  string,
  { label: string; icon: typeof Crown; tagline: string }
> = {
  owner: { label: "Propriétaire", icon: Crown, tagline: "Contrôle total" },
  admin: { label: "Admin", icon: Shield, tagline: "Gère l'équipe" },
  agent: { label: "Agent", icon: UserIcon, tagline: "Répond aux tickets" },
};

export default async function InviteAcceptPage({
  params,
}: {
  params: { token: string };
}) {
  const invitation = await prisma.autosavInvitation.findUnique({
    where: { token: params.token },
    include: {
      workspace: { select: { name: true, slug: true } },
      invitedBy: { select: { email: true, fullName: true } },
    },
  });

  if (!invitation) {
    return (
      <ErrorCard
        title="Invitation invalide"
        message="Ce lien n'existe pas (ou plus). Demande une nouvelle invitation à l'équipe."
      />
    );
  }

  if (invitation.expiresAt.getTime() < Date.now()) {
    return (
      <ErrorCard
        title="Invitation expirée"
        message="Le lien a dépassé sa durée de validité. Demande un nouveau lien."
      />
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    // Non connecté → on stocke le token et on redirige vers signup pré-rempli
    redirect(
      `/signup?invite=${invitation.token}&email=${encodeURIComponent(invitation.email)}`
    );
  }

  // Si l'email connecté ≠ email d'invitation, message clair
  if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return (
      <ErrorCard
        title="Mauvais compte"
        message={`Cette invitation est destinée à ${invitation.email}. Connecte-toi avec ce compte ou contacte l'expéditeur.`}
      />
    );
  }

  // Si déjà membre, redirige direct dans le workspace
  const existing = await prisma.autosavWorkspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    },
  });
  if (existing) {
    redirect(`/autosav/w/${invitation.workspace.slug}`);
  }

  const meta = ROLE_META[invitation.role] ?? ROLE_META.agent;
  const Icon = meta.icon;
  const inviterLabel =
    invitation.invitedBy.fullName ?? invitation.invitedBy.email;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50/40 via-white to-amber-50/30 px-4 py-10">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200/70 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)]">
        <div className="border-b border-neutral-200/70 bg-gradient-to-br from-emerald-800 to-emerald-900 px-6 py-7 text-center text-amber-100">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-200/20 ring-1 ring-inset ring-amber-200/30">
            <Mail className="h-5 w-5 text-amber-200" />
          </div>
          <div className="mt-3 text-[10.5px] font-bold uppercase tracking-wider text-amber-200/70">
            Invitation AutoSAV
          </div>
          <h1 className="mt-1 font-display text-[22px] font-extrabold tracking-tight">
            Rejoins {invitation.workspace.name}
          </h1>
          <p className="mt-1 text-[12.5px] text-amber-100/80">
            {inviterLabel} t'invite à traiter les tickets en équipe.
          </p>
        </div>

        <div className="px-6 py-6">
          <div className="rounded-2xl bg-neutral-50/70 p-4 ring-1 ring-inset ring-neutral-200/60">
            <div className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Ton rôle
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-inset ring-emerald-200/50">
                <Icon className="h-4 w-4 text-emerald-700" />
              </span>
              <div>
                <div className="font-display text-[14px] font-bold text-neutral-900">
                  {meta.label}
                </div>
                <div className="text-[12px] text-neutral-600">
                  {meta.tagline}
                </div>
              </div>
            </div>
          </div>

          <AcceptInviteButton
            token={invitation.token}
            workspaceSlug={invitation.workspace.slug}
          />

          <p className="mt-3 text-center text-[11px] text-neutral-500">
            Connecté en tant que <strong>{user.email}</strong>
          </p>
        </div>
      </div>
    </main>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200/70 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="mt-3 font-display text-[20px] font-extrabold tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="mt-2 text-[13px] text-neutral-600">{message}</p>
        <Link
          href="/autosav"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-emerald-800 px-5 text-[13px] font-bold text-amber-200 hover:bg-emerald-900"
        >
          Retour à AutoSAV
        </Link>
      </div>
    </main>
  );
}
