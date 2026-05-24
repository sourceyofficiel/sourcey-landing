"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

/**
 * Playground IA — pour tester la génération de drafts sans avoir besoin de
 * connecter une boîte mail réelle. Colle un email exemple, clic, voit le draft.
 *
 * C'est ce qu'on utilise pour démontrer l'outil à des prospects sans setup.
 */

const EXAMPLE_EMAILS = [
  {
    label: "Demande de suivi colis",
    customerEmail: "jean@example.com",
    customerName: "Jean Dupont",
    subject: "Où en est ma commande ?",
    body: `Bonjour,

J'ai commandé il y a 5 jours et je n'ai toujours pas reçu de mail de tracking. C'est normal ?

Numéro de commande : #12847

Merci d'avance pour votre réponse.

Jean`,
  },
  {
    label: "Demande de retour",
    customerEmail: "marie@example.com",
    customerName: "Marie Lefèvre",
    subject: "Retour produit",
    body: `Bonjour,

Je voudrais retourner le t-shirt que j'ai reçu, la taille ne me va pas. Comment je dois faire ?

J'ai bien gardé l'emballage d'origine.

Cordialement,
Marie`,
  },
  {
    label: "Question avant achat",
    customerEmail: "thomas@example.com",
    customerName: "Thomas",
    subject: "Question sur la livraison",
    body: `Hello,

Je veux commander pour mon anniversaire le 20 décembre. Est-ce que je peux être livré avant ?

Merci !`,
  },
];

export function PlaygroundClient({
  workspaceSlug,
  workspaceName,
  signature,
  tone,
  kbText,
}: {
  workspaceSlug: string;
  workspaceName: string;
  signature: string;
  tone: string;
  kbText: string;
}) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [draft, setDraft] = useState<string | null>(null);
  const [usage, setUsage] = useState<{
    inputTokens: number;
    outputTokens: number;
    costCents: number;
    isMetered: boolean;
    ticketsUsedThisMonth: number;
    quotaLimit: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function loadExample(idx: number) {
    const ex = EXAMPLE_EMAILS[idx];
    setCustomerEmail(ex.customerEmail);
    setCustomerName(ex.customerName);
    setSubject(ex.subject);
    setBody(ex.body);
    setDraft(null);
    setError(null);
  }

  async function generate() {
    if (!subject.trim() || !body.trim() || !customerEmail.trim()) {
      setError("Email, sujet et corps requis");
      return;
    }
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const res = await fetch("/api/autosav/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceSlug,
          customerEmail,
          customerName: customerName || undefined,
          subject,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      setDraft(data.draft);
      setUsage(data.usage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const kbWarning = !kbText || kbText.length < 20;

  return (
    <main className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:px-8">
          <Link
            href={`/autosav/w/${workspaceSlug}`}
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour dashboard
          </Link>
          <div className="text-[12.5px] text-neutral-500">
            <strong className="text-neutral-900">{workspaceName}</strong> ·
            Playground IA
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 py-8 md:px-8 md:py-10">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-[24px] font-extrabold tracking-tight md:text-[30px]">
              Playground IA
            </h1>
            <p className="mt-1 text-[14px] text-neutral-500">
              Colle un email client (ou pick un exemple) → l&apos;IA rédige la
              réponse avec ton ton de marque et ta knowledge base.
            </p>
          </div>
        </div>

        {kbWarning && (
          <div className="mb-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <strong>Ta knowledge base est vide.</strong> L&apos;IA va répondre
              de manière générique. Va sur{" "}
              <Link
                href={`/autosav/w/${workspaceSlug}/settings`}
                className="underline"
              >
                Réglages
              </Link>{" "}
              pour ajouter ta politique de retour, FAQ, etc.
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* === LEFT : Input === */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[16px] font-extrabold tracking-tight">
                Email reçu du client
              </h2>
              <div className="flex gap-1">
                {EXAMPLE_EMAILS.map((ex, i) => (
                  <button
                    key={ex.label}
                    onClick={() => loadExample(i)}
                    className="rounded-md bg-neutral-100 px-2 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-200"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="block h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nom (optionnel)"
                  className="block h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de l'email"
                className="block h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Corps de l'email client..."
                className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-[14px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-[14.5px] font-bold text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Génération…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Générer la réponse
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* === RIGHT : Draft === */}
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:p-7">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-[16px] font-extrabold tracking-tight">
                Réponse générée
              </h2>
              {draft && (
                <button
                  onClick={copyDraft}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-100 px-3 py-1.5 text-[12px] font-bold text-neutral-700 hover:bg-neutral-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" /> Copié
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copier
                    </>
                  )}
                </button>
              )}
            </div>

            {!draft && !loading && (
              <div className="mt-5 flex h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 text-center">
                <Sparkles className="h-8 w-8 text-neutral-300" />
                <p className="mt-3 max-w-[280px] text-[13.5px] text-neutral-500">
                  Clique sur <strong>Générer la réponse</strong> pour voir
                  AutoSAV rédiger une réponse à cet email.
                </p>
              </div>
            )}

            {loading && (
              <div className="mt-5 flex h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  <p className="text-[13.5px] text-neutral-500">
                    Claude réfléchit…
                  </p>
                </div>
              </div>
            )}

            {draft && (
              <>
                <div className="mt-5 whitespace-pre-wrap rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 font-sans text-[13.5px] leading-relaxed text-neutral-800">
                  {draft}
                </div>

                {usage && (
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-neutral-100 p-3">
                      <div className="font-mono text-[14px] font-bold text-neutral-900">
                        {usage.inputTokens}/{usage.outputTokens}
                      </div>
                      <div className="text-[10.5px] text-neutral-500">
                        Tokens in/out
                      </div>
                    </div>
                    <div className="rounded-lg bg-neutral-100 p-3">
                      <div className="font-mono text-[14px] font-bold text-neutral-900">
                        {(usage.costCents / 100).toFixed(3)}€
                      </div>
                      <div className="text-[10.5px] text-neutral-500">
                        Coût marge
                      </div>
                    </div>
                    <div
                      className={`rounded-lg p-3 ${
                        usage.isMetered ? "bg-amber-50" : "bg-green-50"
                      }`}
                    >
                      <div className="font-mono text-[14px] font-bold text-neutral-900">
                        {usage.ticketsUsedThisMonth}/{usage.quotaLimit}
                      </div>
                      <div
                        className={`text-[10.5px] ${
                          usage.isMetered ? "text-amber-700" : "text-green-700"
                        }`}
                      >
                        {usage.isMetered ? "+ 0,12€ overflow" : "Dans le quota"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Context info */}
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
            Contexte utilisé pour ce draft
          </div>
          <div className="mt-3 grid gap-3 text-[12.5px] md:grid-cols-2">
            <div>
              <span className="font-bold text-neutral-700">Ton :</span>{" "}
              <span className="text-neutral-500">{tone}</span>
            </div>
            <div>
              <span className="font-bold text-neutral-700">Signature :</span>{" "}
              <span className="text-neutral-500">{signature.split("\n")[0]}…</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-bold text-neutral-700">KB :</span>{" "}
              <span className="text-neutral-500">
                {kbText ? `${kbText.length} caractères` : "vide — ajouter dans Réglages"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
