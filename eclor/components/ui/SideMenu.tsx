// components/ui/SideMenu.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Animated,
  StyleProp,
  ViewStyle,
  StyleSheet as RNStyleSheet,
} from 'react-native';

export type MenuItem = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

type Props = {
  items: MenuItem[];
  open: boolean;
  onRequestClose: () => void;
  width?: number;               // default 300
  leftPadding?: number;         // default 20
  topOffset?: number;           // NEW: pixels from the top where the menu should start
  style?: StyleProp<ViewStyle>;
};

export default function SideMenu({
  items,
  open,
  onRequestClose,
  width = 300,
  leftPadding = 20,
  topOffset = 0,                // default: stick to very top
  style,
}: Props) {
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: open ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [open, t]);

  // Close with Escape on web
  useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;
    const onKey = (e: any) => {
      if (e.key === 'Escape') onRequestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onRequestClose]);

  if (!open) return null;

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const overlayLeft = width + leftPadding;

  return (
    <View style={[RNStyleSheet.absoluteFillObject, styles.host]} pointerEvents="box-none">
      {/* Panel column (starts below header) */}
      <View style={[styles.sideCol, { width, paddingLeft: leftPadding, top: topOffset }]}>
        <Animated.View
          style={[
            styles.wrap,
            { width, transform: [{ translateX }] },
            style,
          ]}
          pointerEvents="auto"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
          </View>

          <View style={styles.list}>
            {items.map((it) => {
              const isAmort = /AMORTISSEMENTS/i.test(it.label);
              return (
                <Pressable
                  key={it.label}
                  onPress={it.onPress}
                  style={({ hovered, pressed }) => [
                    styles.row,
                    it.active && styles.rowActive,
                    (hovered || pressed) && !it.active && styles.rowHover,
                    (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
                  ]}
                >
                  <Text
                    style={[
                      styles.rowText,
                      it.active && styles.rowTextActive,
                      isAmort ? styles.rowTextAmort : null,
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.97}
                  >
                    {it.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </View>

      {/* Click-outside overlay (also starts below header) */}
      <Pressable
        style={[styles.overlay, { left: overlayLeft, top: topOffset }]}
        onPress={onRequestClose}
        {...(Platform.OS === 'web' ? { onFocus: (e) => (e.target as any).blur() } : {})}
        accessibilityLabel="Fermer le menu"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: { zIndex: 4 },
  sideCol: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    overflow: 'visible',
    zIndex: 8,
  },
  wrap: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    paddingTop: 8,
    paddingBottom: 14,
    paddingHorizontal: 10,
    ...Platform.select({
      web: { boxShadow: '0 12px 28px rgba(0,0,0,0.18)' },
      default: { elevation: 4 },
    }),
  },
  overlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  title: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    textTransform: 'uppercase',
    fontSize: 14,
    opacity: 0.9,
  },
  list: { gap: 8, marginTop: 4 },
  row: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    // @ts-ignore web-only
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  rowHover: { backgroundColor: 'rgba(255,255,255,0.08)' },
  rowActive: { backgroundColor: 'rgba(255,255,255,0.18)' },
  rowText: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    textTransform: 'uppercase',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  rowTextActive: { letterSpacing: 0.6 },
  rowTextAmort: { letterSpacing: 0.45 },
});