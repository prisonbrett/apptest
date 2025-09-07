import { SafeAreaView, View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import LogoLight from '@/assets/images/logolight.svg';

export default function MenuScreen() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();

  // responsive : phone vs desktop
  const isPhoneLayout = screenW <= 480;

  // logo sizing
  const factor = isPhoneLayout ? 0.35 : 0.15;
  const minW = isPhoneLayout ? 110 : 120;
  const maxW = isPhoneLayout ? 220 : 260;
  const logoWidth = Math.max(minW, Math.min(screenW * factor, maxW));
  const logoHeight = Math.round(logoWidth / 2.4); // ratio choisi

  // titles sizing (avec boost tablette / petit desktop)
  const basePhone = 38;
  const baseDesktop = 38;
  let fontSize = Math.max(
    22,
    Math.min(isPhoneLayout ? basePhone : baseDesktop, screenW * (isPhoneLayout ? 0.09 : 0.05))
  );
  if (!isPhoneLayout && screenW >= 600 && screenW <= 1024) {
    fontSize = Math.max(fontSize, 44);
  }
  const lineHeight = Math.round(fontSize + 6);

  const canBack = typeof router.canGoBack === 'function' ? router.canGoBack() : false;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo en haut à gauche → retourne à la Home */}
        <Pressable
          onPress={() => router.replace('/')}
          style={({ hovered, pressed }) => [
            styles.logoWrap,
            (hovered || pressed) && { transform: [{ scale: hovered ? 1.02 : 0.98 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Revenir à l’accueil"
        >
          <LogoLight width={logoWidth} height={logoHeight} />
        </Pressable>

        {/* Menu */}
        <View style={styles.menu}>
          {/* TASKS */}
          <Pressable
            onPress={() => router.push('/tasks')}
            style={({ hovered, pressed }) => [
              styles.linkHitbox,
              (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
          >
            <Text style={[styles.linkText, { fontSize, lineHeight }]}>☑️ TASKS</Text>
          </Pressable>

          {/* SHOOTING */}
          <Pressable
            onPress={() => router.push('/shooting')}
            style={({ hovered, pressed }) => [
              styles.linkHitbox,
              (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
          >
            <Text style={[styles.linkText, { fontSize, lineHeight }]}>📸 SHOOTING</Text>
          </Pressable>

          {/* FINANCES */}
          <Pressable
            onPress={() => router.push('/finances')}
            style={({ hovered, pressed }) => [
              styles.linkHitbox,
              (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
          >
            <Text style={[styles.linkText, { fontSize, lineHeight }]}>💶 FINANCES</Text>
          </Pressable>

          {/* CONTACT */}
          <Pressable
            onPress={() => router.push('/contact')}
            style={({ hovered, pressed }) => [
              styles.linkHitbox,
              (hovered || pressed) && { transform: [{ scale: hovered ? 1.03 : 0.98 }] },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
          >
            <Text style={[styles.linkText, { fontSize, lineHeight }]}>👤 CONTACT</Text>
          </Pressable>
        </View>

        {/* Bouton retour en bas-gauche (affiché seulement si retour possible) */}
        {canBack && (
          <Pressable
            onPress={() => router.back()}
            style={({ hovered, pressed }) => [
              styles.backBtn,
              (hovered || pressed) && { transform: [{ scale: hovered ? 1.05 : 0.98 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Revenir à la page précédente"
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#A5D2FD' },
  container: { flex: 1, padding: 16 },
  logoWrap: {
    alignSelf: 'flex-start',
    marginLeft: 4,
    marginTop: 4,
  },
  menu: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
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
  backBtn: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 22,
    fontFamily: 'Delight-ExtraBold',
  },
});