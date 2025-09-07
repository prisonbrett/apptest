// lib/mapDepenses.ts
import { dateFromSerial } from '@/lib/dateSerial';
import {
  DEPENSES_HEADERS,
  type DepensesHeaderKey,
  type DepenseRow,
} from '@/constants/DepensesSchema';

/** Normalise un libellé d’en-tête pour matcher de façon robuste */
function norm(s: unknown): string {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ''); // retire tous les espaces
}

/** Construit l’index: clé interne -> index de colonne */
function buildIndex(headerRow: any[]): Partial<Record<DepensesHeaderKey, number>> {
  const idx: Partial<Record<DepensesHeaderKey, number>> = {};

  // libellés attendus normalisés -> clé interne
  const wanted = Object.fromEntries(
    (Object.entries(DEPENSES_HEADERS) as [DepensesHeaderKey, string][])
      .map(([k, label]) => [norm(label), k])
  ) as Record<string, DepensesHeaderKey>;

  headerRow.forEach((cell, i) => {
    const key = wanted[norm(cell)];
    if (key) idx[key] = i;
  });

  return idx;
}

// Helpers de lecture
const S  = (row: any[], i?: number) => (i == null ? ''   : String(row[i] ?? '').trim());
const N  = (row: any[], i?: number) => (i == null ? 0    : Number(row[i] ?? 0)); // number (0 par défaut)
const Nn = (row: any[], i?: number) => {                                         // number|null
  if (i == null) return null;
  const v = row[i];
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const Dt = (row: any[], i?: number) => (i == null ? null : dateFromSerial(row[i] ?? null));

/** Transforme la 2D array Google Sheets en tableau typé robuste à l’ordre des colonnes */
export function mapDepenses(values: any[][]): DepenseRow[] {
  if (!values || values.length === 0) return [];

  const header = values[0] ?? [];
  const body   = values.slice(1);
  const I = buildIndex(header);

  return body.map((r): DepenseRow => ({
    libelle:          S(r, I.libelle),
    montantTTC:       N(r, I.montantTTC),
    datePaiement:     Dt(r, I.datePaiement),
    facture:          S(r, I.facture),
    categorie:        S(r, I.categorie),
    type:             S(r, I.type),
    duree:            Nn(r, I.duree),
    echeance:         Dt(r, I.echeance),
    joursRestants:    S(r, I.joursRestants),
    estimationAnnuel: N(r, I.estimationAnnuel),
    url:              S(r, I.url),
    mensualite:       N(r, I.mensualite),
    cumule:           N(r, I.cumule),
    id:               S(r, I.id),
  }));
}