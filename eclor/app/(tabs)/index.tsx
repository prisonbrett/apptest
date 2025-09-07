import { SafeAreaView, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

const BG = '#A5D2FD';

const LOGO_SRC = Platform.select({
  web: require('@/assets/images/logolight.svg'),     // ton svg clair
  default: require('@/assets/images/icon.png'),      // fallback natif (mets ton png si tu en as un)
});

export default function MenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header logo, plus grand */}
        <Image
          source={LOGO_SRC as any}
          style={styles.logo}
          contentFit="contain"
          accessible
          accessibilityLabel="Logo"
        />

        {/* Menu */}
        <View style={styles.menu}>
          <Pressable
            onPress={() => router.push('/finances')}
            style={styles.linkHitbox}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
          >
            <Text style={styles.linkText}>💶 FINANCES</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/tasks')}
            style={styles.linkHitbox}
            android_ripple={{ color: 'rgba(255,255,255,0.15)', borderless: false }}
          >
            <Text style={styles.linkText}>☑️ TASKS</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  // ++ logo plus grand
  logo: {
    width: 150,    // ← ajuste si besoin
    height: 100,    // ← ajuste si besoin
  },
  menu: {
    flex: 1,
    justifyContent: 'center',
    gap: 28,
  },
  // zone cliquable sans fond (pour garder l’apparence “texte seul”)
  linkHitbox: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  // ++ taille texte plus grande (comme avant mais sans bandeau)
  linkText: {
    color: '#FFFFFF',
    textTransform: 'uppercase',
    fontFamily: 'Delight-ExtraBold',
    fontSize: 34,       // ← augmente/réduis selon ton goût (ex: 32–34 pour encore plus gros)
    letterSpacing: 0.8,
    lineHeight: 34,
  },
});