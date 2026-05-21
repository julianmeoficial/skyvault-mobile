import { useEffect, useState } from 'react';
import { FlatList, View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { aircraftService } from '../../src/features/aircraft/services/aircraftService';
import { AircraftCard } from '../../src/components/native/AircraftCard';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { EmptyState } from '../../src/components/native/EmptyState';
import { getUserFriendlyError } from '../../src/shared/utils/errorMessages';
import type { AircraftCardDto } from '../../src/shared/types/aircraft.types';
import { useTheme } from '../../src/theme';

export default function ManufacturerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const [aircraft, setAircraft] = useState<AircraftCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const manufacturerId = Number(id);

  useEffect(() => {
    if (!manufacturerId) return;
    (async () => {
      try {
        setIsLoading(true);
        const data = await aircraftService.getAircraftByManufacturer(manufacturerId);
        setAircraft(data);
      } catch (err) {
        setError(getUserFriendlyError(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [manufacturerId]);

  if (isLoading) return <SkeletonLoader />;

  if (error) {
    return <EmptyState title="Fabricante" message={error} />;
  }

  return (
    <>
      <Stack.Screen options={{ title: `Fabricante #${id}` }} />
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <FlatList
          data={aircraft}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md }}
          ListEmptyComponent={<EmptyState title="Sin aeronaves" />}
          renderItem={({ item }) => <AircraftCard aircraft={item} />}
        />
      </View>
    </>
  );
}
