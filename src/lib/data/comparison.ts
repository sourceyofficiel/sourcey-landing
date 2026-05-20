export interface ComparisonRow {
  label: string;
  sourcey: boolean | string;
  cj: boolean | string;
  spocket: boolean | string;
  alibaba: boolean | string;
  freelance: boolean | string;
}

export const comparisonRows: ComparisonRow[] = [
  {
    label: "Support 100% francophone",
    sourcey: true,
    cj: false,
    spocket: false,
    alibaba: false,
    freelance: "Variable",
  },
  {
    label: "Agents humains sur place",
    sourcey: true,
    cj: false,
    spocket: false,
    alibaba: false,
    freelance: true,
  },
  {
    label: "Vidéo QC systématique",
    sourcey: true,
    cj: "Sur demande",
    spocket: false,
    alibaba: false,
    freelance: "Variable",
  },
  {
    label: "Petits volumes OK (10-200)",
    sourcey: true,
    cj: true,
    spocket: true,
    alibaba: false,
    freelance: false,
  },
  {
    label: "Gestion TVA EU / IOSS",
    sourcey: true,
    cj: false,
    spocket: false,
    alibaba: false,
    freelance: false,
  },
  {
    label: "Anti-contrefaçon vérifié",
    sourcey: true,
    cj: false,
    spocket: true,
    alibaba: false,
    freelance: "Variable",
  },
  {
    label: "Tarif transparent (pas de surprises)",
    sourcey: true,
    cj: true,
    spocket: true,
    alibaba: false,
    freelance: false,
  },
  {
    label: "Communauté FR + entraide",
    sourcey: true,
    cj: false,
    spocket: false,
    alibaba: false,
    freelance: false,
  },
];
