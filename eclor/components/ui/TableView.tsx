// components/ui/TableView.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';

export type TableColumn<T = any> = {
  key: keyof T | string;
  label?: string;
  title?: string; // compat
  width?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right'; // compat
  render?: (row: T, rowIndex: number) => React.ReactNode;
};

type Props<T = any> = {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  dense?: boolean;
  maxHeight?: number;
  hideHeaderWhenEmpty?: boolean;
  onRowPress?: (row: T, index: number) => void;

  /** Redimensionnement colonnes (web) */
  resizable?: boolean;
  columnWidths?: Record<string, number>;
  onColumnResize?: (key: string, width: number) => void;

  /** Footer fixe (clé de colonne -> contenu) */
  footerRow?: Partial<Record<string, React.ReactNode>>;
  footerHeight?: number; // 40 par défaut
  footerLeftPadding?: number;
};

function defaultLabelize(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .toUpperCase();
}

function alignStyle(align?: 'left' | 'center' | 'right') {
  switch (align) {
    case 'center': return { textAlign: 'center' as const };
    case 'right':  return { textAlign: 'right' as const };
    default:       return { textAlign: 'left' as const };
  }
}

export default function TableView<T>({
  columns,
  data,
  loading = false,
  emptyText = 'Aucune donnée',
  dense = false,
  maxHeight,
  hideHeaderWhenEmpty = false,
  onRowPress,
  resizable = false,
  columnWidths,
  onColumnResize,
  footerRow,
  footerHeight = 40,
  footerLeftPadding,
}: Props<T>) {
  const hasData = data.length > 0;

  const headerRef = useRef<ScrollView>(null);
  const bodyRef = useRef<ScrollView>(null);
  const footerRef = useRef<ScrollView>(null);

  // --- Resize (web uniquement)
  const [resize, setResize] = useState<{ key: string; startX: number; startW: number } | null>(null);
  useEffect(() => {
    if (!resize) return;
    const onMove = (e: MouseEvent) => {
      if (!onColumnResize) return;
      const dx = e.clientX - resize.startX;
      const w = Math.max(60, Math.min(800, resize.startW + dx));
      onColumnResize(resize.key, w);
    };
    const onUp = () => setResize(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resize, onColumnResize]);

  const renderHeader = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={headerRef} scrollEnabled={false}>
      <View style={[styles.headerRow, dense && styles.headerRowDense]}>
        {columns.map((col) => {
          const wCtrl = columnWidths?.[String(col.key)];
          const w = typeof wCtrl === 'number' ? wCtrl : col.width;
          const box = w != null ? { width: w, minWidth: w, maxWidth: w } : { flex: col.flex ?? 1 };

          return (
            <View key={String(col.key)} style={[styles.cell, styles.headerCell, box]}>
              <Text
                style={[styles.headerText, alignStyle(col.align ?? col.textAlign)]}
                numberOfLines={1}
              >
                {col.label ?? col.title ?? defaultLabelize(String(col.key))}
              </Text>

              {Platform.OS === 'web' && resizable ? (
                <View
                  style={styles.resizer}
                  // @ts-ignore (événement web)
                  onMouseDown={(e: any) => {
                    const startW = (w ?? 160);
                    setResize({ key: String(col.key), startX: e.clientX, startW });
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderRow = (row: T, i: number) => {
    const rowContent = (
      <>
        {columns.map((col) => {
          const raw = (row as any)?.[col.key];
          const content = col.render ? col.render(row, i) : (raw ?? '');
          const wCtrl = columnWidths?.[String(col.key)];
          const w = typeof wCtrl === 'number' ? wCtrl : col.width;

          return (
            <View
              key={String(col.key)}
              style={[
                styles.cell,
                w != null ? { width: w, minWidth: w, maxWidth: w } : { flex: col.flex ?? 1 },
              ]}
            >
              {typeof content === 'string' || typeof content === 'number' ? (
                <Text style={[styles.cellText, alignStyle(col.align ?? col.textAlign)]} numberOfLines={1}>
                  {String(content)}
                </Text>
              ) : (
                content
              )}
            </View>
          );
        })}
      </>
    );

    if (!onRowPress) return <View key={i} style={[styles.dataRow, dense && styles.dataRowDense]}>{rowContent}</View>;
    return (
      <Pressable
        key={i}
        onPress={() => onRowPress(row, i)}
        accessibilityRole="button"
        style={({ hovered, pressed }) => [
          styles.dataRow,
          dense && styles.dataRowDense,
          Platform.OS === 'web' && hovered && styles.rowHover,
          pressed && styles.rowPressed,
        ]}
      >
        {rowContent}
      </Pressable>
    );
  };

  const header = (!hideHeaderWhenEmpty || hasData) ? renderHeader() : null;

  return (
    <View style={[styles.wrap, maxHeight ? { maxHeight } : null]}>
      {/* HEADER */}
      {header}

      {/* BODY + FOOTER */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        ref={bodyRef}
        onScroll={(e) => {
          const scrollX = e.nativeEvent.contentOffset.x;
          headerRef.current?.scrollTo({ x: scrollX, animated: false });
          footerRef.current?.scrollTo({ x: scrollX, animated: false });
        }}
        scrollEventThrottle={16} // Good practice for performance
      >
        <View style={{ flex: 1, minWidth: '100%', position: 'relative' }}>
          <ScrollView
            style={maxHeight ? { maxHeight: footerRow ? Math.max(0, maxHeight - footerHeight) : maxHeight } : undefined}
            contentContainerStyle={footerRow ? { paddingBottom: footerHeight } : undefined}
            showsVerticalScrollIndicator
          >
            {loading ? (
              <View style={styles.stateWrap}><Text style={styles.stateText}>Chargement…</Text></View>
            ) : !hasData ? (
              <View style={styles.stateWrap}><Text style={styles.stateText}>{emptyText}</Text></View>
            ) : (
              data.map((r, i) => renderRow(r, i))
            )}
          </ScrollView>

          {/* FOOTER FIXE */}
          {footerRow ? (
            <View style={[styles.footerRow, { height: footerHeight }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={footerRef} scrollEnabled={false}>
                <View style={[styles.footerInner, { paddingLeft: footerLeftPadding ?? 12 }]}>
                  {columns.map((col) => {
                    const wCtrl = columnWidths?.[String(col.key)];
                    const w = typeof wCtrl === 'number' ? wCtrl : col.width ?? 120;
                    const node = footerRow[String(col.key)];
                    const isText = typeof node === 'string' || typeof node === 'number';
                    return (
                      <View key={String(col.key)} style={{ width: w, minWidth: w, maxWidth: w, paddingRight: 12, justifyContent: 'center' }}>
                        {isText
                          ? <Text style={[styles.footerText, alignStyle(col.align ?? col.textAlign)]}>{String(node)}</Text>
                          : node ?? null}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    ...Platform.select({
      web: { boxShadow: '0 12px 28px rgba(0,0,0,0.18)' },
      default: { elevation: 3 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 12, // header un peu plus grand
    paddingHorizontal: 12,
  },
  headerRowDense: { paddingVertical: 8 },
  headerCell: { position: 'relative' },
  headerText: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 13, // + lisible
    opacity: 0.95,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  dataRowDense: { paddingVertical: 8 },
  rowHover: { backgroundColor: 'rgba(255,255,255,0.06)' },
  rowPressed: { backgroundColor: 'rgba(0,0,0,0.08)' },
  cell: { paddingRight: 12, justifyContent: 'center' },
  cellText: { color: '#fff', fontFamily: 'Delight-Medium', fontSize: 14 },
  stateWrap: { paddingVertical: 28, alignItems: 'center', justifyContent: 'center' },
  stateText: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Delight-Medium', fontSize: 13 },
  resizer: {
    position: 'absolute',
    top: 4,
    right: -4,
    bottom: 4,
    width: 8,
    cursor: 'col-resize',
    ...Platform.select({ web: { backgroundColor: 'transparent' } as any, default: {} }),
  },
  footerRow: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
    backgroundColor: '#C14E4E',
    justifyContent: 'center',
  },
  footerInner: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingRight: 12, // left is now a prop
  },
  footerText: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',
    fontSize: 13,
  },
});