"use client";

import { useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";

/**
 * ReferralWelcomeBanner — bannière discrète affichée 5s quand l'utilisateur
 * arrive avec un cookie src_ref (= venant d'un lien d'affiliation).
 *
 * Lit le cookie côté client (HttpOnly=false sur src_ref pour permettre ça).
 * Affichage one-shot par session via sessionStorage pour éviter de spammer
 * l'utilisateur à chaque page change.
 *
 * À monter dans le layout racine (ou le V2Background) pour être présent
 * sur toutes les pages marketing.
 */

const SESSION_KEY = "src_ref_welcome_shown";
const DISPLAY_DURATION_MS = 5000;

export function ReferralWelcomeBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Vérifie le cookie src_ref
    const cookieMatch = document.cookie.match(/(?:^|; )src_ref=([^;]+)/);
    if (!cookieMatch) return;

    // Une seule fois par session de navigation
    if (sessionStorage.getItem(SESSION_KEY)) return;

    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");

    const timer = setTimeout(() => setVisible(false), DISPLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[60] -translate-x-1/2 animate-[slideDown_0.4s_ease-out]">
      <div className="flex items-center gap-3 rounded-full border border-primary-200 bg-white px-4 py-2.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.2)]">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="text-[12.5px] font-medium text-neutral-700">
          Vous avez été invité par un membre Sourcey — profitez de notre
          programme dès aujourd&apos;hui.
        </div>
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}
