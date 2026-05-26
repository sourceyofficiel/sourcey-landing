"use client";

import { useState } from "react";
import {
  Plus,
  FileText,
  Edit3,
  Trash2,
  Loader2,
  X,
  Copy,
  Check,
  Mail,
  MessageSquare,
} from "lucide-react";
import { formatTimeAgo } from "@/lib/format";

interface Brand {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
  brand_id: string | null;
  brand: Brand | null;
  is_shared: boolean;
  created_at: string;
}

const CHANNELS = [
  { value: "email", label: "Email", icon: Mail },
  { value: "dm_instagram", label: "DM Instagram", icon: MessageSquare },
  { value: "dm_tiktok", label: "DM TikTok", icon: MessageSquare },
];

export function TemplatesView({
  initialTemplates,
  brands,
}: {
  initialTemplates: Template[];
  brands: Brand[];
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editing, setEditing] = useState<Template | "new" | null>(null);

  async function deleteTemplate(t: Template) {
    if (!confirm(`Supprimer "${t.name}" ?`)) return;
    const res = await fetch(`/api/templates/${t.id}`, { method: "DELETE" });
    if (res.ok) setTemplates((prev) => prev.filter((x) => x.id !== t.id));
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-8 lg:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-violet-300">
            <FileText className="h-3.5 w-3.5" />
            Modèles de messages
          </div>
          <h1 className="mt-1 font-display text-[24px] font-extrabold tracking-tight text-white">
            Templates partagés
          </h1>
          <p className="mt-1 max-w-xl text-[13px] text-neutral-400">
            Pour les approches récurrentes. Variables supportées : {"{prenom}"},
            {" {marque}"}, {"{niche}"}. À copier-coller manuellement dans tes
            DM/emails.
          </p>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[13px] font-bold text-white shadow-md shadow-violet-500/20 hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nouveau modèle
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {templates.length === 0 ? (
          <div className="sm:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 text-center">
            <FileText className="mx-auto h-7 w-7 text-neutral-500" />
            <p className="mt-3 text-[13px] text-neutral-400">
              Pas encore de modèle. Crée ton premier template pour gagner du
              temps sur tes approches.
            </p>
          </div>
        ) : (
          templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              onEdit={() => setEditing(t)}
              onDelete={() => deleteTemplate(t)}
            />
          ))
        )}
      </div>

      {editing && (
        <TemplateModal
          template={editing === "new" ? null : editing}
          brands={brands}
          onClose={() => setEditing(null)}
          onSaved={(t) => {
            if (editing === "new") {
              setTemplates((prev) => [t, ...prev]);
            } else {
              setTemplates((prev) =>
                prev.map((x) => (x.id === t.id ? t : x))
              );
            }
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const channel = CHANNELS.find((c) => c.value === template.channel);
  const Icon = channel?.icon ?? Mail;

  async function copyBody() {
    const text = template.subject
      ? `Objet: ${template.subject}\n\n${template.body}`
      : template.body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-[14px] font-bold text-white">
            {template.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-neutral-500">
            <span>{channel?.label}</span>
            {template.brand && (
              <>
                <span>·</span>
                <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">
                  {template.brand.name}
                </span>
              </>
            )}
            {!template.is_shared && (
              <>
                <span>·</span>
                <span className="text-amber-400">Perso</span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={copyBody}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
            title="Copier"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {template.subject && (
        <div className="mt-3 rounded-lg bg-neutral-950 p-2.5">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-neutral-500">
            Objet
          </div>
          <div className="mt-0.5 text-[12px] font-bold text-neutral-200">
            {template.subject}
          </div>
        </div>
      )}
      <div className="mt-2 rounded-lg bg-neutral-950 p-2.5">
        <pre className="line-clamp-4 whitespace-pre-wrap font-sans text-[11.5px] text-neutral-300">
          {template.body}
        </pre>
      </div>
      <div className="mt-2 text-[10px] text-neutral-600">
        Créé {formatTimeAgo(template.created_at)}
      </div>
    </div>
  );
}

function TemplateModal({
  template,
  brands,
  onClose,
  onSaved,
}: {
  template: Template | null;
  brands: Brand[];
  onClose: () => void;
  onSaved: (t: Template) => void;
}) {
  const [name, setName] = useState(template?.name ?? "");
  const [channel, setChannel] = useState(template?.channel ?? "email");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [brandId, setBrandId] = useState(template?.brand_id ?? "");
  const [isShared, setIsShared] = useState(template?.is_shared ?? true);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name,
        channel,
        subject: channel === "email" ? subject || null : null,
        body,
        brand_id: brandId || null,
        is_shared: isShared,
      };
      const url = template
        ? `/api/templates/${template.id}`
        : "/api/templates";
      const method = template ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) onSaved(data.template);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-3.5">
          <h3 className="font-display text-[15px] font-bold text-white">
            {template ? "Éditer le modèle" : "Nouveau modèle"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-3 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Nom *
              </label>
              <input
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Approche micro TikTok"
                className="mt-1 block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Canal *
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
              >
                {CHANNELS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Marque (optionnel)
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="mt-1 block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
            >
              <option value="">— Toutes les marques —</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          {channel === "email" && (
            <div>
              <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Objet email
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Collaboration {marque} x {prenom}"
                className="mt-1 block h-10 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 text-[13px] text-white focus:border-violet-500 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="block text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
              Corps du message *
            </label>
            <textarea
              required
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                "Salut {prenom} !\n\nJe te contacte de la part de {marque}, on adore ton contenu...\n\n[ta valeur]\n\nDis-moi si ça t'intéresse !"
              }
              className="mt-1 block w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 font-mono text-[12px] text-white focus:border-violet-500 focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-neutral-500">
              Variables : <code>{"{prenom}"}</code> <code>{"{marque}"}</code>{" "}
              <code>{"{niche}"}</code> — remplacées manuellement avant envoi.
            </p>
          </div>
          <label className="flex items-center gap-2 text-[12.5px] text-neutral-300">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 accent-violet-500"
            />
            Partagé avec toute l&apos;équipe (sinon : visible que par toi)
          </label>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-800 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-neutral-800 bg-neutral-900 px-4 text-[12.5px] font-bold text-neutral-300 hover:bg-neutral-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={busy || !name.trim() || !body.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 px-4 text-[12.5px] font-bold text-white hover:brightness-110 disabled:opacity-50"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {template ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </div>
  );
}
