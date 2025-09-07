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
} from 'react-native';

export type MenuItem = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

type Props = {
  items: MenuItem[];
  open: boolean;                 // ← contrôle d'ouverture
  onRequestClose: () => void;    // ← fermeture (clic dehors / Esc)
  width?: number;                // largeur du panneau (def. 300)
  leftPadding?: number;          // marge visuelle à gauche (def. 20)
  style?: StyleProp<ViewStyle>;  // optionnel (rarement utile)
};

export default function SideMenu({
  items,
  open,
  onRequestClose,
  width = 300,
  leftPadding = 20,
  style,
}: Props) {
  // animation slide-in
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(t, {
      toValue: open ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [open, t]);

  // Fermer avec Escape (web)
  useEffect(() => {
    if (Platform.OS !== 'web' || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onRequestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onRequestClose]);

  if (!open) return null; // on ne rend rien si fermé (simple et efficace)

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] });
  const overlayLeft = width + leftPadding;

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.host]} pointerEvents="box-none">
      {/* Colonne du panneau à gauche (au-dessus du contenu/overlay) */}
      <View style={[styles.sideCol, { width, paddingLeft: leftPadding }]}>
        <Animated.View
          style={[
            styles.wrap,
            { width, transform: [{ translateX }] },
            style,
          ]}
          pointerEvents="auto"
        >
          {/* Entête */}
          <View style={styles.header}>
            <Text style={styles.title}>Menu</Text>
          </View>

          {/* Liste */}
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

      {/* Overlay cliquable à DROITE du panneau (ne couvre pas la colonne menu) */}
      <Pressable
        style={[styles.overlay, { left: overlayLeft }]}
        onPress={onRequestClose}
        // éviter la bordure bleue de focus sur web
        {...(Platform.OS === 'web' ? { onFocus: (e) => (e.target as any).blur() } : {})}
        accessibilityLabel="Fermer le menu"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    zIndex: 40, // le panneau passera à 60 dans sideCol
  },
  sideCol: {
    position: 'absolute',
    left: 0,
    top: 0, bottom: 0,
    overflow: 'visible',
    zIndex: 60, // au-dessus de l’overlay
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
    top: 0, right: 0, bottom: 0,
    zIndex: 50,
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
  list: {
    gap: 8,
    marginTop: 4,
  },
  row: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    // @ts-ignore web-only
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  rowHover: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  rowActive: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  rowText: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    textTransform: 'uppercase',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  rowTextActive: {
    letterSpacing: 0.6,
  },
  rowTextAmort: {
    letterSpacing: 0.45,
  },
});