"use client";

import { useState } from "react";
import { Copy, Check, Share2, Link as LinkIcon } from "lucide-react";

/**
 * AffiliateLink — affiche le lien de l'affilié avec Copier + Partager.
 *
 * - Copier : navigator.clipboard.writeText
 * - Partager : navigator.share (mobile) → fallback copy si pas dispo (desktop)
 */
export function AffiliateLink({ code, link }: { code: string; link: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  const share = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Sourcey — sourcing en Chine géré pour toi",
          text: "Découvre Sourcey, le partenaire qui gère ton sourcing en Chine de A à Z.",
          url: link,
        });
        return;
      } catch {
        // user cancelled or unsupported → fallback copy
      }
    }
    copy();
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
      <div className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center md:p-7">
        <div>
          <div className="flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider text-neutral-500">
            <LinkIcon className="h-3 w-3" /> Ton lien d&apos;affiliation
          </div>
          <button
            type="button"
            onClick={copy}
            className="mt-2 block w-full truncate rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left font-mono text-[14px] text-neutral-800 transition-colors hover:bg-neutral-100"
            title="Cliquer pour copier"
          >
            {link}
          </button>
          <div className="mt-2 text-[12px] text-neutral-400">
            Code : <span className="font-mono font-bold text-neutral-600">{code}</span>{" "}
            · Cookie valable 90 jours après le clic
          </div>
        </div>
        <div className="flex gap-2 md:flex-col">
          <button
            onClick={copy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-primary-700 md:flex-none"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" /> Copié
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" /> Copier
              </>
            )}
          </button>
          <button
            onClick={share}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-[13px] font-bold text-neutral-700 transition-colors hover:bg-neutral-50 md:flex-none"
          >
            <Share2 className="h-4 w-4" /> Partager
          </button>
        </div>
      </div>
    </div>
  );
}
