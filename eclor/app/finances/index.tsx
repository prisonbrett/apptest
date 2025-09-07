import React, { useMemo, useEffect, useState } from 'react';
import TableView, { TableColumn } from '@/components/ui/TableView';
import { View, StyleSheet, useWindowDimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LogoButton from '@/components/ui/LogoButton';
import PageTag from '@/components/ui/PageTag';
import SideMenu from '@/components/ui/SideMenu';
import MenuPill from '@/components/ui/MenuPill';
import BackPill from '@/components/ui/BackPill';
import { readSheetRange } from '@/lib/GoogleSheets';

import SingleSelect from '@/components/ui/SingleSelect';
import {
  DEPENSES_HEADERS,
  DEPENSES_CATEGORIES,
  matchOption,
} from '@/constants/DepensesSchema';

// --- helpers
function dateFromSerial(n: any): string {
  if (n == null || n === '') return '';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return String(n);
  const ms = (num - 25569) * 86400 * 1000;
  try { return new Date(ms).toISOString().slice(0, 10); } catch { return String(n); }
}

type LocalMenuItem = { label: string; active?: boolean; onPress?: () => void };

type Row = {
  date: string;     // C
  label: string;    // A
  cat: string;      // E (peut être "Parking" ou "🅿️ Parking")
  sousCat?: string; // F
  montant: number;  // B
};

export default function AClasserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const SHEET_ID =
    process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID ??
    process.env.GOOGLE_SHEET_ID ??
    '';
  const TAB = '💰Dépenses';
  const RANGE = `'${TAB}'!A:F`;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isDesktop = screenW >= 1024;
  const isPhone = !isDesktop;

  // Marges / logo
  const H_MARGIN = 20;
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  // Titrage
  const basePhone = 38;
  const baseDesktop = 38;
  let fontSize = Math.max(22, Math.min(isPhone ? basePhone : baseDesktop, screenW * (isPhone ? 0.08 : 0.045)));
  if (!isPhone && screenW >= 600 && screenW <= 1024) fontSize = Math.max(fontSize, 44);
  const lineHeight = Math.round(fontSize + 6);

  const headerOffset = insets.top + 10 + Math.max(LOGO_H, lineHeight) + 8;

  const [menuOpen, setMenuOpen] = useState<boolean>(isDesktop);
  const go = (path: string) => { router.replace(path as any); setMenuOpen(false); };

  const items: LocalMenuItem[] = [
    { label: '📥 À CLASSER', active: true, onPress: () => go('/finances/depenses/a-classer') },
    { label: '📅 MOIS', onPress: () => go('/finances/depenses/mois') },
    { label: '📊 TRIMESTRE', onPress: () => go('/finances/depenses/trimestre') },
    { label: '🗓️ ANNÉE', onPress: () => go('/finances/depenses/annee') },
    { label: '🏷️ CATÉGORIE', onPress: () => go('/finances/depenses/categorie') },
    { label: '🔄 ABONNEMENTS', onPress: () => go('/finances/depenses/abonnements') },
    { label: '⏳ AMORTISSEMENTS', onPress: () => go('/finances/depenses/amortissements') },
  ];

  // Colonnes (avec emojis et rendu éditable pour Catégorie)
  const columns: TableColumn<Row>[] = useMemo(
    () => [
      { key: 'date',  label: DEPENSES_HEADERS.datePaiement, width: 140 },
      { key: 'label', label: DEPENSES_HEADERS.libelle,       flex: 1,
        render: (row) => <Text numberOfLines={1} style={{ color: '#fff' }}>{row.label || ''}</Text>,
      },
      { key: 'cat',   label: DEPENSES_HEADERS.categorie,     width: 200,
        render: (row, i) => {
          const current = matchOption(row.cat, DEPENSES_CATEGORIES);
          return (
            <SingleSelect
              options={DEPENSES_CATEGORIES.map(o => ({ value: o.value, label: o.label, emoji: o.emoji, color: o.color }))}
              value={current?.value ?? null}
              onChange={(v) => {
                setRows(prev => {
                  const next = [...prev];
                  next[i] = { ...next[i], cat: v ? String(v) : '' };
                  return next;
                });
              }}
              placeholder=""
            />
          );
        },
      },
      { key: 'montant', label: DEPENSES_HEADERS.montantTTC, width: 140, align: 'right',
        render: (row) => {
          const n = Number(row.montant || 0);
          if (!Number.isFinite(n) || n === 0) return '';
          return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
        },
      },
    ],
    [rows]
  );

  // Fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!SHEET_ID) { console.warn('SHEET_ID manquant'); setRows([]); return; }
        setLoading(true);
        const data = await readSheetRange(SHEET_ID, RANGE);
        const values: any[][] = data?.values ?? [];
        if (values.length <= 1) { if (mounted) setRows([]); return; }
        const body = values.slice(1);
        const mapped: Row[] = body.map((r) => ({
          label:   r[0] ?? '',
          montant: Number(String(r[1] ?? 0).toString().replace(/\s/g, '').replace(',', '.')) || 0,
          date:    dateFromSerial(r[2]),
          cat:     r[4] ?? '',
          sousCat: r[5] ?? '',
        }));
        if (mounted) setRows(mapped);
      } catch (e) {
        console.error('readSheetRange error:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [SHEET_ID, RANGE]);

  // Layout
  const MENU_W = 300; const MENU_PAD = 20; const GUTTER = 24;
  let tableWidth = screenW - 2 * GUTTER;
  let tableOffsetLeft = 0;
  let alignSelf: 'center' | 'flex-start' = 'center';
  if (isDesktop && menuOpen) {
    tableOffsetLeft = MENU_W + MENU_PAD + GUTTER;
    tableWidth = Math.max(680, screenW - tableOffsetLeft - GUTTER);
    alignSelf = 'flex-start';
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      {/* HEADER */}
      <View style={[styles.headerRow, { paddingHorizontal: H_MARGIN }]}>
        <LogoButton width={LOGO_W} height={LOGO_H} onPress={() => router.replace('/' as any)} />
        <PageTag text="📥 À CLASSER" fontSize={fontSize} lineHeight={lineHeight} />
      </View>

      {/* CONTENT (Table) */}
      <View style={[styles.contentCol, { paddingBottom: insets.bottom + 12 }]}>
        <View
          style={[
            styles.tableWrap,
            { width: tableWidth, alignSelf, marginLeft: alignSelf === 'flex-start' ? tableOffsetLeft : 0 },
          ]}
        >
          <TableView<Row>
            columns={columns}
            data={rows}
            loading={loading}
            dense={false}
            // IMPORTANT: pas de onRowPress pour laisser les inputs réagir
          />
        </View>
      </View>

      {/* MENU (desktop) */}
      {isDesktop && (
        <>
          <SideMenu
            items={items}
            open={menuOpen}
            onRequestClose={() => setMenuOpen(false)}
            width={MENU_W}
            leftPadding={MENU_PAD}
            topOffset={headerOffset}
          />
          {!menuOpen && (
            <MenuPill onPress={() => setMenuOpen(true)} left={H_MARGIN} bottom={insets.bottom + 20} />
          )}
        </>
      )}

      {/* BACK (mobile) */}
      {!isDesktop && <BackPill onPress={() => router.back()} left={H_MARGIN} bottom={insets.bottom + 20} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#C14E4E', position: 'relative' },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    zIndex: 10,
  },
  contentCol: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    // @ts-ignore web-only
    userSelect: 'none',
  },
  tableWrap: { alignSelf: 'stretch' },
});