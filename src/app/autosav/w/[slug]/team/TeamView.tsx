"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  Shield,
  User as UserIcon,
  X,
  Copy,
  Check,
  Trash2,
  Loader2,
  Clock,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

type Role = "owner" | "admin" | "agent";

interface Member {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: Role;
  joinedAt: string;
  isMe: boolean;
}

interface Invitation {
  id: string;
  email: string;
  role: Role;
  token: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamData {
  members: Member[];
  invitations: Invitation[];
  myRole: Role;
}

const ROLE_META: Record<
  Role,
  { label: string; icon: typeof Crown; color: string; description: string }
> = {
  owner: {
    label: "Propriétaire",
    icon: Crown,
    color: "amber",
    description: "Contrôle total + facturation",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    color: "emerald",
    description: "Gère l'équipe et les réglages",
  },
  agent: {
    label: "Agent",
    icon: UserIcon,
    color: "neutral",
    description: "Répond aux tickets",
  },
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  amber: "bg-amber-50 text-amber-800 ring-amber-200/60",
  emerald: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
  neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200/60",
};

function getAvatarGradient(email: string): string {
  const gradients = [
    "from-pink-400 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-500",
    "from-indigo-400 to-purple-500",
    "from-violet-400 to-purple-500",
    "from-cyan-400 to-blue-500",
  ];
  let h = 0;
  for (let i = 0; i < email.length; i++) h = (h * 31 + email.charCodeAt(i)) | 0;
  return gradients[Math.abs(h) % gradients.length];
}

function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function expiresLabel(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "expirée";
  const days = Math.ceil(diff / (24 * 3600 * 1000));
  if (days === 1) return "expire demain";
  return `expire dans ${days}j`;
}

/* ============================================================
   TEAM VIEW
   ============================================================ */

export function TeamView({
  workspaceSlug,
  workspaceName,
  myRole,
}: {
  workspaceSlug: string;
  workspaceName: string;
  myRole: Role;
}) {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const canManage = myRole === "owner" || myRole === "admin";

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/members`
      );
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="h-full overflow-y-auto bg-neutral-50/50">
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10 lg:py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              <Users className="h-3.5 w-3.5" />
              Équipe · {workspaceName}
            </div>
            <h2 className="mt-1 font-display text-[26px] font-extrabold tracking-tight text-neutral-900">
              Gère qui peut accéder au workspace
            </h2>
            <p className="mt-1 max-w-xl text-[13.5px] text-neutral-600">
              Invite tes collègues à traiter les tickets ensemble. Les agents
              voient l'inbox, les admins gèrent l'équipe, le propriétaire a la
              facturation.
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-emerald-800 px-4 text-[13px] font-bold text-amber-200 shadow-sm transition-all hover:bg-emerald-900 active:scale-[0.98]"
            >
              <UserPlus className="h-4 w-4" />
              Inviter un membre
            </button>
          )}
        </div>

        {/* Members card */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-neutral-200/70 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-[14.5px] font-bold text-neutral-900">
                Membres
              </h3>
              <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10.5px] font-bold text-neutral-600">
                {data?.members.length ?? 0}
              </span>
            </div>
          </header>

          {loading ? (
            <div className="flex h-40 items-center justify-center text-neutral-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : data?.members.length ? (
            <ul className="divide-y divide-neutral-100">
              {data.members.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  myRole={myRole}
                  workspaceSlug={workspaceSlug}
                  onChange={refetch}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="Aucun membre"
              description="Quelque chose s'est mal passé. Recharge la page ?"
            />
          )}
        </section>

        {/* Invitations card */}
        {data && data.invitations.length > 0 && (
          <section className="mt-6 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-neutral-200/70 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-[14.5px] font-bold text-neutral-900">
                  Invitations en cours
                </h3>
                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10.5px] font-bold text-amber-800">
                  {data.invitations.length}
                </span>
              </div>
            </header>
            <ul className="divide-y divide-neutral-100">
              {data.invitations.map((inv) => (
                <InvitationRow
                  key={inv.id}
                  invitation={inv}
                  workspaceSlug={workspaceSlug}
                  canManage={canManage}
                  onChange={refetch}
                />
              ))}
            </ul>
          </section>
        )}

        {/* Roles legend */}
        <section className="mt-6 grid gap-3 sm:grid-cols-3">
          {(["owner", "admin", "agent"] as Role[]).map((r) => {
            const meta = ROLE_META[r];
            const Icon = meta.icon;
            return (
              <div
                key={r}
                className="rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-inset ${ROLE_BADGE_CLASSES[meta.color]}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="font-display text-[13px] font-bold text-neutral-900">
                    {meta.label}
                  </div>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-neutral-600">
                  {meta.description}
                </p>
              </div>
            );
          })}
        </section>
      </div>

      {inviteOpen && (
        <InviteModal
          workspaceSlug={workspaceSlug}
          onClose={() => setInviteOpen(false)}
          onInvited={() => {
            setInviteOpen(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   MEMBER ROW
   ============================================================ */

function MemberRow({
  member,
  myRole,
  workspaceSlug,
  onChange,
}: {
  member: Member;
  myRole: Role;
  workspaceSlug: string;
  onChange: () => void;
}) {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const meta = ROLE_META[member.role];
  const Icon = meta.icon;
  const canEditRole =
    myRole === "owner" && member.role !== "owner" && !member.isMe;
  const canRemove =
    myRole === "owner" && member.role !== "owner" && !member.isMe;

  async function setRole(newRole: Role) {
    if (newRole === member.role) {
      setRoleMenuOpen(false);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/members/${member.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (res.ok) onChange();
    } finally {
      setBusy(false);
      setRoleMenuOpen(false);
    }
  }

  async function remove() {
    if (
      !confirm(
        `Retirer ${member.name ?? member.email} du workspace ? Cette action est immédiate.`
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/members/${member.id}`,
        { method: "DELETE" }
      );
      if (res.ok) onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-neutral-50/50">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(member.email)} text-[13px] font-bold text-white`}
        >
          {getInitials(member.name, member.email)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-[13.5px] font-bold text-neutral-900">
              {member.name ?? member.email}
            </span>
            {member.isMe && (
              <span className="shrink-0 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200/50">
                Toi
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[12px] text-neutral-500">
            {member.name ? member.email : null}
            {member.name ? " · " : null}
            Rejoint le {formatDate(member.joinedAt)}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative">
          <button
            disabled={!canEditRole}
            onClick={() => canEditRole && setRoleMenuOpen((o) => !o)}
            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-bold ring-1 ring-inset transition-colors ${ROLE_BADGE_CLASSES[meta.color]} ${canEditRole ? "hover:brightness-95" : "cursor-default opacity-100"}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
            {canEditRole && <ChevronDown className="h-3 w-3" />}
          </button>
          {roleMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setRoleMenuOpen(false)}
              />
              <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]">
                {(["admin", "agent"] as const).map((r) => {
                  const RM = ROLE_META[r];
                  const RIcon = RM.icon;
                  return (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className="flex w-full items-start gap-2.5 px-3 py-2 text-left hover:bg-neutral-50"
                    >
                      <RIcon className="mt-0.5 h-3.5 w-3.5 text-neutral-500" />
                      <div className="min-w-0">
                        <div className="text-[12.5px] font-bold text-neutral-900">
                          {RM.label}
                          {member.role === r && (
                            <Check className="ml-1 inline h-3 w-3 text-emerald-600" />
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {RM.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {canRemove && (
          <button
            onClick={remove}
            disabled={busy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            title="Retirer du workspace"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </li>
  );
}

/* ============================================================
   INVITATION ROW
   ============================================================ */

function InvitationRow({
  invitation,
  workspaceSlug,
  canManage,
  onChange,
}: {
  invitation: Invitation;
  workspaceSlug: string;
  canManage: boolean;
  onChange: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const meta = ROLE_META[invitation.role];

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/autosav/invite/${invitation.token}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silencieux */
    }
  }

  async function revoke() {
    if (!confirm(`Révoquer l'invitation envoyée à ${invitation.email} ?`))
      return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/invite?id=${invitation.id}`,
        { method: "DELETE" }
      );
      if (res.ok) onChange();
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50/50">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 ring-1 ring-inset ring-amber-200/60">
          <Mail className="h-4 w-4 text-amber-700" />
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-[13.5px] font-bold text-neutral-900">
            {invitation.email}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[12px] text-neutral-500">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold ring-1 ring-inset ${ROLE_BADGE_CLASSES[meta.color]}`}
            >
              {meta.label}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {expiresLabel(invitation.expiresAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <button
          onClick={copyLink}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-[12px] font-bold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Copié
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copier le lien
            </>
          )}
        </button>
        {canManage && (
          <button
            onClick={revoke}
            disabled={busy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
            title="Révoquer l'invitation"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </li>
  );
}

/* ============================================================
   INVITE MODAL
   ============================================================ */

function InviteModal({
  workspaceSlug,
  onClose,
  onInvited,
}: {
  workspaceSlug: string;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("agent");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/autosav/workspace/${workspaceSlug}/invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      const url = `${window.location.origin}/autosav/invite/${data.invitation.token}`;
      setInviteUrl(url);
    } catch (err) {
      setError("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)]"
      >
        <header className="flex items-center justify-between border-b border-neutral-200/70 px-5 py-3.5">
          <h3 className="font-display text-[15px] font-bold text-neutral-900">
            Inviter un membre
          </h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {inviteUrl ? (
          <div className="p-5">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/70 p-4 ring-1 ring-inset ring-emerald-200/50">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <div className="font-display text-[13.5px] font-bold text-emerald-900">
                  Invitation créée
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-emerald-800/90">
                  Partage ce lien avec {email}. Il expire dans 7 jours.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50/70 p-2.5">
              <div className="break-all text-[11.5px] text-neutral-700">
                {inviteUrl}
              </div>
            </div>
            <button
              onClick={copy}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-[13px] font-bold text-amber-200 hover:bg-emerald-900"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Lien copié
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copier le lien
                </>
              )}
            </button>
            <button
              onClick={onInvited}
              className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 text-[13px] font-bold text-neutral-700 hover:bg-neutral-50"
            >
              Terminé
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5">
            <label className="block">
              <span className="block text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Email du nouveau membre
              </span>
              <input
                autoFocus
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@boutique.fr"
                className="mt-1.5 block h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-[13.5px] text-neutral-900 placeholder:text-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </label>

            <fieldset className="mt-4">
              <legend className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                Rôle
              </legend>
              <div className="mt-2 grid gap-2">
                {(["agent", "admin"] as const).map((r) => {
                  const meta = ROLE_META[r];
                  const Icon = meta.icon;
                  const selected = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                        selected
                          ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-100"
                          : "border-neutral-200 hover:bg-neutral-50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${ROLE_BADGE_CLASSES[meta.color]}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-display text-[13px] font-bold text-neutral-900">
                          {meta.label}
                        </div>
                        <div className="text-[11.5px] leading-relaxed text-neutral-600">
                          {meta.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-[12px] text-rose-800 ring-1 ring-inset ring-rose-200/60">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-5 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-neutral-200 bg-white text-[13px] font-bold text-neutral-700 hover:bg-neutral-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy || !email.includes("@")}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-[13px] font-bold text-amber-200 transition-all hover:bg-emerald-900 disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Création…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" /> Créer l'invitation
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <Icon className="h-5 w-5" />
      </div>
      <h4 className="mt-3 font-display text-[14px] font-bold text-neutral-900">
        {title}
      </h4>
      <p className="mt-1 max-w-xs text-[12.5px] text-neutral-600">
        {description}
      </p>
    </div>
  );
}
