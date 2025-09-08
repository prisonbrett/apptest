// app/finances/index.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LogoButton from '@/components/ui/LogoButton';
import PageTag from '@/components/ui/PageTag';

type FinancePath = '/finances/factures' | '/finances/depenses';

export default function FinancesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const isPhone = screenW < 768;

  const H_MARGIN = 20;
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  // même logique que HomeScreen
  let fontSize: number;
  if (isPhone) {
    fontSize = Math.max(22, Math.min(screenW * 0.08, 32)); // 22 → 32
  } else {
    fontSize = Math.max(32, Math.min(screenW * 0.04, 50)); // 32 → 50
  }
  const lineHeight = Math.round(fontSize + 6);

  const links: { label: string; path: FinancePath }[] = [
    { label: '🧾 FACTURES', path: '/finances/factures' },
    { label: '💰 DÉPENSES', path: '/finances/depenses' },
  ];

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      {/* HEADER : logo gauche / titre droite */}
      <View style={[styles.headerRow, { paddingHorizontal: H_MARGIN }]}>
        <LogoButton width={LOGO_W} height={LOGO_H} onPress={() => router.replace('/')} />
        <PageTag text="💶 FINANCES" fontSize={fontSize} lineHeight={lineHeight} />
      </View>

      {/* MENU centré */}
      <View style={styles.menuContainer}>
        {links.map((item) => (
          <Pressable
            key={item.path}
            onPress={() => router.push(item.path)}
            style={({ hovered, pressed }) => [
              styles.linkHitbox,
              (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
            ]}
          >
            <Text style={[styles.linkText, { fontSize, lineHeight }]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#55A77C', // vert finances
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 40,
    paddingHorizontal: 16,
    // @ts-ignore web-only
    userSelect: 'none',
  },
  linkHitbox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
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