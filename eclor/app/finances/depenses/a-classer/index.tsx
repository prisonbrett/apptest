import React, { useMemo, useEffect, useState } from 'react';
import TableView, { TableColumn } from '@/components/ui/TableView';
import { View, StyleSheet, useWindowDimensions, Text, Linking } from 'react-native';
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
  DEPENSES_TYPES,
  matchOption,
} from '@/constants/DepensesSchema';

// --- date serial -> YYYY-MM-DD
function dateFromSerial(n: any): string {
  if (n == null || n === '') return '';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return String(n);
  const ms = (num - 25569) * 86400 * 1000;
  try { return new Date(ms).toISOString().slice(0, 10); } catch { return String(n); }
}

type LocalMenuItem = { label: string; active?: boolean; onPress?: () => void };

// lignes lues A:Q (une partie seulement affichée)
type Row = {
  label: string;       // A
  montant: number;     // B
  date: string;        // C
  facture: string;     // D
  cat: string;         // E
  type?: string;       // F
  duree?: number | null;  // I
  echeance?: string;      // J
  jours?: string;         // K
  estAnnuel?: number;     // L
  url?: string;           // M
  mensualite?: number;    // O
  cumule?: number;        // P
  id?: string;            // Q
};

export default function AClasserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW, height: screenH } = useWindowDimensions();

  // ENV
  const SHEET_ID =
    process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID ??
    process.env.GOOGLE_SHEET_ID ??
    '';
  const TAB = '💰Dépenses';
  const RANGE = `'${TAB}'!A:Q`; // lit tout

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const isDesktop = screenW >= 1024;
  const isPhone = !isDesktop;

  // Marges / logo
  const H_MARGIN = 20;
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  // Titres
  const basePhone = 38;
  const baseDesktop = 38;
  let fontSize = Math.max(22, Math.min(isPhone ? basePhone : baseDesktop, screenW * (isPhone ? 0.08 : 0.045)));
  if (!isPhone && screenW >= 600 && screenW <= 1024) fontSize = Math.max(fontSize, 44);
  const lineHeight = Math.round(fontSize + 6);

  const headerOffset = insets.top + 10 + Math.max(LOGO_H, lineHeight) + 8;
  const TABLE_MAX_H = Math.max(240, screenH - headerOffset - (insets.bottom + 24));

  // Menu
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

  // Colonnes (tu peux en retirer si tu veux plus compact)
  const columns: TableColumn<Row>[] = useMemo(
    () => [
      { key: 'date',  label: DEPENSES_HEADERS.datePaiement, width: 200,
        render: (row) => row.date || '' },

      { key: 'label', label: DEPENSES_HEADERS.libelle, width: 420,
        render: (row) => (
          <Text numberOfLines={1} style={{ color: '#fff', fontFamily: 'Delight-Medium' }}>
            {row.label || ''}
          </Text>
        ),
      },

      { key: 'cat',   label: DEPENSES_HEADERS.categorie, width: 230,
        render: (row, i) => {
          const current = matchOption(row.cat, DEPENSES_CATEGORIES);
          return (
            <SingleSelect
              options={DEPENSES_CATEGORIES.map(o => ({ value: o.value, label: o.label, emoji: o.emoji, color: o.color }))}
              value={current?.value ?? null}
              onChange={(v) => {
                setRows(prev => { const next=[...prev]; next[i]={...next[i], cat: v?String(v):''}; return next; });
              }}
              placeholder=""
            />
          );
        },
      },

      { key: 'type',  label: DEPENSES_HEADERS.type, width: 200,
        render: (row, i) => {
          const current = matchOption(row.type, DEPENSES_TYPES);
          return (
            <SingleSelect
              options={DEPENSES_TYPES.map(o => ({ value: o.value, label: o.label, emoji: o.emoji, color: o.color }))}
              value={current?.value ?? null}
              onChange={(v) => {
                setRows(prev => { const next=[...prev]; next[i]={...next[i], type: v?String(v):''}; return next; });
              }}
              placeholder=""
            />
          );
        },
      },

      { key: 'echeance', label: DEPENSES_HEADERS.echeance, width: 180,
        render: (row) => row.echeance || '' },

      { key: 'jours', label: DEPENSES_HEADERS.joursRestants, width: 160,
        render: (row) => row.jours ?? '' },

      { key: 'estAnnuel', label: DEPENSES_HEADERS.estimationAnnuel, width: 160, align: 'right',
        render: (row) => (!row.estAnnuel ? '' :
          `${Number(row.estAnnuel).toLocaleString('fr-FR',{ minimumFractionDigits:2, maximumFractionDigits:2 })} €`) },

      { key: 'mensualite', label: DEPENSES_HEADERS.mensualite, width: 160, align: 'right',
        render: (row) => (!row.mensualite ? '' :
          `${Number(row.mensualite).toLocaleString('fr-FR',{ minimumFractionDigits:2, maximumFractionDigits:2 })} €`) },

      { key: 'cumule', label: DEPENSES_HEADERS.cumule, width: 160, align: 'right',
        render: (row) => (!row.cumule ? '' :
          `${Number(row.cumule).toLocaleString('fr-FR',{ minimumFractionDigits:2, maximumFractionDigits:2 })} €`) },
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

        const body = values.slice(1); // skip header
        const mapped: Row[] = body.map((r) => ({
          label:   r[0] ?? '',
          montant: Number(String(r[1] ?? 0).toString().replace(/\s/g, '').replace(',', '.')) || 0,
          date:    dateFromSerial(r[2]),
          facture: r[3] ?? '',
          cat:     r[4] ?? '',
          type:    r[5] ?? '',
          // G/H ignorés ici
          duree:   r[8] == null || r[8] === '' ? null : Number(r[8]),
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
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [SHEET_ID, RANGE]);

  // Layout (largeur alignée sur le menu)
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

      {/* CONTENT */}
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
            inferColumns={false}
            maxHeight={TABLE_MAX_H}   // ← scroll vertical interne (web & natif)
            resizable
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