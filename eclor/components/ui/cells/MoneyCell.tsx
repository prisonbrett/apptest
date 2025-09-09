// components/ui/cells/MoneyCell.tsx
import React from 'react';
import { TextInput, Platform } from 'react-native';

import { Text, View } from 'react-native';

export default function MoneyCell({
  value, onCommit,
}: {
  value: number; onCommit: (n: number) => void | Promise<void>;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingRight: 10 }}>
      <TextInput
        defaultValue={value ? String(value) : ''}
        keyboardType={Platform.OS === 'web' ? ('decimal' as any) : 'numeric'}
        placeholder="0"
        onBlur={(e) => {
          let n = Number((e.nativeEvent.text ?? '').replace(/\s/g, '').replace(',', '.'));
          if (Number.isFinite(n)) {
            n = Math.round(n * 100) / 100; // round to 2 decimal places
            onCommit(n);
          } else {
            onCommit(0);
          }
        }}
        style={{
          color: '#fff', fontFamily: 'Delight-Medium', fontSize: 14,
          paddingVertical: 6, paddingHorizontal: 10,
          textAlign: 'right', outlineStyle: 'none' as any,
          backgroundColor: 'transparent', flex: 1,
        }}
      />
      <Text style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Delight-Medium', fontSize: 14, marginLeft: 4 }}>€</Text>
    </View>
  );
}