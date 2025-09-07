// app/finances/depenses/index.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LogoButton from '@/components/ui/LogoButton';
import PageTag from '@/components/ui/PageTag';
import BackPill from '@/components/ui/BackPill';

export default function DepensesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const isPhone = screenW < 768;

  // marges/tailles communes
  const H_MARGIN = 20;
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  // titres (cohérent Home)
  const basePhone = 38;
  const baseDesktop = 38;
  let fontSize = Math.max(
    22,
    Math.min(isPhone ? basePhone : baseDesktop, screenW * (isPhone ? 0.08 : 0.045))
  );
  if (!isPhone && screenW >= 600 && screenW <= 1024) fontSize = Math.max(fontSize, 44);
  const lineHeight = Math.round(fontSize + 6);

  // réduit légèrement uniquement "AMORTISSEMENTS" sur tel
  const shrinkIfLong = (label: string, size: number) =>
    isPhone && /AMORTISSEMENTS/i.test(label) ? Math.max(18, size - 2) : size;

  const links = [
    { label: '📥 À CLASSER', path: '/finances/depenses/a-classer' },
    { label: '📅 MOIS', path: '/finances/depenses/mois' },
    { label: '📊 TRIMESTRE', path: '/finances/depenses/trimestre' },
    { label: '🗓️ ANNÉE', path: '/finances/depenses/annee' },
    { label: '🏷️ CATÉGORIE', path: '/finances/depenses/categorie' },
    { label: '🔄 ABONNEMENTS', path: '/finances/depenses/abonnements' },
    { label: '⏳ AMORTISSEMENTS', path: '/finances/depenses/amortissements' },
  ];

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      {/* HEADER : logo à gauche, titre à droite */}
      <View style={[styles.headerRow, { paddingHorizontal: H_MARGIN }]}>
        <LogoButton
          width={LOGO_W}
          height={LOGO_H}
          onPress={() => router.replace('/')}
        />
        <PageTag text="💰 DÉPENSES" fontSize={fontSize} lineHeight={lineHeight} />
      </View>

      {/* MENU : centré plein écran */}
      <View style={styles.menuAbs} pointerEvents="box-none">
        {links.map((item) => {
          const size = shrinkIfLong(item.label, fontSize);
          return (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path)}
              style={({ hovered, pressed }) => [
                styles.linkHitbox,
                (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
            >
              <Text
                style={[
                  styles.linkText,
                  { fontSize: size, lineHeight: Math.round(size + 6) },
                  /AMORTISSEMENTS/i.test(item.label) ? { letterSpacing: 0.8 } : null,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.95}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bouton retour (gère web/mobile tout seul) */}
      <BackPill
        onPress={() => router.back()}
        left={H_MARGIN}
        bottom={insets.bottom + 20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#C14E4E',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuAbs: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 16,
    paddingHorizontal: 16,
  },
  linkHitbox: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  linkText: {
    color: '#fff',
    textTransform: 'uppercase',
    fontFamily: 'Delight-ExtraBold',
    letterSpacing: 1,
    textAlign: 'center',
    includeFontPadding: false,
  },
});