import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from '@/assets/images/logolight.svg';

export default function DepensesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();

  const isPhone = screenW < 768;

  // marges/tailles communes
  const H_MARGIN = 20; // marge à gauche pour aligner logo + bouton retour
  const LOGO_W = isPhone ? 120 : 160;
  const LOGO_H = Math.round(LOGO_W / 2.4);

  // titres (cohérent avec Home)
  const basePhone = 38;
  const baseDesktop = 38;
  let fontSize = Math.max(
    22,
    Math.min(isPhone ? basePhone : baseDesktop, screenW * (isPhone ? 0.08 : 0.045))
  );
  if (!isPhone && screenW >= 600 && screenW <= 1024) fontSize = Math.max(fontSize, 44);
  const lineHeight = Math.round(fontSize + 6);

  // ↓ Ne réduit que "AMORTISSEMENTS" sur téléphone (très léger)
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
          💰 DÉPENSES
        </Text>
      </View>

      {/* MENU : centré sur tout l’écran (indépendant du header) */}
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

  /* Menu centré plein écran */
  menuAbs: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 16,        // plus serré pour longues listes
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