import { FlatList, View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFamilyDetail } from '../../src/features/families/hooks/useFamilyDetail';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { EmptyState } from '../../src/components/native/EmptyState';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Badge } from '../../src/components/ui/Badge';
import { useTheme } from '../../src/theme';
import type { FamilyAircraftCardDto } from '../../src/features/families/types/family.types';

export default function FamilyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const familyId = Number(id);
  const { family, aircraft, isLoading, error, reload } = useFamilyDetail(familyId);

  if (isLoading) return <SkeletonLoader />;

  if (error || !family) {
    return <EmptyState title="Familia" message={error ?? 'No encontrada'} actionLabel="Reintentar" onAction={reload} />;
  }

  const renderAircraft = ({ item, index }: { item: FamilyAircraftCardDto; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <Pressable onPress={() => router.push(`/aircraft/${item.id}`)}>
        <GlassCard style={{ marginBottom: spacing.sm }}>
          <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>{item.name}</Text>
          <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
            {item.category} · {item.productionState}
          </Text>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );

  return (
    <>
      <Stack.Screen options={{ title: family.name }} />
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <FlatList
          data={aircraft}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md }}
          ListHeaderComponent={
            <Animated.View entering={FadeInDown.springify()}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: fontSize.h3,
                  fontFamily: fontFamily.bold,
                  marginBottom: spacing.sm,
                }}
              >
                {family.name}
              </Text>
              <Badge label={family.category} />
              <Text style={{ color: colors.textMuted, marginTop: spacing.md, lineHeight: 22 }}>
                {family.description}
              </Text>
              <Pressable
                onPress={() => router.push(`/manufacturers/${family.manufacturer.id}`)}
                style={{ marginTop: spacing.sm }}
              >
                <Text style={{ color: colors.primary, fontFamily: fontFamily.medium }}>
                  {family.manufacturer.name}
                </Text>
              </Pressable>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: fontFamily.semibold,
                  marginTop: spacing.lg,
                  marginBottom: spacing.sm,
                }}
              >
                Aeronaves ({aircraft.length})
              </Text>
            </Animated.View>
          }
          ListEmptyComponent={<EmptyState title="Sin aeronaves" />}
          renderItem={renderAircraft}
        />
      </View>
    </>
  );
}
