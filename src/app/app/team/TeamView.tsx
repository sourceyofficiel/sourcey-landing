"use client";

import { useState } from "react";
import {
  UserPlus,
  UserCog,
  Crown,
  User as UserIcon,
  Mail,
  Copy,
  Check,
  X,
  AlertCircle,
  Loader2,
  Trash2,
  Power,
} from "lucide-react";
import { formatTimeAgo, getAvatarGradient, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "prospector";
  daily_target: number;
  monthly_salary_cents: number;
  is_active: boolean;
  created_at: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  created_at: string;
  inviter: { id: string; full_name: string | null; email: string } | null;
}

export function TeamView({
  initialMembers,
  initialInvitations,
}: {
  initialMembers: Member[];
  initialInvitations: Invitation[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [invitations, setInvitations] = useState(initialInvitations);
  const [inviteOpen, setInviteOpen] = useState(false);

  async function updateMember(m: Member, patch: Partial<Member>) {
    setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, ...patch } : x)));
    await fetch(`/api/members/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  }

  async function revokeInvite(inv: Invitation) {
    if (!confirm(`Révoquer l'invitation à ${inv.email} ?`)) return;
    const res = await fetch(`/api/invitations/${inv.id}`, { method: "DELETE" });
    if (res.ok) setInvitations((prev) => prev.filter((x) => x.id !== inv.id));
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black">
            <UserCog className="h-3.5 w-3.5" />
            Équipe
          </div>
          <h1 className="mt-1 font-display text-[24px] font-extrabold tracking-tight text-neutral-900">
            Membres et invitations
          </h1>
          <p className="mt-1 max-w-xl text-[13px] text-neutral-500">
            Invite tes prospecteurs (300€/mois) ou un co-admin. L&apos;accès
            est strictement sur invitation.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#FFFF00] px-4 text-[13px] font-bold text-black shadow-md shadow-black/10 hover:brightness-110"
        >
          <UserPlus className="h-4 w-4" />
          Inviter quelqu&apos;un
        </button>
      </div>

      {/* Members */}
      <section className="mt-6">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          Membres ({members.length})
        </h2>
        <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          {members.map((m, idx) => (
            <MemberRow
              key={m.id}
              member={m}
              first={idx === 0}
              onUpdate={(patch) => updateMember(m, patch)}
            />
          ))}
        </div>
      </section>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Invitations en attente ({invitations.length})
          </h2>
          <div className="mt-2 space-y-2">
            {invitations.map((inv) => (
              <InvitationRow
                key={inv.id}
                invitation={inv}
                onRevoke={() => revokeInvite(inv)}
              />
            ))}
          </div>
        </section>
      )}

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onCreated={(inv) => {
            setInvitations((prev) => [inv, ...prev]);
          }}
        />
      )}
    </div>
  );
}

function MemberRow({
  member,
  first,
  onUpdate,
}: {
  member: Member;
  first: boolean;
  onUpdate: (patch: Partial<Member>) => void;
}) {
  const gradient = getAvatarGradient(member.id);
  const initials = getInitials(member.full_name, member.email);
  const Icon = member.role === "admin" ? Crown : UserIcon;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 p-4",
        !first && "border-t border-neutral-200",
        !member.is_active && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[12.5px] font-bold text-white",
          gradient
        )}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-display text-[14px] font-bold text-neutral-900">
            {member.full_name ?? member.email.split("@")[0]}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset",
              member.role === "admin"
                ? "bg-amber-50 text-amber-700 ring-amber-200"
                : "bg-neutral-100 text-neutral-700 ring-neutral-300/50"
            )}
          >
            <Icon className="h-2.5 w-2.5" />
            {member.role}
          </span>
          {!member.is_active && (
            <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-200">
              Désactivé
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[11.5px] text-neutral-500">
          {member.email}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
        <label className="flex items-center gap-1.5">
          <span className="text-neutral-500">Objectif/j</span>
          <input
            type="number"
            min="0"
            value={member.daily_target}
            onChange={(e) =>
              onUpdate({ daily_target: parseInt(e.target.value) || 0 })
            }
            className="h-7 w-14 rounded-md border border-neutral-200 bg-white px-1.5 text-center text-[11px] text-neutral-900 focus:border-black focus:outline-none"
          />
        </label>
        <select
          value={member.role}
          onChange={(e) =>
            onUpdate({ role: e.target.value as "admin" | "prospector" })
          }
          className="h-7 rounded-md border border-neutral-200 bg-white px-1.5 text-[11px] text-neutral-900 focus:border-black focus:outline-none"
        >
          <option value="prospector">Prospecteur</option>
          <option value="admin">Admin</option>
        </select>
        <button
          onClick={() => onUpdate({ is_active: !member.is_active })}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
          title={member.is_active ? "Désactiver" : "Réactiver"}
        >
          <Power className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function InvitationRow({
  invitation,
  onRevoke,
}: {
  invitation: Invitation;
  onRevoke: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/invite/${invitation.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFFF00]/20 text-black ring-1 ring-inset ring-black/15">
        <Mail className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold text-neutral-900">
          {invitation.email}
        </div>
        <div className="mt-0.5 text-[11px] text-neutral-500">
          Rôle :{" "}
          <span className="font-bold text-neutral-700">{invitation.role}</span>{" "}
          · Envoyée {formatTimeAgo(invitation.created_at)} · Expire{" "}
          {formatTimeAgo(invitation.expires_at)}
        </div>
      </div>
      <button
        onClick={copyLink}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 text-[11.5px] font-bold text-neutral-800 hover:bg-neutral-100"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-600" />
            Lien copié
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copier le lien
          </>
        )}
      </button>
      <button
        onClick={onRevoke}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-rose-500/40 hover:bg-rose-50 hover:text-rose-700"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function InviteModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (inv: Invitation) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"prospector" | "admin">("prospector");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      onCreated(data.invitation);
      setInviteUrl(data.inviteUrl);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3.5">
          <h3 className="font-display text-[15px] font-bold text-neutral-900">
            Inviter quelqu&apos;un
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!inviteUrl ? (
          <>
            <div className="space-y-3 p-5">
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="mt-1 block h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                  Rôle
                </label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(["prospector", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "rounded-lg border p-3 text-left text-[12px] transition-colors",
                        role === r
                          ? "border-black bg-[#FFFF00]/20"
                          : "border-neutral-200 bg-neutral-50 hover:border-neutral-300"
                      )}
                    >
                      <div className="font-bold text-neutral-900">
                        {r === "admin" ? "Admin" : "Prospecteur"}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {r === "admin"
                          ? "Accès complet, gère l'équipe"
                          : "Voit ses prospections, ajoute des influenceurs"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-[12px] text-rose-700">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-[12.5px] font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={busy || !email.includes("@")}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFFF00] px-4 text-[12.5px] font-bold text-black hover:brightness-110 disabled:opacity-50"
              >
                {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Créer l&apos;invitation
              </button>
            </div>
          </>
        ) : (
          <div className="p-5">
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-[12.5px] text-emerald-700">
              <Check className="mr-1 inline h-3.5 w-3.5" />
              Invitation créée ! Partage ce lien manuellement (DM, mail) — il
              expire dans 7 jours.
            </div>
            <div className="mt-3 break-all rounded-lg bg-white p-3 font-mono text-[11px] text-neutral-700">
              {inviteUrl}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={copy}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#FFFF00] text-[12.5px] font-bold text-black hover:brightness-110"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copier le lien
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="h-10 rounded-lg border border-neutral-200 bg-white px-4 text-[12.5px] font-bold text-neutral-700 hover:bg-neutral-100"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
