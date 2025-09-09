// lib/dateSerial.ts

/** Excel/Sheets serial -> Date | null */
export function dateFromSerial(n?: number | string | null) {
  if (n == null || n === '') return null;
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num as number)) return null;
  const ms = ((num as number) - 25569) * 86400 * 1000; // 25569 = 1970-01-01
  const d = new Date(ms);
  return Number.isFinite(d.getTime()) ? d : null;
}

/** Tolérant: accepte sérial, "JJ/MM/AAAA", "JJ-MM-AAAA", ISO, etc. -> Date|null */
export function parseSheetDateLoose(v: any): Date | null {
  if (v == null || v === '') return null;

  // sérial ?
  const n = Number(v);
  if (Number.isFinite(n)) return dateFromSerial(n);

  const s = String(v).trim();
  // "JJ/MM/AAAA" ou "JJ-MM-AAAA"
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const dd = Number(m[1]);
    const mm = Number(m[2]) - 1;
    const yyyy = Number(m[3].padStart(4, '20'));
    const d = new Date(yyyy, mm, dd);
    return Number.isFinite(d.getTime()) ? d : null;
  }

  const d2 = new Date(s);
  return Number.isFinite(d2.getTime()) ? d2 : null;
}

/** YYYY-MM-DD pour l’affichage ('' si null/invalid) */
export function fmtISO(d: Date | null) {
  if (!d || !Number.isFinite(d.getTime())) return '';
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return t.toISOString().slice(0, 10);
}

/** DD/MM/YYYY pour l’affichage ('' si null/invalid) */
export function fmtDDMMYYYY(d: Date | null) {
  if (!d || !Number.isFinite(d.getTime())) return '';
  const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  const day = t.getUTCDate().toString().padStart(2, '0');
  const month = (t.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = t.getUTCFullYear();
  return `${day}/${month}/${year}`;
}