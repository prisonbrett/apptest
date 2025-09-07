// app/finances/depenses/a-classer/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LogoButton from '@/components/ui/LogoButton';
import PageTag from '@/components/ui/PageTag';
import SideMenu from '@/components/ui/SideMenu';
import MenuPill from '@/components/ui/MenuPill';
import BackPill from '@/components/ui/BackPill';

type LocalMenuItem = { label: string; active?: boolean; onPress?: () => void };

export default function AClasserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const isDesktop = screenW >= 1024;
  const isPhone = !isDesktop;

  // Marges / logo (réf)
  const H_MARGIN = 20;
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  // Titrage (réf)
  const basePhone = 38;
  const baseDesktop = 38;
  let fontSize = Math.max(
    22,
    Math.min(isPhone ? basePhone : baseDesktop, screenW * (isPhone ? 0.08 : 0.045))
  );
  if (!isPhone && screenW >= 600 && screenW <= 1024) fontSize = Math.max(fontSize, 44);
  const lineHeight = Math.round(fontSize + 6);

  // Offset vertical pour démarrer le SideMenu sous le header
  const headerOffset = insets.top + 10 + Math.max(LOGO_H, lineHeight) + 8;

  // État menu (ouvert par défaut sur desktop)
  const [menuOpen, setMenuOpen] = useState<boolean>(isDesktop);

  // Helper nav (+ fermeture menu)
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

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      {/* HEADER */}
      <View style={[styles.headerRow, { paddingHorizontal: H_MARGIN }]}>
        <LogoButton width={LOGO_W} height={LOGO_H} onPress={() => router.replace('/' as any)} />
        <PageTag text="📥 À CLASSER" fontSize={fontSize} lineHeight={lineHeight} />
      </View>

      {/* CONTENT */}
      <View style={styles.contentCol}>
        <Text style={styles.placeholderTitle}>ICI : efvfbfbTES ÉLÉMENTS “À CLASSER”</Text>
        <Text style={styles.placeholderSub}>(on branchera la vraie liste ensuite)</Text>
      </View>

      {/* DESKTOP MENU */}
      {isDesktop && (
        <>
          <SideMenu
            items={items}
            open={menuOpen}
            onRequestClose={() => setMenuOpen(false)}
            width={300}
            leftPadding={20}
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

      {/* MOBILE BACK */}
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
  safe: {
    flex: 1,
    backgroundColor: '#C14E4E',
    position: 'relative',
  },
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
    alignItems: 'center',
    justifyContent: 'center',
    // @ts-ignore web-only
    userSelect: 'none',
  },
  placeholderTitle: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    textTransform: 'uppercase',
    fontSize: 24,
    letterSpacing: 1,
    textAlign: 'center',
  },
  placeholderSub: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Delight-Medium',
    fontSize: 12,
    textAlign: 'center',
  },
});