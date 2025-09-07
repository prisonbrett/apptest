import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  GestureResponderEvent,
} from 'react-native';

export type TableColumn<T = any> = {
  key: keyof T | string;
  label?: string;          // texte header
  title?: string;          // alias legacy
  width?: number;          // px
  flex?: number;           // ratio si pas de width
  align?: 'left' | 'center' | 'right';
  textAlign?: 'left' | 'center' | 'right'; // alias legacy
  render?: (row: T, rowIndex: number) => React.ReactNode;
};

type Props<T = any> = {
  columns?: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowPress?: (row: T, index: number) => void;
  dense?: boolean;
  maxHeight?: number;          // active le scroll vertical interne
  hideHeaderWhenEmpty?: boolean;
  inferColumns?: boolean;
  labelizeKey?: (k: string) => string;
  resizable?: boolean;         // redimensionnement des colonnes (web)
};

type NormalizedColumn<T> = {
  key: keyof T | string;
  label: string;
  width?: number;
  flex?: number;
  align: 'left' | 'center' | 'right';
  render: (row: T, rowIndex: number) => React.ReactNode;
};

function defaultLabelize(key: string) {
  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().toUpperCase();
}

function alignStyle(align?: 'left' | 'center' | 'right') {
  switch (align) {
    case 'center': return { textAlign: 'center' as const };
    case 'right':  return { textAlign: 'right' as const };
    default:       return { textAlign: 'left' as const };
  }
}

function normalizeColumn<T>(col: TableColumn<T>, labelizeKey: (k: string) => string): NormalizedColumn<T> {
  const label = col.label ?? col.title ?? labelizeKey(String(col.key));
  const align = col.align ?? col.textAlign ?? 'left';
  const flex  = col.flex ?? (col.width ? undefined : 1);
  return { key: col.key, label, width: col.width, flex, align, render: col.render ?? (() => null) };
}

export default function TableView<T = any>({
  columns,
  data,
  loading = false,
  emptyText = 'Aucune donnée',
  onRowPress,
  dense = false,
  maxHeight,
  hideHeaderWhenEmpty = false,
  inferColumns = false,
  labelizeKey = defaultLabelize,
  resizable = true,
}: Props<T>) {
  const effColumns = useMemo<NormalizedColumn<T>[]>(() => {
    if ((!columns && data.length > 0) || inferColumns) {
      const first = data[0] ?? {};
      const keys = Object.keys(first) as (keyof T | string)[];
      return keys.map(k => normalizeColumn({ key: k, label: labelizeKey(String(k)), flex: 1 }, labelizeKey));
    }
    return (columns ?? []).map(c => normalizeColumn(c, labelizeKey));
  }, [columns, data, inferColumns, labelizeKey]);

  const [widths, setWidths] = useState<Record<string, number | undefined>>(
    Object.fromEntries(effColumns.map(c => [String(c.key), c.width]))
  );

  const dragRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const hasData = data.length > 0;

  const cellDims = (col: NormalizedColumn<T>) => {
    const w = widths[String(col.key)];
    return w != null ? { width: w, minWidth: w, maxWidth: w } : { flex: col.flex ?? 1 };
  };

  // resize handlers
  const onResizeGrant = (key: string) => (e: GestureResponderEvent) => {
    const x = e.nativeEvent.pageX ?? e.nativeEvent.locationX;
    const startW = widths[key] ?? 140;
    dragRef.current = { key, startX: x, startW };
  };
  const onResizeMove = (e: GestureResponderEvent) => {
    if (!dragRef.current) return;
    const x = e.nativeEvent.pageX ?? e.nativeEvent.locationX;
    const dx = x - dragRef.current.startX;
    const next = Math.max(80, Math.min(520, dragRef.current.startW + dx));
    setWidths(prev => ({ ...prev, [dragRef.current!.key]: next }));
  };
  const onResizeEnd = () => { dragRef.current = null; };

  const renderCells = (row: T, i: number) =>
    effColumns.map((col) => {
      const raw = (row as any)?.[col.key];
      const rendered = col.render ? col.render(row, i) : raw;
      const isEmptyNumber = typeof rendered === 'number' && rendered === 0;
      const content = rendered == null || rendered === '' || isEmptyNumber ? '' : rendered;

      return (
        <View key={String(col.key)} style={[styles.cell, cellDims(col)]}>
          {typeof content === 'string' || typeof content === 'number'
            ? <Text style={[styles.cellText, alignStyle(col.align)]} numberOfLines={1}>{String(content)}</Text>
            : content}
        </View>
      );
    });

  // web: height fixe; natif: maxHeight
  const verticalStyle = maxHeight
    ? (Platform.OS === 'web' ? ({ height: maxHeight } as any) : ({ maxHeight } as any))
    : undefined;

  return (
    <View style={styles.wrap}>
      {/* HORIZONTAL */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 0 }}
      >
        <View>
          {/* HEADER */}
          {(effColumns.length > 0 && (hasData || !hideHeaderWhenEmpty)) && (
            <View style={[styles.headerRow, dense && styles.headerRowDense]}>
              {effColumns.map((col) => (
                <View key={String(col.key)} style={[styles.cell, styles.headerCell, cellDims(col)]}>
                  <Text style={[styles.headerText, alignStyle(col.align)]} numberOfLines={1}>
                    {col.label || String(col.key)}
                  </Text>
                  {resizable && (
                    <View
                      style={styles.colResizer}
                      onStartShouldSetResponder={() => true}
                      onResponderGrant={onResizeGrant(String(col.key))}
                      onResponderMove={onResizeMove}
                      onResponderRelease={onResizeEnd}
                      onResponderTerminate={onResizeEnd}
                    />
                  )}
                </View>
              ))}
            </View>
          )}

          {/* VERTICAL */}
          <ScrollView
            style={verticalStyle}
            showsVerticalScrollIndicator
            nestedScrollEnabled
            contentContainerStyle={{ flexGrow: 0 }}
          >
            <View style={{ flex: 1 }}>
              {loading ? (
                <View style={styles.stateWrap}><Text style={styles.stateText}>Chargement…</Text></View>
              ) : !hasData ? (
                <View style={styles.stateWrap}><Text style={styles.stateText}>{emptyText}</Text></View>
              ) : (
                data.map((row, i) =>
                  onRowPress ? (
                    <Pressable
                      key={i}
                      onPress={() => onRowPress(row, i)}
                      accessibilityRole="button"
                      style={({ hovered, pressed }) => [
                        styles.dataRow, dense && styles.dataRowDense,
                        Platform.OS === 'web' && hovered && styles.rowHover,
                        pressed && styles.rowPressed,
                      ]}
                    >
                      {renderCells(row, i)}
                    </Pressable>
                  ) : (
                    <View key={i} style={[styles.dataRow, dense && styles.dataRowDense]}>
                      {renderCells(row, i)}
                    </View>
                  )
                )
              )}
            </View>
          </ScrollView>
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
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  headerRowDense: { paddingVertical: 8 },
  headerCell: { position: 'relative' },
  headerText: {
    color: '#fff',
    fontFamily: 'Delight-ExtraBold',        // ta police
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 14,
    opacity: 0.95,
  },
  colResizer: {
    position: 'absolute', top: 0, right: 0, bottom: 0, width: 8,
    ...Platform.select({ web: { cursor: 'col-resize' as any }, default: {} }),
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
  cellText: {
    color: '#fff',
    fontFamily: 'Delight-SemiBold',        // ta police
    fontSize: 14,
  },
  stateWrap: { paddingVertical: 28, alignItems: 'center', justifyContent: 'center' },
  stateText: { color: 'rgba(255,255,255,0.85)', fontFamily: 'Delight-SemiBold', fontSize: 13 },
});