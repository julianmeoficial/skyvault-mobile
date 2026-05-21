import { ScrollView, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAircraftDetail } from '../../src/features/aircraft/hooks/useAircraftDetail';
import { HeroImage } from '../../src/components/native/HeroImage';
import { AircraftOverviewSection } from '../../src/components/native/AircraftOverviewSection';
import { AircraftSpecsTabs } from '../../src/components/native/AircraftSpecsTabs';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { EmptyState } from '../../src/components/native/EmptyState';
import { Badge } from '../../src/components/ui/Badge';
import { FavoriteToggle } from '../../src/features/auth/components/FavoriteToggle';
import { useTheme } from '../../src/theme';

export default function AircraftDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { aircraft, isLoading, error, reload } = useAircraftDetail(id);

  const primaryImage =
    aircraft?.images?.find((i) => i.isPrimary)?.url ??
    aircraft?.images?.[0]?.url;

  if (isLoading) return <SkeletonLoader count={2} />;

  if (error || !aircraft) {
    return (
      <EmptyState title="Aeronave" message={error ?? 'No encontrada'} actionLabel="Reintentar" onAction={reload} />
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: aircraft.displayName ?? aircraft.name }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <HeroImage uri={primaryImage} />
        <View style={{ padding: spacing.md }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: fontSize.h3,
              fontFamily: fontFamily.bold,
            }}
          >
            {aircraft.displayName}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs, gap: 4 }}>
            {aircraft.manufacturer?.id ? (
              <Pressable onPress={() => router.push(`/manufacturers/${aircraft.manufacturer!.id}`)}>
                <Text style={{ color: colors.textSecondary }}>{aircraft.manufacturer.name}</Text>
              </Pressable>
            ) : null}
            {aircraft.family?.id ? (
              <>
                <Text style={{ color: colors.textMuted }}>·</Text>
                <Pressable onPress={() => router.push(`/families/${aircraft.family!.id}`)}>
                  <Text style={{ color: colors.primary }}>{aircraft.family.name}</Text>
                </Pressable>
              </>
            ) : null}
          </View>
          <View style={{ marginTop: spacing.md }}>
            <FavoriteToggle aircraftId={aircraft.id} variant="surface" />
          </View>
          {aircraft.productionState?.name ? (
            <View style={{ marginTop: spacing.sm }}>
              <Badge label={aircraft.productionState.name} />
            </View>
          ) : null}

          <AircraftOverviewSection aircraft={aircraft} />
          <AircraftSpecsTabs aircraft={aircraft} />
        </View>
      </ScrollView>
    </>
  );
}
