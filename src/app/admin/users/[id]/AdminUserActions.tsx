"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Unlock,
  Power,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  emailVerifiedAt: Date | string | null;
  disabledAt: Date | string | null;
  lockedUntil: Date | string | null;
  failedLoginAttempts: number;
  lastLoginAt: Date | string | null;
}

interface LoginLog {
  id: string;
  success: boolean;
  method: string;
  failureReason: string | null;
  ipFingerprint: string;
  userAgent: string | null;
  createdAt: string;
}

/**
 * Panneau d'actions admin sur un user :
 *   - Statut (badge selon emailVerified / locked / disabled)
 *   - Boutons : Débloquer / Désactiver-Réactiver / Renvoyer email vérif
 *   - Liste des 50 dernières connexions (LoginLog)
 *
 * À mounter dans la page /admin/users/[id]/page.tsx.
 */
export function AdminUserActions({ user: initialUser }: { user: User }) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  // Fetch login logs au mount
  useEffect(() => {
    fetch(`/api/admin/users/${user.id}/logs`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => {/* silent */});
  }, [user.id]);

  const lockedNow =
    user.lockedUntil ? new Date(user.lockedUntil) > new Date() : false;

  // Calcul du statut courant pour le badge
  const status = user.disabledAt
    ? { label: "Désactivé", color: "bg-rose-50 text-rose-700 border-rose-200" }
    : lockedNow
      ? { label: "Bloqué", color: "bg-amber-50 text-amber-700 border-amber-200" }
      : !user.emailVerifiedAt
        ? { label: "Email non vérifié", color: "bg-blue-50 text-blue-700 border-blue-200" }
        : { label: "Actif", color: "bg-green-50 text-green-700 border-green-200" };

  async function runAction(action: string) {
    if (loadingAction) return;
    setLoadingAction(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ ok: false, text: data.error ?? "Erreur" });
        return;
      }
      setMessage({ ok: true, text: data.message ?? "OK" });

      // Maj locale du user selon l'action
      const updates: Partial<User> = {};
      if (action === "unlock") updates.lockedUntil = null;
      if (action === "disable") updates.disabledAt = new Date().toISOString();
      if (action === "enable") updates.disabledAt = null;
      setUser((u) => ({ ...u, ...updates }));
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Erreur réseau" });
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      {/* === STATUS + ACTIONS === */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-neutral-500">
              <Shield className="h-3.5 w-3.5" />
              Statut du compte
            </div>
            <div
              className={`mt-2 inline-flex items-center rounded-full border px-3 py-1 text-[12.5px] font-bold ${status.color}`}
            >
              {status.label}
            </div>
            {user.failedLoginAttempts > 0 && (
              <p className="mt-2 text-[12px] text-neutral-500">
                {user.failedLoginAttempts} tentative
                {user.failedLoginAttempts > 1 ? "s" : ""} échouée
                {user.failedLoginAttempts > 1 ? "s" : ""}
                {user.lockedUntil &&
                  new Date(user.lockedUntil) > new Date() &&
                  ` · Bloqué jusqu'au ${new Date(user.lockedUntil).toLocaleString("fr-FR")}`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {lockedNow && (
              <ActionBtn
                onClick={() => runAction("unlock")}
                loading={loadingAction === "unlock"}
                label="Débloquer"
                icon={Unlock}
                color="amber"
              />
            )}
            {!user.emailVerifiedAt && (
              <ActionBtn
                onClick={() => runAction("resend_verification")}
                loading={loadingAction === "resend_verification"}
                label="Renvoyer email vérif"
                icon={Mail}
                color="blue"
              />
            )}
            {user.disabledAt ? (
              <ActionBtn
                onClick={() => runAction("enable")}
                loading={loadingAction === "enable"}
                label="Réactiver le compte"
                icon={Power}
                color="green"
              />
            ) : (
              <ActionBtn
                onClick={() => {
                  if (confirm("Désactiver ce compte ? L'user ne pourra plus se connecter."))
                    runAction("disable");
                }}
                loading={loadingAction === "disable"}
                label="Désactiver"
                icon={Lock}
                color="rose"
              />
            )}
          </div>
        </div>

        {message && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-[13px] ${
              message.ok
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {message.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* === LOGIN LOGS === */}
      <div className="rounded-2xl border border-neutral-200 bg-white">
        <div className="border-b border-neutral-200 p-5">
          <h3 className="font-display text-[16px] font-extrabold tracking-tight text-neutral-900">
            Connexions récentes
          </h3>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            50 dernières tentatives · IPs hashées (RGPD)
          </p>
        </div>
        {logs.length === 0 ? (
          <p className="p-5 text-[13px] text-neutral-500">
            Aucune connexion enregistrée.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-neutral-50 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Statut</th>
                  <th className="px-4 py-2.5">Méthode</th>
                  <th className="px-4 py-2.5">IP fingerprint</th>
                  <th className="px-4 py-2.5">User-Agent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr
                    key={l.id}
                    className="border-t border-neutral-100"
                  >
                    <td className="px-4 py-2.5 whitespace-nowrap text-neutral-700">
                      {new Date(l.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      {l.success ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                          OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                          {l.failureReason ?? "échec"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-700">{l.method}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-neutral-500">
                      {l.ipFingerprint}…
                    </td>
                    <td className="px-4 py-2.5 max-w-[280px] truncate text-[12px] text-neutral-500">
                      {l.userAgent ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({
  onClick,
  loading,
  label,
  icon: Icon,
  color,
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "amber" | "blue" | "green" | "rose";
}) {
  const colors = {
    amber: "bg-amber-600 hover:bg-amber-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    rose: "bg-rose-600 hover:bg-rose-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12.5px] font-bold text-white disabled:opacity-60 ${colors[color]}`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
