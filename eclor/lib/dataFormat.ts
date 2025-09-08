// lib/dataFormat.ts
export function norm(s: unknown) {
  return String(s ?? '')
    .replace(/\uFE0F/g, '')      // variation selector (emoji)
    .replace(/\u00A0/g, ' ')     // NBSP -> espace normal
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseNum(v: any): number {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v).replace(/\s/g, '').replace(/\u00A0/g, '').replace(',', '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

export function ddmmyyyyToISO(s: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (!m) return '';
  const [, d, mo, y] = m;
  return `${y}-${mo}-${d}`;
}

export function dateFromSerialOrText(v: any): string {
  if (v == null || v === '') return '';
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return ddmmyyyyToISO(v);
    return '';
  }
  const n = Number(v);
  if (!Number.isFinite(n) || n < 30000) return '';
  const ms = (n - 25569) * 86400 * 1000;
  try { return new Date(ms).toISOString().slice(0, 10); } catch { return ''; }
}

export function strongMatchOption<T extends { value: string; label: string; emoji?: string }>(
  raw: unknown, options: readonly T[]
) {
  const n = norm(raw);
  if (!n) return null;
  let f = options.find(o => norm(o.value) === n);
  if (f) return f;
  f = options.find(o => norm(`${o.emoji ?? ''} ${o.label}`) === n);
  if (f) return f;
  f = options.find(o => norm(o.label).toLowerCase() === n.toLowerCase());
  return f ?? null;
}