import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import type { SpecificationsDto } from '../../shared/types/aircraft.types';

function formatVal(v: string | number | undefined): string {
  if (v === undefined || v === null || v === '') return '—';
  return String(v);
}

interface SpecRowProps {
  label: string;
  value: string;
}

function SpecRow({ label, value }: SpecRowProps) {
  const { colors, fontSize, fontFamily, spacing } = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: colors.borderLight }]}>
      <Text style={{ color: colors.textSecondary, fontSize: fontSize.bodySmall, flex: 1 }}>
        {label}
      </Text>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: fontSize.bodySmall,
          fontFamily: fontFamily.medium,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

interface SpecificationsListProps {
  specs?: SpecificationsDto;
  serviceCeilingFt?: number;
  typicalPassengers?: number;
  maxPassengers?: number;
  rangeKm?: number;
}

export function SpecificationsList({
  specs,
  serviceCeilingFt,
  typicalPassengers,
  maxPassengers,
  rangeKm,
}: SpecificationsListProps) {
  const { colors, fontSize, fontFamily, spacing } = useTheme();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <GlassCard style={{ marginBottom: spacing.md }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: fontSize.body,
          fontFamily: fontFamily.semibold,
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {children}
    </GlassCard>
  );

  return (
    <View>
      <Section title="Rendimiento">
        <SpecRow label="Alcance" value={rangeKm ? `${rangeKm.toLocaleString()} km` : '—'} />
        <SpecRow
          label="Techo de servicio"
          value={
            serviceCeilingFt
              ? `${serviceCeilingFt.toLocaleString()} ft`
              : formatVal(specs?.serviceCeilingM) + (specs?.serviceCeilingM ? ' m' : '')
          }
        />
        <SpecRow label="Vel. máxima" value={formatVal(specs?.maxSpeedKmh) + (specs?.maxSpeedKmh ? ' km/h' : '')} />
      </Section>
      <Section title="Capacidad">
        <SpecRow label="Pasajeros típicos" value={formatVal(typicalPassengers ?? specs?.economyClassSeats)} />
        <SpecRow label="Pasajeros máx." value={formatVal(maxPassengers)} />
        <SpecRow label="Carga (m³)" value={formatVal(specs?.cargoVolumeM3)} />
      </Section>
      <Section title="Dimensiones">
        <SpecRow label="Envergadura" value={formatVal(specs?.wingspanM) + (specs?.wingspanM ? ' m' : '')} />
        <SpecRow label="Longitud" value={formatVal(specs?.lengthM) + (specs?.lengthM ? ' m' : '')} />
        <SpecRow label="MTOW" value={formatVal(specs?.maxTakeoffWeightKg) + (specs?.maxTakeoffWeightKg ? ' kg' : '')} />
      </Section>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
