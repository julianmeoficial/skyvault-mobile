import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { AircraftDetailDto } from '../../shared/types/aircraft.types';
import { GlassCard } from '../ui/GlassCard';
import { SPEC_TABS, formatSpecValue, type SpecFieldDef } from '../../features/aircraft/utils/specLabels';
import { useTheme } from '../../theme';

interface AircraftSpecsTabsProps {
  aircraft: AircraftDetailDto;
}

function getFieldValue(
  aircraft: AircraftDetailDto,
  field: SpecFieldDef,
): string | number | undefined | null {
  const specs = aircraft.specifications;
  if (field.key === '_cruiseKnots') return aircraft.cruiseSpeedKnots;
  if (field.key === '_rangeKm') return aircraft.rangeKm;
  if (!specs || field.key.startsWith('_')) return undefined;
  return specs[field.key as keyof typeof specs];
}

export function AircraftSpecsTabs({ aircraft }: AircraftSpecsTabsProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const [tab, setTab] = useState(SPEC_TABS[0].id);
  const active = SPEC_TABS.find((t) => t.id === tab) ?? SPEC_TABS[0];

  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={{ color: colors.textPrimary, fontSize: fontSize.h5, fontFamily: fontFamily.bold }}>
        Especificaciones técnicas
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginBottom: spacing.sm }}>
        Datos detallados de ingeniería
      </Text>
      <View style={styles.tabs}>
        {SPEC_TABS.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[
              styles.tab,
              {
                borderColor: tab === t.id ? colors.primary : colors.border,
                backgroundColor: tab === t.id ? colors.glassBackground : 'transparent',
              },
            ]}
          >
            <Text
              style={{
                color: tab === t.id ? colors.primary : colors.textMuted,
                fontSize: fontSize.caption,
                fontFamily: fontFamily.medium,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <GlassCard>
        {active.fields.map((field) => {
          const raw = getFieldValue(aircraft, field);
          const formatted = formatSpecValue(raw);
          const display = formatted === '—' ? '—' : `${formatted}${field.unit ? ` ${field.unit}` : ''}`;
          return (
            <View key={String(field.key)} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={{ color: colors.textMuted, fontFamily: fontFamily.regular }}>{field.label}</Text>
              <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>{display}</Text>
            </View>
          );
        })}
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tab: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
