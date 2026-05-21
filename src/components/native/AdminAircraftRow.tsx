import { memo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../ui/GlassCard';
import { Badge } from '../ui/Badge';
import { AircraftThumbnail } from '../media/AircraftThumbnail';
import { useTheme } from '../../theme';
import type { AircraftCardDto } from '../../shared/types/aircraft.types';

interface AdminAircraftRowProps {
  aircraft: AircraftCardDto;
  onPress: () => void;
}

function AdminAircraftRowInner({ aircraft, onPress }: AdminAircraftRowProps) {
  const router = useRouter();
  const { colors, fontSize, fontFamily, spacing } = useTheme();

  const imageUri =
    aircraft.thumbnailUrl ?? (aircraft as { mainImageUrl?: string }).mainImageUrl;

  const openCatalog = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/aircraft/${aircraft.id}`);
  };

  return (
    <GlassCard style={{ marginBottom: spacing.sm }}>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${aircraft.displayName ?? aircraft.name}`}
      >
        <View style={styles.row}>
          <View style={styles.thumbWrap}>
            <AircraftThumbnail uri={imageUri} size={88} borderRadius={8} />
          </View>
          <View style={styles.body}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: fontSize.h6,
                fontFamily: fontFamily.semibold,
              }}
              numberOfLines={2}
            >
              {aircraft.displayName ?? aircraft.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: fontSize.bodySmall, marginTop: 4 }}>
              {aircraft.manufacturer?.name}
              {aircraft.family?.name ? ` · ${aircraft.family.name}` : ''}
            </Text>
            {aircraft.rangeKm ? (
              <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 2 }}>
                {aircraft.rangeKm.toLocaleString()} km
              </Text>
            ) : null}
            {aircraft.productionState?.name ? (
              <View style={{ marginTop: spacing.xs, alignSelf: 'flex-start' }}>
                <Badge label={aircraft.productionState.name} />
              </View>
            ) : null}
            {aircraft.isActive === false ? (
              <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 4 }}>
                Inactiva
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
      <Pressable
        onPress={openCatalog}
        style={[styles.catalogLink, { borderTopColor: colors.border }]}
        hitSlop={8}
        accessibilityLabel="Ver en catálogo"
      >
        <ExternalLink color={colors.primary} size={16} />
        <Text style={{ color: colors.primary, fontSize: fontSize.caption, marginLeft: 6 }}>
          Ver en catálogo
        </Text>
      </Pressable>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumbWrap: {
    width: 88,
    height: 88,
    flexShrink: 0,
    overflow: 'hidden',
  },
  body: { flex: 1, justifyContent: 'center' },
  catalogLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

export const AdminAircraftRow = memo(AdminAircraftRowInner);
