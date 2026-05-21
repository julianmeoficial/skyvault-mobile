import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { useUserComparisonInsights } from '../../src/features/dashboard/hooks/useUserComparisonInsights';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { EmptyState } from '../../src/components/native/EmptyState';
import { useTheme } from '../../src/theme';

export default function DashboardComparisonsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { recentRows, isLoading } = useUserComparisonInsights();

  if (!user) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain, padding: spacing.md }}>
      <FlatList
        data={recentRows}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="Sin comparaciones"
              message="Compara 2 o 3 aeronaves desde la pestaña Comparar."
              actionLabel="Comparar"
              onAction={() => router.push('/(tabs)/compare')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(tabs)/compare?ids=${item.ids.join(',')}`)}>
            <GlassCard style={{ marginBottom: spacing.sm }}>
              <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>
                {item.aircraftLabel}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 4 }}>
                {item.date}
              </Text>
            </GlassCard>
          </Pressable>
        )}
      />
    </View>
  );
}
