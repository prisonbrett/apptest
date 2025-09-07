import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/assets/images/logolight.svg';

export default function AClasserScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const isPhone = screenW < 768;
  const isWideDesktop = screenW >= 1024; // rail affiché ici

  // marges/tailles communes
  const H_MARGIN = 20; // marge à gauche pour aligner logo + bouton retour
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  // titres (cohérent avec Home / Dépenses)
  const basePhone = 38;
  const baseDesktop = 38;
  let fontSize = Math.max(
    22,
    Math.min(isPhone ? basePhone : baseDesktop, screenW * (isPhone ? 0.08 : 0.045))
  );
  if (!isPhone && screenW >= 600 && screenW <= 1024) fontSize = Math.max(fontSize, 44);
  const lineHeight = Math.round(fontSize + 6);

  // Liens du rail (autres vues de "Dépenses")
  const railLinks = [
    { label: '📅 MOIS', path: '/finances/depenses/mois' },
    { label: '📊 TRIMESTRE', path: '/finances/depenses/trimestre' },
    { label: '🗓️ ANNÉE', path: '/finances/depenses/annee' },
    { label: '🏷️ CATÉGORIE', path: '/finances/depenses/categorie' },
    { label: '🔄 ABONNEMENTS', path: '/finances/depenses/abonnements' },
    { label: '⏳ AMORTISSEMENTS', path: '/finances/depenses/amortissements' },
  ];

  // Animation du rail (desktop only)
  const slide = useRef(new Animated.Value(-260)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isWideDesktop) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [isWideDesktop, slide, fade]);

  return (
    <View style={[styles.safe, { paddingTop: insets.top + 10 }]}>
      {/* HEADER : logo à gauche, titre à droite */}
      <View style={[styles.headerRow, { paddingHorizontal: H_MARGIN }]}>
        <Pressable
          onPress={() => router.replace('/')}
          style={({ hovered, pressed }) => [
            styles.logoWrap,
            (hovered || pressed) && { transform: [{ scale: hovered ? 1.02 : 0.98 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Revenir à l’accueil"
        >
          <Logo width={LOGO_W} height={LOGO_H} />
        </Pressable>

        <Text style={[styles.pageTag, { fontSize, lineHeight }]} numberOfLines={1}>
          📥 À CLASSER
        </Text>
      </View>

      {/* RAIL LATÉRAL (desktop) */}
      {isWideDesktop && (
        <Animated.View
          style={[
            styles.rail,
            {
              paddingTop: insets.top + 90,
              transform: [{ translateX: slide }],
              opacity: fade,
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.railInner}>
            {/* Titre actuel en surbrillance dans le rail */}
            <View style={[styles.railItem, styles.railCurrent]}>
              <Text style={[styles.railText, styles.railTextCurrent]} numberOfLines={1}>
                📥 À CLASSER
              </Text>
            </View>

            {railLinks.map((l) => (
              <Pressable
                key={l.path}
                onPress={() => router.push(l.path)}
                style={({ hovered, pressed }) => [
                  styles.railItem,
                  (hovered || pressed) && { transform: [{ scale: hovered ? 1.02 : 0.98 }] },
                ]}
              >
                <Text style={styles.railText} numberOfLines={1}>
                  {l.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* CONTENU CENTRAL (placeholder pour l’instant) */}
      <View style={styles.centerWrap} pointerEvents="box-none">
        <Text style={[styles.centerTitle, { fontSize: isPhone ? 26 : 32 }]}>
          Ici : tes éléments “À classer”
        </Text>
        <Text style={styles.centerSub}>(on branchera la vraie liste ensuite)</Text>
      </View>

      {/* BOUTON RETOUR : rond parfait sur mobile, pilule sur web */}
      <Pressable
        onPress={() => router.back()}
        style={({ hovered, pressed }) => [
          styles.backBase,
          {
            left: H_MARGIN,
            bottom: insets.bottom + 20,
            transform: [{ scale: hovered || pressed ? 1.03 : 1 }],
          },
          Platform.OS === 'web' ? styles.backWeb : styles.backMobile,
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel="Revenir à la page précédente"
      >
        <Ionicons name="chevron-back" size={Platform.OS === 'web' ? 20 : 24} color="#fff" />
        {Platform.OS === 'web' && <Text style={styles.backLabel}>RETOUR</Text>}
      </Pressable>
    </View>
  );
}

const RAIL_W = 260;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#C14E4E',
  },

  /* Header */
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // logo à gauche / titre à droite
    marginBottom: 8,
  },
  logoWrap: {
    alignSelf: 'flex-start',
  },
  pageTag: {
    maxWidth: '62%',
    textAlign: 'right',
    color: '#fff',
    textTransform: 'uppercase',
    fontFamily: 'Delight-ExtraBold',
  },

  /* Rail latéral */
  rail: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: RAIL_W,
  },
  railInner: {
    height: '100%',
    paddingHorizontal: 16,
    gap: 12,
  },
  railItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  railCurrent: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  railText: {
    color: '#fff',
    textTransform: 'uppercase',
    fontFamily: 'Delight-ExtraBold',
    letterSpacing: 1,
    includeFontPadding: false,
    fontSize: 18,
  },
  railTextCurrent: {
    color: '#fff',
  },

  /* Contenu central */
  centerWrap: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    // Sur desktop avec rail, on “pousse” visuellement le centre un peu à droite
    ...(Platform.OS === 'web' ? { paddingLeft: RAIL_W } : null),
  },
  centerTitle: {
    color: '#fff',
    textTransform: 'uppercase',
    fontFamily: 'Delight-ExtraBold',
    textAlign: 'center',
  },
  centerSub: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'Delight-Medium',
    textAlign: 'center',
  },

  /* Retour */
  backBase: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderRadius: 999,
    zIndex: 9999,
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.22)', cursor: 'pointer' },
      default: { elevation: 6 },
    }),
  },
  // Pilule (web)
  backWeb: {
    height: 40,
    paddingHorizontal: 14,
    flexDirection: 'row',
    columnGap: 6,
  },
  // Rond parfait (mobile)
  backMobile: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  backLabel: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    textTransform: 'uppercase',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});