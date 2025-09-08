// app/finances/depenses/a-classer/index.tsx
import React, { useMemo, useEffect, useState } from 'react';
import TableView, { TableColumn } from '@/components/ui/TableView';
import { View, StyleSheet, useWindowDimensions, TextInput, Text, Platform } from 'react-native';
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
  DEPENSES_SHEET_NAME,
  DEPENSES_HEADERS,
  DEPENSES_CATEGORIES,
  DEPENSES_TYPES,
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
const euro = (n?: number | null) =>
  !n || !Number.isFinite(n) || n === 0 ? '' :
  `${Number(n).toLocaleString('fr-FR',{ minimumFractionDigits:2, maximumFractionDigits:2 })} €`;

type Row = {
  label: string;       // A  (edit)
  montant: number;     // B  (edit)
  date: string;        // C  (edit)
  facture: string;     // D
  cat: string;         // E  (edit)
  type: string;        // F  (edit)
  echeance?: string;   // J
  jours?: string;      // K
  estAnnuel?: number;  // L
  url?: string;        // M  (edit)
  mensualite?: number; // O
  cumule?: number;     // P
  id?: string;         // Q
};

export default function AClasserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const SHEET_ID =
    process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID ??
    process.env.GOOGLE_SHEET_ID ??
    '';
  const RANGE = `'${DEPENSES_SHEET_NAME}'!A:Q`;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // persistance des largeurs colonnes
  const LS_KEY_W = 'a-classer:colW';
  const [colWidths, setColWidths] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem(LS_KEY_W) || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(LS_KEY_W, JSON.stringify(colWidths));
  }, [colWidths]);

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
  const TABLE_MAX_H = Math.max(240, screenH - headerOffset - (insets.bottom + 28));

  // menu
  const [menuOpen, setMenuOpen] = useState<boolean>(isDesktop);
  const go = (path: string) => { router.replace(path as any); setMenuOpen(false); };

  // fetch
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!SHEET_ID) { setRows([]); return; }
        setLoading(true);
        const data = await readSheetRange(SHEET_ID, RANGE);
        const values: any[][] = data?.values ?? [];
        if (values.length <= 1) { if (mounted) setRows([]); return; }

        const body = values.slice(1);
        const mapped: Row[] = body.map((r) => ({
          label:   r[0] ?? '',
          montant: Number(String(r[1] ?? 0).toString().replace(/\s/g, '').replace(',', '.')) || 0,
          date:    dateFromSerial(r[2]),
          facture: r[3] ?? '',
          cat:     r[4] ?? '',
          type:    r[5] ?? '',
          echeance: dateFromSerial(r[9]),
          jours:   r[10] ?? '',
          estAnnuel: Number(r[11] ?? 0) || 0,
          url:     r[12] ?? '',
          mensualite: Number(r[14] ?? 0) || 0,
          cumule: Number(r[15] ?? 0) || 0,
          id:      r[16] ?? '',
        }));

        if (mounted) setRows(mapped);
      } catch (e) {
        console.error('readSheetRange error:', e);
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [SHEET_ID, RANGE]);

  // édition locale
  const setField = <K extends keyof Row>(i: number, key: K, value: Row[K]) => {
    setRows(prev => { const next=[...prev]; next[i]={...next[i], [key]: value}; return next; });
  };

  // inputs
  const TextField = ({ value, onChange, width }: { value: string; onChange: (v: string) => void; width?: number }) => (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder=""
      style={{
        color: '#fff',
        fontFamily: 'Delight-Medium',
        fontSize: 14,
        paddingVertical: 6,
        paddingHorizontal: 8,
        minHeight: 30,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.08)',
        outlineStyle: 'none' as any,
        width,
      }}
    />
  );

  // ✅ FIX keyboardType
  const MoneyField = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => {
    const kb =
      Platform.OS === 'ios' ? 'decimal-pad'
      : Platform.OS === 'android' ? 'numeric'
      : undefined; // web: on n’envoie rien

    return (
      <TextInput
        value={String(value ?? 0)}
        onChangeText={(t) => {
          const n = Number(String(t).replace(/\s/g, '').replace(',', '.'));
          onChange(Number.isFinite(n) ? n : 0);
        }}
        {...(kb ? { keyboardType: kb as any } : {})}
        style={{
          color: '#fff',
          fontFamily: 'Delight-Medium',
          fontSize: 14,
          paddingVertical: 6,
          paddingHorizontal: 8,
          minHeight: 30,
          borderRadius: 8,
          backgroundColor: 'rgba(255,255,255,0.08)',
          textAlign: 'right',
          outlineStyle: 'none' as any,
        }}
      />
    );
  };

  // colonnes
  const columns: TableColumn<Row>[] = useMemo(() => [
    {
      key: 'date',
      label: DEPENSES_HEADERS.datePaiement,
      width: 180,
      render: (row, i) => <TextField value={row.date || ''} onChange={(v) => setField(i, 'date', v)} />,
    },
    {
      key: 'label',
      label: DEPENSES_HEADERS.libelle,
      width: 420,
      render: (row, i) => <TextField value={row.label} onChange={(v) => setField(i, 'label', v)} />,
    },
    {
      key: 'cat',
      label: DEPENSES_HEADERS.categorie,
      width: 230,
      render: (row, i) => {
        const current = matchOption(row.cat, DEPENSES_CATEGORIES);
        return (
          <SingleSelect
            options={DEPENSES_CATEGORIES as any}
            value={current?.value ?? null}
            onChange={(v) => setField(i, 'cat', v ? String(v) : '')}
            placeholder=""
          />
        );
      },
    },
    {
      key: 'type',
      label: DEPENSES_HEADERS.type,
      width: 200,
      render: (row, i) => {
        const current = matchOption(row.type, DEPENSES_TYPES);
        return (
          <SingleSelect
            options={DEPENSES_TYPES as any}
            value={current?.value ?? null}
            onChange={(v) => setField(i, 'type', v ? String(v) : '')}
            placeholder=""
          />
        );
      },
    },
    { key: 'echeance', label: DEPENSES_HEADERS.echeance, width: 160,
      render: (row) => <Text style={{ color:'#fff', fontFamily:'Delight-Medium' }}>{row.echeance || ''}</Text> },
    { key: 'jours', label: DEPENSES_HEADERS.joursRestants, width: 120,
      render: (row) => <Text style={{ color:'#fff', fontFamily:'Delight-Medium' }}>{row.jours || ''}</Text> },
    {
      key: 'montant',
      label: DEPENSES_HEADERS.montantTTC,
      width: 140,
      align: 'right',
      render: (row, i) => <MoneyField value={row.montant ?? 0} onChange={(n) => setField(i, 'montant', n)} />,
    },
    {
      key: 'estAnnuel',
      label: DEPENSES_HEADERS.estimationAnnuel,
      width: 150,
      align: 'right',
      render: (row) => <Text style={{ color:'#fff', fontFamily:'Delight-Medium', textAlign:'right' as const }}>{euro(row.estAnnuel)}</Text>,
    },
    {
      key: 'mensualite',
      label: DEPENSES_HEADERS.mensualite,
      width: 150,
      align: 'right',
      render: (row) => <Text style={{ color:'#fff', fontFamily:'Delight-Medium', textAlign:'right' as const }}>{euro(row.mensualite)}</Text>,
    },
    {
      key: 'cumule',
      label: DEPENSES_HEADERS.cumule,
      width: 150,
      align: 'right',
      render: (row) => <Text style={{ color:'#fff', fontFamily:'Delight-Medium', textAlign:'right' as const }}>{euro(row.cumule)}</Text>,
    },
    {
      key: 'url',
      label: DEPENSES_HEADERS.url,
      width: 240,
      render: (row, i) => <TextField value={row.url || ''} onChange={(v) => setField(i, 'url', v)} />,
    },
  ], [rows]);

  // totaux footer
  const sum = (k: keyof Row) => rows.reduce((acc, r) => acc + (Number((r as any)[k]) || 0), 0);
  const footerRow = useMemo(() => {
    const node = (n: number) => (
      <Text style={{ color:'#fff', fontFamily:'Delight-ExtraBold', textAlign:'right' as const }}>
        {euro(n)}
      </Text>
    );
    return {
      date: <Text style={{ color:'#fff', fontFamily:'Delight-ExtraBold' }}>TOTAL</Text>,
      montant: node(sum('montant')),
      estAnnuel: node(sum('estAnnuel')),
      mensualite: node(sum('mensualite')),
      cumule: node(sum('cumule')),
    } as Partial<Record<string, React.ReactNode>>;
  }, [rows]);

  // Layout (aligné au menu)
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

      {/* TABLE */}
      <View style={[styles.contentCol, { paddingBottom: insets.bottom + 12 }]}>
        <View style={[
          styles.tableWrap,
          { width: tableWidth, alignSelf, marginLeft: alignSelf === 'flex-start' ? tableOffsetLeft : 0 },
        ]}>
          <TableView<Row>
            columns={columns}
            data={rows}
            loading={loading}
            dense={false}
            maxHeight={TABLE_MAX_H}
            resizable
            columnWidths={colWidths}
            onColumnResize={(k,w) => setColWidths(prev => ({ ...prev, [k]: w }))}
            footerRow={footerRow}
            footerHeight={44}
          />
        </View>
      </View>

      {/* MENU (desktop) */}
      {isDesktop && (
        <>
          <SideMenu
            items={[
              { label: '📥 À CLASSER', active: true, onPress: () => go('/finances/depenses/a-classer') },
              { label: '📅 MOIS', onPress: () => go('/finances/depenses/mois') },
              { label: '📊 TRIMESTRE', onPress: () => go('/finances/depenses/trimestre') },
              { label: '🗓️ ANNÉE', onPress: () => go('/finances/depenses/annee') },
              { label: '🏷️ CATÉGORIE', onPress: () => go('/finances/depenses/categorie') },
              { label: '🔄 ABONNEMENTS', onPress: () => go('/finances/depenses/abonnements') },
              { label: '⏳ AMORTISSEMENTS', onPress: () => go('/finances/depenses/amortissements') },
            ]}
            open={menuOpen}
            onRequestClose={() => setMenuOpen(false)}
            width={MENU_W}
            leftPadding={MENU_PAD}
            topOffset={insets.top + 10 + Math.max(LOGO_H, lineHeight) + 8}
          />
          {!menuOpen && <MenuPill onPress={() => setMenuOpen(true)} left={H_MARGIN} bottom={insets.bottom + 20} />}
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