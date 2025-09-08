// components/ui/cells/EditableTextCell.tsx
import React from 'react';
import { TextInput, Platform } from 'react-native';

export default function EditableTextCell({
  value, onCommit, placeholder, style,
}: {
  value: string;
  onCommit: (v: string) => void | Promise<void>;
  placeholder?: string;
  style?: any;
}) {
  return (
    <TextInput
      defaultValue={value}
      placeholder={placeholder}
      onBlur={(e) => onCommit(e.nativeEvent.text ?? '')}
      style={[{
        color: '#fff', fontFamily: 'Delight-Medium', fontSize: 14,
        paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)', outlineStyle: 'none' as any,
      }, style]}
    />
  );
}