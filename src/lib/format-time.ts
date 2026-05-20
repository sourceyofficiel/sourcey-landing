/**
 * Formats a date relative to now, in French.
 * E.g. "à l'instant", "il y a 5 min", "à 14:32", "hier 09:12", "12 avr."
 */
export function formatRelative(dateInput: string | Date, now: Date = new Date()): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 30) return "à l'instant";
  if (diff < 60) return `il y a ${Math.floor(diff)}s`;
  if (diff < 60 * 60) return `il y a ${Math.floor(diff / 60)} min`;

  const today = startOfDay(now);
  const dateDay = startOfDay(date);
  if (dateDay.getTime() === today.getTime()) {
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateDay.getTime() === yesterday.getTime()) {
    return `hier ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  }

  const sameWeek = diff < 60 * 60 * 24 * 6;
  if (sameWeek) {
    return date.toLocaleDateString("fr-FR", { weekday: "short" });
  }

  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatDaySeparator(date: Date, now: Date = new Date()): string {
  const today = startOfDay(now);
  const target = startOfDay(date);
  if (target.getTime() === today.getTime()) return "Aujourd'hui";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (target.getTime() === yesterday.getTime()) return "Hier";
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: sameYear ? undefined : "numeric",
  });
}

export function formatHourMinute(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function startOfDay(d: Date): Date {
  const n = new Date(d);
  n.setHours(0, 0, 0, 0);
  return n;
}
