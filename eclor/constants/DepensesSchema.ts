// constants/depensesSchema.ts

/** ----- Nom exact de l’onglet ----- */
export const DEPENSES_SHEET_NAME = '💰Dépenses';

/** ----- Mapping des en-têtes (clé interne → libellé dans la Sheet) ----- */
export const DEPENSES_HEADERS = {
  libelle: '🧾 Libellé',
  montantTTC: '💶 Montant TTC',
  datePaiement: '📅 Date de paiement',
  facture: '📎 Facture',
  categorie: '🏷️ Catégorie',
  type: '📌 Type',
  amortissement: '⏳ Amortissement',
  abonnement: '🔁 Abonnement',
  duree: '🗓️ Durée',                  // nombre (pas une date)
  echeance: '📅 Échéance',            // date
  joursRestants: '⏳ Jours restants', // string ("J-164")
  estimationAnnuel: '🗓️ Estimation Annuel',
  url: '🔗 URL Gestion',
  finPrevue: '🏁 Fin prévue',
  mensualite: '💸 Mensualité',
  cumule: '📉 Cumulé à ce jour',
  id: '🆔 ID',
} as const;

export type DepensesHeaderKey = keyof typeof DEPENSES_HEADERS;

/** ----- Type d’une ligne normalisée ----- */
export type DepenseRow = {
  libelle: string;
  montantTTC: number;         // 0 si vide
  datePaiement: Date | null;  // null si vide
  facture: string;
  categorie: string;
  type: string;
  duree: number | null;       // null si vide
  echeance: Date | null;
  joursRestants: string;
  estimationAnnuel: number;   // 0 si vide
  url: string;
  mensualite: number;         // 0 si vide
  cumule: number;             // 0 si vide
  id: string;
};

/** ----- Options pour Catégories et Types ----- */
export type BadgeColor = 'green' | 'red' | 'amber' | 'blue' | 'slate' | 'purple';

export type OptionItem = {
  value: string;   // valeur exacte stockée dans la Sheet
  label: string;   // label sans emoji
  emoji?: string;
  color?: BadgeColor;
};

export const DEPENSES_CATEGORIES: readonly OptionItem[] = [
  { value: '🅿️ Parking',    label: 'Parking',    emoji: '🅿️', color: 'blue' },
  { value: '⛽️ Essence',    label: 'Essence',    emoji: '⛽️', color: 'red' },
  { value: '⚙️ Software',    label: 'Software',   emoji: '⚙️', color: 'amber' },
  { value: '🍽️ Repas',      label: 'Repas',      emoji: '🍽️', color: 'amber' },
  { value: '📦 Autre',       label: 'Autre',      emoji: '📦', color: 'slate' },
  { value: '🗃️ Assets',      label: 'Assets',     emoji: '🗃️', color: 'slate' },
  { value: '🤝🏼 Commission', label: 'Commission', emoji: '🤝🏼', color: 'blue' },
  { value: '🏛️ URSSAF',     label: 'URSSAF',     emoji: '🏛️', color: 'green' },
  { value: '🧰 Matériel',    label: 'Matériel',   emoji: '🧰', color: 'slate' },
  { value: '🚗 Transport',   label: 'Transport',  emoji: '🚗', color: 'red' },
  { value: '🛡️ Assurance',   label: 'Assurance',  emoji: '🛡️', color: 'purple' },
];

export const DEPENSES_TYPES: readonly OptionItem[] = [
  { value: '📌 Type',          label: 'Type',          emoji: '📌' },
  { value: '⏳ Amortissement', label: 'Amortissement', emoji: '⏳' },
  { value: '🔁 Abonnement',    label: 'Abonnement',    emoji: '🔁' },
];

/** ----- Helpers UI (utile côté web) ----- */
export function badgeByColor(color?: BadgeColor) {
  switch (color) {
    case 'green':  return 'bg-green-100 text-green-800';
    case 'red':    return 'bg-red-100 text-red-800';
    case 'amber':  return 'bg-amber-100 text-amber-800';
    case 'blue':   return 'bg-blue-100 text-blue-800';
    case 'purple': return 'bg-purple-100 text-purple-800';
    case 'slate':  return 'bg-slate-100 text-slate-800';
    default:       return 'bg-zinc-100 text-zinc-800';
  }
}

/** Tente de retrouver l’option à partir d’une valeur brute Sheet */
export function matchOption(raw: unknown, options: readonly OptionItem[]) {
  if (raw == null) return null;
  const s = String(raw).trim();

  let opt = options.find(o => o.value === s);
  if (opt) return opt;

  opt = options.find(o => o.label === s);
  if (opt) return opt;

  opt = options.find(o => `${o.emoji ?? ''} ${o.label}`.trim() === s);
  if (opt) return opt;

  opt = options.find(o => o.label?.toLowerCase?.() === s.toLowerCase());
  return opt ?? null;
}