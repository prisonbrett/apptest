// lib/mapDepenses.ts
import { parseSheetDateLoose } from '@/lib/dateSerial';
import {
  DEPENSES_HEADERS,
  type DepensesHeaderKey,
  type DepenseRow,
} from '@/constants/DepensesSchema';

/** Retire emojis, accents, ponctuation, espaces et met en minuscule */
function normLoose(s: unknown): string {
  const raw = String(s ?? '')
    // supprime la plupart des emojis / pictos
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE0F}]/gu,
      ''
    )
    // normalise accents
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    // supprime ponctuation/espaces (NBSP inclus)
    .replace(/[\s\u00A0\.\,\;\:\-\_\/\|\(\)\[\]\{\}]+/g, '')
    .toLowerCase()
    .trim();
  return raw;
}

/** Construit l’index: clé interne -> index de colonne (tolérant aux écarts) */
function buildIndex(headerRow: any[]): Partial<Record<DepensesHeaderKey, number>> {
  const idx: Partial<Record<DepensesHeaderKey, number>> = {};

  // dictionnaire normalisé -> clé interne
  const wanted = Object.fromEntries(
    (Object.entries(DEPENSES_HEADERS) as [DepensesHeaderKey, string][])
      .map(([k, label]) => [normLoose(label), k])
  ) as Record<string, DepensesHeaderKey>;

  headerRow.forEach((cell, i) => {
    const keyLoose = normLoose(cell);
    const k = wanted[keyLoose];
    if (k) idx[k] = i;
  });

  // 🔎 debug doux : une seule ligne dans la console pour vérifier les colonnes mappées
  if (typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production') {
    const seen = Object.fromEntries(
      Object.entries(idx).map(([k, v]) => [k, v ?? -1])
    );
    // eslint-disable-next-line no-console
    console.log('[mapDepenses] index mapping ->', seen);
  }

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
const DtLoose = (row: any[], i?: number) =>
  (i == null ? null : parseSheetDateLoose(row[i] ?? null));

/** Transforme la 2D array Google Sheets en tableau typé robuste */
export function mapDepenses(values: any[][]): DepenseRow[] {
  if (!values || values.length === 0) return [];

  const header = values[0] ?? [];
  const body   = values.slice(1);
  const I = buildIndex(header);

  return body.map((r): DepenseRow => ({
    libelle:          S(r, I.libelle),
    montantTTC:       N(r, I.montantTTC),
    datePaiement:     DtLoose(r, I.datePaiement),
    facture:          S(r, I.facture),
    categorie:        S(r, I.categorie),
    type:             S(r, I.type),
    duree:            Nn(r, I.duree),
    echeance:         DtLoose(r, I.echeance),     // ← devrait maintenant matcher même avec variations
    joursRestants:    S(r, I.joursRestants),
    estimationAnnuel: N(r, I.estimationAnnuel),
    url:              S(r, I.url),
    mensualite:       N(r, I.mensualite),
    cumule:           N(r, I.cumule),
    id:               S(r, I.id),
  }));
}