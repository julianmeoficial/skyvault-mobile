import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFavorites } from '../../src/features/auth/hooks/useFavorites';
import { AircraftCard } from '../../src/components/native/AircraftCard';
import { EmptyState } from '../../src/components/native/EmptyState';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { useTheme } from '../../src/theme';
import type { AircraftCardDto } from '../../src/shared/types/aircraft.types';

export default function DashboardFavoritesScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const { favorites, isLoading, error, refetch } = useFavorites({ enabled: true });

  const cards: AircraftCardDto[] = favorites.map((f) => ({
    id: f.id,
    name: f.aircraftName ?? f.model,
    model: f.model,
    displayName: f.aircraftName ?? f.model,
    thumbnailUrl: f.thumbnailUrl,
    manufacturer: { id: 0, name: f.manufacturer },
    family: { id: 0, name: '' },
  }));

  if (isLoading) return <SkeletonLoader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.md }}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <EmptyState
            title="Sin favoritos"
            message={error ?? 'Explora el catálogo y guarda aeronaves.'}
            actionLabel="Ir al catálogo"
            onAction={() => router.push('/(tabs)/search')}
          />
        }
        renderItem={({ item }) => <AircraftCard aircraft={item} />}
      />
    </View>
  );
}
