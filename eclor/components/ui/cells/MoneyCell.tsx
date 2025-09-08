// components/ui/cells/MoneyCell.tsx
import React from 'react';
import { TextInput, Platform } from 'react-native';

export default function MoneyCell({
  value, onCommit,
}: {
  value: number; onCommit: (n: number) => void | Promise<void>;
}) {
  return (
    <TextInput
      defaultValue={value ? String(value) : ''}
      keyboardType={Platform.OS === 'web' ? ('decimal' as any) : 'numeric'}
      placeholder="0"
      onBlur={(e) => {
        const raw = (e.nativeEvent.text ?? '').replace(/\s/g, '').replace(',', '.');
        const n = Number(raw);
        onCommit(Number.isFinite(n) ? n : 0);
      }}
      style={{
        color: '#fff', fontFamily: 'Delight-Medium', fontSize: 14,
        paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)', textAlign: 'right',
        outlineStyle: 'none' as any,
      }}
    />
  );
}