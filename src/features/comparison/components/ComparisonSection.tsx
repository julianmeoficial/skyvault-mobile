import { View, Text, StyleSheet } from 'react-native';
import type { ComparisonItem } from '../../../shared/types/comparison.types';
import { useTheme } from '../../../theme';

export const COMPARE_COLORS = ['#E3F2FD', '#FFF3E0', '#F3E5F5'];

interface SpecDef {
  label: string;
  unit?: string;
  getValue: (item: ComparisonItem) => number | string | undefined | null;
}

interface ComparisonSectionProps {
  title: string;
  items: ComparisonItem[];
  specs: SpecDef[];
}

function formatVal(v: number | string | undefined | null, unit?: string): string {
  if (v === undefined || v === null || v === '') return '—';
  const s = typeof v === 'number' ? v.toLocaleString() : String(v);
  return unit ? `${s} ${unit}` : s;
}

export function ComparisonSection({ title, items, specs }: ComparisonSectionProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.primary, fontFamily: fontFamily.bold, fontSize: fontSize.caption }]}>
        {title}
      </Text>
      {specs.map((spec) => (
        <View key={spec.label} style={[styles.row, { borderBottomColor: colors.borderLight }]}>
          <Text style={[styles.label, { color: colors.textMuted, fontSize: fontSize.caption }]}>{spec.label}</Text>
          <View style={styles.values}>
            {items.map((item, i) => (
              <View
                key={item.id}
                style={[styles.cell, { backgroundColor: COMPARE_COLORS[i % 3] + '99' }]}
              >
                <Text style={{ color: colors.textPrimary, fontSize: fontSize.caption, fontFamily: fontFamily.medium }}>
                  {formatVal(spec.getValue(item), spec.unit)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
  title: { letterSpacing: 1, marginBottom: 8 },
  row: { paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { marginBottom: 4 },
  values: { flexDirection: 'row', gap: 6 },
  cell: { flex: 1, padding: 8, borderRadius: 8, minHeight: 36, justifyContent: 'center' },
});
