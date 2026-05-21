/**
 * Badge de statut Brief — utilisé dans toutes les listes/détails admin.
 */

export const BRIEF_STATUSES: { value: string; label: string }[] = [
  { value: "new", label: "Nouveau" },
  { value: "in-review", label: "En revue" },
  { value: "supplier-contacted", label: "Fournisseur contacté" },
  { value: "quote-ready", label: "Devis prêt" },
  { value: "ordered", label: "Commandé" },
  { value: "completed", label: "Terminé" },
  { value: "cancelled", label: "Annulé" },
];

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  new: { label: "Nouveau", cls: "bg-amber-100 text-amber-800 ring-amber-200" },
  "in-review": {
    label: "En revue",
    cls: "bg-blue-100 text-blue-800 ring-blue-200",
  },
  "supplier-contacted": {
    label: "Fournisseur",
    cls: "bg-purple-100 text-purple-800 ring-purple-200",
  },
  "quote-ready": {
    label: "Devis prêt",
    cls: "bg-green-100 text-green-800 ring-green-200",
  },
  ordered: {
    label: "Commandé",
    cls: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  },
  completed: {
    label: "Terminé",
    cls: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  },
  cancelled: {
    label: "Annulé",
    cls: "bg-rose-100 text-rose-700 ring-rose-200",
  },
};

export function AdminStatusBadge({ status }: { status: string }) {
  const m = STATUS_STYLES[status] ?? {
    label: status,
    cls: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ring-1 ring-inset ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
