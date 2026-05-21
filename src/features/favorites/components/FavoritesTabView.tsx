import { useMemo, useCallback } from 'react';
import { FlatList, View, Text, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../auth/hooks/useFavorites';
import { CatalogAircraftCard } from '../../../components/native/CatalogAircraftCard';
import { EmptyState } from '../../../components/native/EmptyState';
import { SkeletonLoader } from '../../../components/native/SkeletonLoader';
import { FLAT_LIST_PERF } from '../../../shared/constants/flatListPerf';
import { useTheme } from '../../../theme';
import type { AircraftCardDto } from '../../../shared/types/aircraft.types';

export function FavoritesTabView() {
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { favorites, isLoading, isRefreshing, error, refetch } = useFavorites({ enabled: true });

  const cards = useMemo(
    (): AircraftCardDto[] =>
      favorites.map((f) => ({
        id: f.id,
        name: f.aircraftName ?? f.model,
        model: f.model,
        displayName: f.aircraftName ?? f.model,
        thumbnailUrl: f.thumbnailUrl,
        manufacturer: { id: 0, name: f.manufacturer },
        family: { id: 0, name: '' },
        rangeKm: undefined,
      })),
    [favorites],
  );

  const renderItem = useCallback(
    ({ item }: { item: AircraftCardDto }) => (
      <View style={{ minHeight: 140 }}>
        <CatalogAircraftCard aircraft={item} />
      </View>
    ),
    [],
  );

  if (isLoading && cards.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgMain, padding: spacing.lg }}>
        <SkeletonLoader count={3} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.h4, fontFamily: fontFamily.bold }}>
          Mis favoritos
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.bodySmall, marginTop: spacing.xs }}>
          {cards.length > 0
            ? `${cards.length} aeronave${cards.length === 1 ? '' : 's'} guardada${cards.length === 1 ? '' : 's'}`
            : 'Guarda modelos desde el catálogo'}
        </Text>
      </View>
      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin favoritos"
            message={error ?? 'Explora el catálogo y pulsa el corazón en una aeronave.'}
            actionLabel="Ir al catálogo"
            onAction={() => router.push('/(tabs)/search')}
          />
        }
        renderItem={renderItem}
        {...FLAT_LIST_PERF}
      />
    </View>
  );
}
