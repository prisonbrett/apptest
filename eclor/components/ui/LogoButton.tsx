// eclor/components/ui/LogoButton.tsx
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Logo from '@/assets/images/logolight.svg';

type Props = {
  width: number;
  height: number;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
};

export default function LogoButton({ width, height, onPress, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.logoWrap,
        style,
        (hovered || pressed) && { transform: [{ scale: hovered ? 1.02 : 0.98 }] },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Revenir à l’accueil"
    >
      <Logo width={width} height={height} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoWrap: { alignSelf: 'flex-start' },
});