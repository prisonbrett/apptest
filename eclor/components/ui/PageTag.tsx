// eclor/components/ui/PageTag.tsx
import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

type Props = {
  text: string;            // ex: "💰 DÉPENSES"
  fontSize: number;
  lineHeight?: number;
  style?: TextStyle | TextStyle[];
};

export default function PageTag({ text, fontSize, lineHeight, style }: Props) {
  return (
    <Text
      style={[styles.tag, { fontSize, lineHeight: lineHeight ?? Math.round(fontSize + 6) }, style]}
      numberOfLines={1}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  tag: {
    maxWidth: '62%',
    textAlign: 'right',
    color: '#fff',
    textTransform: 'uppercase',
    fontFamily: 'Delight-ExtraBold',
  },
});