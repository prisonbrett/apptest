import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Delight-Light': require('@/assets/fonts/Delight-Light.ttf'),
    'Delight-Medium': require('@/assets/fonts/Delight-Medium.ttf'),
    'Delight-SemiBold': require('@/assets/fonts/Delight-SemiBold.ttf'),
    'Delight-ExtraBold': require('@/assets/fonts/Delight-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false, // on gère nos headers nous-mêmes
      }}
    >
      {/* On affiche le sous-arbre (tabs) sans header natif */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}