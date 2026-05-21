import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import type { AircraftFilters } from '../../shared/types/aircraft.types';

interface FilterFormProps {
  filters: AircraftFilters;
  onChange: (partial: Partial<AircraftFilters>) => void;
}

export function FilterForm({ filters, onChange }: FilterFormProps) {
  const { colors, fontSize, fontFamily, spacing } = useTheme();

  return (
    <GlassCard style={{ marginBottom: spacing.md }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: fontSize.bodySmall,
          fontFamily: fontFamily.semibold,
          marginBottom: spacing.md,
        }}
      >
        Filtros
      </Text>
      <View style={styles.row}>
        <Text style={{ color: colors.textSecondary, flex: 1 }}>Solo en producción</Text>
        <Switch
          value={filters.onlyActive ?? true}
          onValueChange={(v) => onChange({ onlyActive: v })}
          trackColor={{ true: colors.primary }}
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
