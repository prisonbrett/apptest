// app/index.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import LogoButton from '@/components/ui/LogoButton';
import PageTag from '@/components/ui/PageTag';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const isPhone = screenW < 768;

  const H_MARGIN = 20;
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  let fontSize;
  if (isPhone) {
    fontSize = Math.max(22, Math.min(screenW * 0.08, 32)); // Clamped between 22 and 32
  } else {
    fontSize = Math.max(32, Math.min(screenW * 0.04, 50)); // Clamped between 32 and 50
  }
  const lineHeight = Math.round(fontSize + 6);

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      {/* HEADER : logo gauche / titre droite */}
      <View style={[styles.headerRow, { paddingHorizontal: H_MARGIN }]}>
        <LogoButton width={LOGO_W} height={LOGO_H} onPress={() => router.replace('/')} />
        <PageTag text="HOME" fontSize={fontSize} lineHeight={lineHeight} />
      </View>

      {/* MENU centré */}
      <View style={styles.menuContainer}>
        <Pressable
          onPress={() => router.push('/tasks')}
          style={({ hovered, pressed }) => [
            styles.linkHitbox,
            (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
          ]}
        >
          <Text style={[styles.linkText, { fontSize, lineHeight }]}>☑️ TASKS</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/shooting')}
          style={({ hovered, pressed }) => [
            styles.linkHitbox,
            (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
          ]}
        >
          <Text style={[styles.linkText, { fontSize, lineHeight }]}>📸 SHOOTING</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/finances')}
          style={({ hovered, pressed }) => [
            styles.linkHitbox,
            (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
          ]}
        >
          <Text style={[styles.linkText, { fontSize, lineHeight }]}>💶 FINANCES</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/contact')}
          style={({ hovered, pressed }) => [
            styles.linkHitbox,
            (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
          ]}
        >
          <Text style={[styles.linkText, { fontSize, lineHeight }]}>👤 CONTACT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#A5D2FD', // bleu Home
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