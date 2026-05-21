import { View, Text } from 'react-native';
import type { AircraftDetailDto } from '../../shared/types/aircraft.types';
import { GlassCard } from '../ui/GlassCard';
import { useTheme } from '../../theme';

interface AircraftOverviewSectionProps {
  aircraft: AircraftDetailDto;
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors, fontFamily } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: colors.textMuted, fontFamily: fontFamily.regular }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>{value}</Text>
    </View>
  );
}

export function AircraftOverviewSection({ aircraft }: AircraftOverviewSectionProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const specs = aircraft.specifications;

  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={{ color: colors.textPrimary, fontSize: fontSize.h5, fontFamily: fontFamily.bold, marginBottom: spacing.sm }}>
        Resumen
      </Text>
      <GlassCard>
        <Row label="Año introducción" value={aircraft.introductionYear ? String(aircraft.introductionYear) : '—'} />
        <Row label="Fabricante" value={aircraft.manufacturer?.name ?? '—'} />
        <Row label="Familia" value={aircraft.family?.name ?? '—'} />
        <Row label="Tipo" value={aircraft.type?.name ?? '—'} />
        <Row label="Estado producción" value={aircraft.productionState?.name ?? '—'} />
        <Row label="Categoría tamaño" value={aircraft.sizeCategory?.name ?? '—'} />
        <Row
          label="Pasajeros"
          value={`${aircraft.typicalPassengers ?? '—'} / ${aircraft.maxPassengers ?? '—'}`}
        />
        <Row label="Alcance" value={aircraft.rangeKm ? `${aircraft.rangeKm.toLocaleString()} km` : '—'} />
        <Row
          label="Motor"
          value={
            specs?.engineManufacturer || specs?.engineModel
              ? `${specs?.engineManufacturer ?? ''} ${specs?.engineModel ?? ''}`.trim()
              : '—'
          }
        />
        {aircraft.description ? (
          <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, fontFamily: fontFamily.regular }}>
            {aircraft.description}
          </Text>
        ) : null}
      </GlassCard>
    </View>
  );
}
