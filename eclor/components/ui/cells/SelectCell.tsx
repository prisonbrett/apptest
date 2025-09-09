// components/ui/cells/SelectCell.tsx
import React from 'react';
import SingleSelect from '@/components/ui/SingleSelect';

type Option = { value: string; label: string; emoji?: string; color?: string };

export default function SelectCell({
  value, options, onCommit,
}: {
  value: string | null;
  options: readonly Option[];
  onCommit: (v: string | null) => void | Promise<void>;
}) {
  return (
    <SingleSelect
      value={value}
      options={[...options]}
      onChange={onCommit}
      placeholder=""
    />
  );
}