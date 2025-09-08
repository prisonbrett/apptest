// features/depenses/columns.tsx
import React from 'react';
import { Text, Linking } from 'react-native';
import type { TableColumn } from '@/components/ui/TableView';
import SingleSelect from '@/components/ui/SingleSelect';
import {
  DEPENSES_HEADERS,
  DEPENSES_CATEGORIES,
  DEPENSES_TYPES,
  matchOption,
} from '@/constants/DepensesSchema';

export type Row = {
  date: string; label: string; cat: string; type: string;
  echeance: string; jours: string; montant: number;
  estAnnuel: number; url: string; mensualite: number; cumule: number; id: string;
};

const money = (n?: number | null) =>
  !n || !Number.isFinite(n) || n === 0
    ? ''
    : `${Number(n).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;

export function makeColumns(setRows: React.Dispatch<React.SetStateAction<Row[]>>): TableColumn<Row>[] {
  return [
    { key: 'date',  label: DEPENSES_HEADERS.datePaiement, width: 180, render: r => r.date },

    { key: 'label', label: DEPENSES_HEADERS.libelle, width: 420,
      render: r => (
        <Text numberOfLines={1} style={{ color:'#fff', fontFamily:'Delight-Medium' }}>
          {r.label}
        </Text>
      ),
    },

    { key: 'cat',   label: DEPENSES_HEADERS.categorie, width: 230,
      render: (row, i) => {
        const current = matchOption(row.cat, DEPENSES_CATEGORIES);
        return (
          <SingleSelect
            options={DEPENSES_CATEGORIES as any}
            value={current?.value ?? null}
            onChange={(v) => {
              setRows(prev => { const n=[...prev]; n[i]={...n[i], cat: v?String(v):''}; return n; });
            }}
            placeholder=""
          />
        );
      },
    },

    { key: 'type',  label: DEPENSES_HEADERS.type, width: 200,
      render: (row, i) => {
        const current = matchOption(row.type, DEPENSES_TYPES);
        // 👉 si tu préfères masquer quand vide : if (!current) return '';
        return (
          <SingleSelect
            options={DEPENSES_TYPES as any}
            value={current?.value ?? null}
            onChange={(v) => {
              setRows(prev => { const n=[...prev]; n[i]={...n[i], type: v?String(v):''}; return n; });
            }}
            placeholder=""
          />
        );
      },
    },

    { key: 'echeance', label: DEPENSES_HEADERS.echeance, width: 160, render: r => r.echeance },
    { key: 'jours',    label: DEPENSES_HEADERS.joursRestants, width: 120, render: r => r.jours },

    { key: 'montant',    label: DEPENSES_HEADERS.montantTTC,       width: 140, align:'right', render: r => money(r.montant) },
    { key: 'estAnnuel',  label: DEPENSES_HEADERS.estimationAnnuel, width: 150, align:'right', render: r => money(r.estAnnuel) },
    { key: 'mensualite', label: DEPENSES_HEADERS.mensualite,       width: 150, align:'right', render: r => money(r.mensualite) },
    { key: 'cumule',     label: DEPENSES_HEADERS.cumule,           width: 150, align:'right', render: r => money(r.cumule) },

    { key: 'url', label: DEPENSES_HEADERS.url, width: 130,
      render: r => r.url
        ? <Text style={{ color:'#fff', textDecorationLine:'underline' }} onPress={() => Linking.openURL(r.url)} numberOfLines={1}>Ouvrir</Text>
        : '' },
  ];
}