// lib/dateSerial.ts
export function dateFromSerial(n?: number | string | null) {
  if (n == null || n === '') return null;
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num as number)) return null;
  const ms = ((num as number) - 25569) * 86400 * 1000; // 25569 = 1970-01-01
  return new Date(ms);
}