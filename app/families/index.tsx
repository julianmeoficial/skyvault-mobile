import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { familyService } from '../../src/features/families/services/familyService';
import type { FamilyDto } from '../../src/features/families/types/family.types';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { EmptyState } from '../../src/components/native/EmptyState';
import { useTheme } from '../../src/theme';
import { getUserFriendlyError } from '../../src/shared/utils/errorMessages';

export default function FamiliesIndexScreen() {
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const [families, setFamilies] = useState<FamilyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await familyService.getAllFamilies({ page: 0, size: 50 });
        setFamilies(res.content);
      } catch (err) {
        setError(getUserFriendlyError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <SkeletonLoader />;

  return (
    <>
      <Stack.Screen options={{ title: 'Familias' }} />
      <FlatList
        data={families}
        keyExtractor={(item) => String(item.id)}
        style={{ flex: 1, backgroundColor: colors.bgMain }}
        contentContainerStyle={{ padding: spacing.md }}
        ListEmptyComponent={<EmptyState title="Familias" message={error ?? 'Sin datos'} />}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
            <Pressable onPress={() => router.push(`/families/${item.id}`)}>
              <GlassCard style={{ marginBottom: spacing.sm }}>
                <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>
                  {item.name}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                  {item.manufacturer.name} · {item.category} · {item.activeModelCount} modelos
                </Text>
              </GlassCard>
            </Pressable>
          </Animated.View>
        )}
      />
    </>
  );
}
