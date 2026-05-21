import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { aircraftService } from '../../src/features/aircraft/services/aircraftService';
import type { ManufacturerSummaryDto } from '../../src/shared/types/aircraft.types';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { useTheme } from '../../src/theme';

export default function ManufacturersIndexScreen() {
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const [list, setList] = useState<ManufacturerSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void aircraftService.getManufacturers().then((data) => {
      setList(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <>
      <Stack.Screen options={{ title: 'Fabricantes' }} />
      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <Pressable onPress={() => router.push(`/manufacturers/${item.id}`)}>
              <GlassCard style={{ marginBottom: spacing.sm }}>
                <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
                  {item.country} · {item.aircraftCount ?? '—'} modelos
                </Text>
              </GlassCard>
            </Pressable>
          </Animated.View>
        )}
      />
    </>
  );
}
