"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User as UserIcon,
  Mail,
  Lock,
  Loader2,
  Check,
  AlertCircle,
  Settings as SettingsIcon,
  Target,
} from "lucide-react";
import { getAvatarGradient, getInitials } from "@/lib/format";

export function SettingsView({
  email,
  fullName: initialFullName,
  role,
  dailyTarget,
  userId,
}: {
  email: string;
  fullName: string | null;
  role: string;
  dailyTarget: number;
  userId: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [password, setPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const gradient = getAvatarGradient(userId);
  const initials = getInitials(fullName, email);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await fetch(`/api/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMessage({ ok: false, text: data.error ?? "Erreur" });
        return;
      }
      setProfileMessage({ ok: true, text: "Profil mis à jour" });
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setPwdMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setPwdMessage({ ok: false, text: error.message });
        return;
      }
      setPwdMessage({ ok: true, text: "Mot de passe mis à jour" });
      setPassword("");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-black">
        <SettingsIcon className="h-3.5 w-3.5" />
        Réglages
      </div>
      <h1 className="mt-1 font-display text-[24px] font-extrabold tracking-tight text-neutral-900">
        Ton profil
      </h1>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <div
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-[18px] font-bold text-white ${gradient}`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-display text-[16px] font-bold text-neutral-900">
            {fullName || email.split("@")[0]}
          </div>
          <div className="text-[12px] text-neutral-500">{email}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#FFFF00]/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black ring-1 ring-inset ring-black/15">
              {role}
            </span>
            {role === "prospector" && (
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                <Target className="h-3 w-3" />
                Objectif : {dailyTarget}/jour
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nom complet */}
      <form
        onSubmit={saveProfile}
        className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5"
      >
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          <UserIcon className="h-3.5 w-3.5" />
          Nom affiché
        </div>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Alex Martin"
          className="mt-3 block h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
        />
        {profileMessage && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-[12px] ${
              profileMessage.ok
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-rose-300 bg-rose-50 text-rose-700"
            }`}
          >
            {profileMessage.ok ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            {profileMessage.text}
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFFF00] px-4 text-[12.5px] font-bold text-black hover:brightness-110 disabled:opacity-50"
          >
            {savingProfile && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Enregistrer
          </button>
        </div>
      </form>

      {/* Mot de passe */}
      <form
        onSubmit={changePassword}
        className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5"
      >
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          <Lock className="h-3.5 w-3.5" />
          Changer le mot de passe
        </div>
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe (8 caractères min)"
          className="mt-3 block h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-[13px] text-neutral-900 focus:border-black focus:outline-none"
        />
        {pwdMessage && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-xl border p-3 text-[12px] ${
              pwdMessage.ok
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-rose-300 bg-rose-50 text-rose-700"
            }`}
          >
            {pwdMessage.ok ? (
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            )}
            {pwdMessage.text}
          </div>
        )}
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            disabled={savingPassword || password.length < 8}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FFFF00] px-4 text-[12.5px] font-bold text-black hover:brightness-110 disabled:opacity-50"
          >
            {savingPassword && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Mettre à jour
          </button>
        </div>
      </form>

      {/* Email (info only) */}
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
          <Mail className="h-3.5 w-3.5" />
          Email
        </div>
        <div className="mt-2 font-mono text-[13px] text-neutral-700">
          {email}
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Pour changer ton email, contacte un admin.
        </p>
      </div>
    </div>
  );
}
