// components/ui/MenuPill.tsx
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPress: () => void;
  left: number;
  bottom: number;
  style?: ViewStyle | ViewStyle[];
};

export default function MenuPill({ onPress, left, bottom, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.base,
        { left, bottom, transform: [{ scale: hovered || pressed ? 1.03 : 1 }] },
        Platform.OS === 'web' ? styles.web : styles.mobile,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Ouvrir le menu"
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="menu" size={Platform.OS === 'web' ? 20 : 24} color="#fff" />
      {Platform.OS === 'web' && <Text style={styles.label}>MENU</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 999,
    zIndex: 9999,
  },
  web: {
    height: 40,
    paddingHorizontal: 14,
    flexDirection: 'row',
    columnGap: 6,
    // @ts-ignore web-only
    boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
    cursor: 'pointer',
  },
  mobile: {
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 6,
  },
  label: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    textTransform: 'uppercase',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});