// hooks/useSheetTable.ts
import { useEffect, useState } from 'react';
import { readSheetRange, writeCell, colLetter } from '@/lib/GoogleSheets';

type UseSheetTableOpts<T> = {
  sheetId: string;
  tab: string;           // ex: '💰Dépenses'
  rangeA1: string;       // ex: `'💰Dépenses'!A:N`
  mapRow: (raw: any[]) => T;       // mapping 2D -> T
  rowIsEmpty?: (r: T) => boolean;  // pour filtrer
};

export function useSheetTable<T>({
  sheetId, tab, rangeA1, mapRow, rowIsEmpty,
}: UseSheetTableOpts<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await readSheetRange(sheetId, rangeA1);
        const values = data?.values ?? [];
        const body = values.slice(1);
        const mapped = body.map(mapRow);
        const cleaned = rowIsEmpty ? mapped.filter(r => !rowIsEmpty(r)) : mapped;
        if (mounted) setRows(cleaned);
      } catch (e) {
        if (mounted) setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [sheetId, tab, rangeA1, mapRow, rowIsEmpty]);

  // util pour écrire une cellule (rowIndex 0-based, colIndex 0-based)
  async function saveCell(rowIndex0: number, colIdx0: number, value: string | number) {
    const a1 = `${colLetter(colIdx0)}${rowIndex0 + 2}`;
    await writeCell(sheetId, tab, a1, value);
  }

  return { rows, setRows, loading, error, saveCell };
}