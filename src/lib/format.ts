/**
 * Helpers d'affichage : nombres compacts (1.2M), durées relatives, montants,
 * taux d'engagement. Tous formats français.
 */

export function formatCompactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 10000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  if (n < 1000000) return Math.round(n / 1000) + "k";
  if (n < 10000000) return (n / 1000000).toFixed(1).replace(".0", "") + "M";
  return Math.round(n / 1000000) + "M";
}

export function formatMoneyCents(cents: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  return `il y a ${Math.floor(months / 12)} an${Math.floor(months / 12) > 1 ? "s" : ""}`;
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(
    "fr-FR",
    opts ?? { day: "numeric", month: "short", year: "numeric" }
  );
}

export function getInitials(name: string | null, fallback: string): string {
  const source = name ?? fallback;
  return source
    .split(/[\s@_.-]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function getAvatarGradient(seed: string): string {
  const gradients = [
    "from-violet-500 to-fuchsia-500",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-cyan-500 to-blue-500",
    "from-indigo-500 to-purple-500",
    "from-rose-500 to-red-500",
    "from-fuchsia-500 to-pink-500",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return gradients[Math.abs(h) % gradients.length];
}

export const SIZE_TIER_LABEL: Record<string, string> = {
  nano: "Nano",
  micro: "Micro",
  mid: "Moyen",
  macro: "Macro",
  mega: "Méga",
};

export const SIZE_TIER_RANGE: Record<string, string> = {
  nano: "< 10k",
  micro: "10k–100k",
  mid: "100k–500k",
  macro: "500k–1M",
  mega: "1M+",
};

export const PROSPECTION_STATUS_LABEL: Record<string, string> = {
  to_contact: "À contacter",
  contacted: "Contacté",
  awaiting_reply: "En attente",
  negotiating: "En négociation",
  accepted: "Accepté",
  refused: "Refusé",
  ghosted: "Ghosted",
};

export const PROSPECTION_STATUS_COLOR: Record<string, string> = {
  to_contact: "neutral",
  contacted: "blue",
  awaiting_reply: "amber",
  negotiating: "violet",
  accepted: "emerald",
  refused: "rose",
  ghosted: "neutral",
};

export const GLOBAL_STATUS_LABEL: Record<string, string> = {
  lead: "Lead",
  contacted: "Contacté",
  negotiating: "En négociation",
  accepted: "Accepté",
  refused: "Refusé",
  blacklist: "Blacklist",
};

export const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  active: "Active",
  paused: "En pause",
  completed: "Terminée",
};
