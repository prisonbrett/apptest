// app/finances/depenses/a-classer/index.tsx
import React, { useMemo, useEffect, useState } from 'react';
import TableView, { TableColumn } from '@/components/ui/TableView';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LogoButton from '@/components/ui/LogoButton';
import PageTag from '@/components/ui/PageTag';
import SideMenu from '@/components/ui/SideMenu';
import MenuPill from '@/components/ui/MenuPill';
import BackPill from '@/components/ui/BackPill';
import { readSheetRange } from '@/lib/GoogleSheets';

// --- helpers
function dateFromSerial(n: any): string {
  if (n == null || n === '') return '';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return String(n);
  // 25569 = 1970-01-01 en base Excel/Sheets
  const ms = (num - 25569) * 86400 * 1000;
  try {
    const d = new Date(ms);
    // format court FR
    return d.toISOString().slice(0, 10);
  } catch {
    return String(n);
  }
}

type LocalMenuItem = { label: string; active?: boolean; onPress?: () => void };

type Row = {
  date: string;     // C
  label: string;    // A
  cat: string;      // E
  sousCat?: string; // F (Type)
  montant: number;  // B
};

export default function AClasserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  // ENV (utilise EXPO_PUBLIC_* si dispo)
  const SHEET_ID =
    process.env.EXPO_PUBLIC_GOOGLE_SHEET_ID ??
    process.env.GOOGLE_SHEET_ID ??
    '';
  // <-- on lit l’onglet 💰Dépenses, colonnes A à F (ça suffit pour notre tableau)
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
  let fontSize = Math.max(
    22,
    Math.min(isPhone ? basePhone : baseDesktop, screenW * (isPhone ? 0.08 : 0.045))
  );
  if (!isPhone && screenW >= 600 && screenW <= 1024) fontSize = Math.max(fontSize, 44);
  const lineHeight = Math.round(fontSize + 6);

  // Offset vertical pour positionner le menu sous le header
  const headerOffset = insets.top + 10 + Math.max(LOGO_H, lineHeight) + 8;

  // État menu
  const [menuOpen, setMenuOpen] = useState<boolean>(isDesktop);

  // Nav helper
  const go = (path: string) => {
    router.replace(path as any);
    setMenuOpen(false);
  };

  const items: LocalMenuItem[] = [
    { label: '📥 À CLASSER', active: true, onPress: () => go('/finances/depenses/a-classer') },
    { label: '📅 MOIS', onPress: () => go('/finances/depenses/mois') },
    { label: '📊 TRIMESTRE', onPress: () => go('/finances/depenses/trimestre') },
    { label: '🗓️ ANNÉE', onPress: () => go('/finances/depenses/annee') },
    { label: '🏷️ CATÉGORIE', onPress: () => go('/finances/depenses/categorie') },
    { label: '🔄 ABONNEMENTS', onPress: () => go('/finances/depenses/abonnements') },
    { label: '⏳ AMORTISSEMENTS', onPress: () => go('/finances/depenses/amortissements') },
  ];

  // Colonnes du tableau
  const columns: TableColumn<Row>[] = useMemo(
    () => [
      { key: 'date',   label: 'DATE',    width: 140 },
      { key: 'label',  label: 'LIBELLÉ', flex: 1 },
      { key: 'cat',    label: 'CAT.',    width: 120 },
      // si tu veux voir le Type (colonne F), dé-commente la ligne suivante :
      // { key: 'sousCat', label: 'TYPE', width: 140 },
      {
        key: 'montant',
        label: 'MONTANT',
        width: 120,
        align: 'right',
        render: (row) =>
          `${(row.montant ?? 0).toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} €`,
      },
    ],
    []
  );

  // Fetch Google Sheets (💰Dépenses)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!SHEET_ID) {
          console.warn('SHEET_ID manquant');
          setRows([]);
          return;
        }
        setLoading(true);

        const data = await readSheetRange(SHEET_ID, RANGE);
        const values: any[][] = data?.values ?? [];
        if (values.length <= 1) {
          if (mounted) setRows([]);
          return;
        }

        const body = values.slice(1); // skip header
        const mapped: Row[] = body.map((r) => ({
          label:   r[0] ?? '',                 // A: 🧾 Libellé
          montant: Number(String(r[1] ?? 0).toString().replace(/\s/g, '').replace(',', '.')) || 0, // B
          date:    dateFromSerial(r[2]),       // C: peut être un sérial => formatte
          // r[3] = D (facture) ignoré ici
          cat:     r[4] ?? '',                 // E: 🏷️ Catégorie
          sousCat: r[5] ?? '',                 // F: 📌 Type
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

  // Largeur/position de la table selon l’état menu
  const MENU_W = 300;
  const MENU_PAD = 20; // left padding visuel du menu
  const GUTTER = 24;   // marge de confort

  let tableWidth = Math.min(1400, screenW - 2 * GUTTER);
  let tableOffsetLeft = 0;
  let alignSelf: 'center' | 'flex-start' = 'center';

  if (isDesktop && menuOpen) {
    tableOffsetLeft = MENU_W + MENU_PAD + GUTTER;
    tableWidth = Math.max(680, Math.min(1200, screenW - tableOffsetLeft - GUTTER));
    alignSelf = 'flex-start';
  } else if (isDesktop && !menuOpen) {
    tableWidth = Math.min(1400, screenW - 2 * GUTTER);
    alignSelf = 'center';
  } else {
    tableWidth = Math.min(1000, screenW - 2 * GUTTER);
    alignSelf = 'center';
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      {/* HEADER */}
      <View style={[styles.headerRow, { paddingHorizontal: H_MARGIN }]}>
        <LogoButton width={LOGO_W} height={LOGO_H} onPress={() => router.replace('/' as any)} />
        <PageTag text="📥 À CLASSER" fontSize={fontSize} lineHeight={lineHeight} />
      </View>

      {/* CONTENT (Table) */}
      <View style={styles.contentCol}>
        <View
          style={[
            styles.tableWrap,
            {
              width: tableWidth,
              alignSelf,
              marginLeft: alignSelf === 'flex-start' ? tableOffsetLeft : 0,
            },
          ]}
        >
          <TableView<Row>
            columns={columns}
            data={rows}
            loading={loading}
            dense={false}
            maxHeight={520}
            onRowPress={() => {}}
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
            <MenuPill
              onPress={() => setMenuOpen(true)}
              left={H_MARGIN}
              bottom={insets.bottom + 20}
            />
          )}
        </>
      )}

      {/* BACK (mobile) */}
      {!isDesktop && (
        <BackPill
          onPress={() => router.back()}
          left={H_MARGIN}
          bottom={insets.bottom + 20}
        />
      )}
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
    justifyContent: 'center',
    // @ts-ignore web-only
    userSelect: 'none',
  },
  tableWrap: {},
});