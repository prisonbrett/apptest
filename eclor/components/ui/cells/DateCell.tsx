// components/ui/cells/DateCell.tsx
import React from 'react';
import { TextInput } from 'react-native';

function ddmmyyyyToISO(s: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : s;
}

export default function DateCell({
  value, onCommit,
}: {
  value: string; onCommit: (iso: string) => void | Promise<void>;
}) {
  return (
    <TextInput
      defaultValue={value}
      placeholder="yyyy-mm-dd ou dd/mm/yyyy"
      onBlur={(e) => {
        const raw = (e.nativeEvent.text ?? '').trim();
        const iso = /^\d{2}\/\d{2}\/\d{4}$/.test(raw) ? ddmmyyyyToISO(raw) : raw;
        onCommit(iso);
      }}
      style={{
        color: '#fff', fontFamily: 'Delight-Medium', fontSize: 14,
        paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)', outlineStyle: 'none' as any,
      }}
    />
  );
}