import { ScrollView, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../auth/hooks/useAuth';
import { useFavorites } from '../../auth/hooks/useFavorites';
import { useUserComparisonInsights } from '../hooks/useUserComparisonInsights';
import { StatCard } from '../components/StatCard';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import { GlassCard } from '../../../components/ui/GlassCard';
import { DashboardHeroHeader } from '../../../components/layout/DashboardHeroHeader';
import { dashboardCopy } from '../../../shared/copy/labels';
import { useTheme } from '../../../theme';

export function UserDashboardView() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { favorites } = useFavorites({ enabled: true });
  const { userComparisonCount, recentRows, isLoading } = useUserComparisonInsights();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgMain }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Animated.View entering={FadeInDown.springify()}>
        <DashboardHeroHeader
          title={`${dashboardCopy.user.greeting}, ${user?.username ?? 'Explorer'}`}
          subtitle={dashboardCopy.user.subtitle}
        />
      </Animated.View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <StatCard label={dashboardCopy.user.favorites.toUpperCase()} value={favorites.length} />
        <StatCard label={dashboardCopy.user.comparisons.toUpperCase()} value={isLoading ? '…' : userComparisonCount} />
      </View>

      <DashboardQuickActions showNewUpdate />

      {recentRows.length > 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold, marginBottom: spacing.sm }}>
            {dashboardCopy.user.recentComparisons}
          </Text>
          {recentRows.slice(0, 3).map((row, i) => (
            <Pressable
              key={row.id}
              onPress={() => router.push(`/(tabs)/compare?ids=${row.ids.join(',')}`)}
            >
              <GlassCard style={{ marginBottom: spacing.sm }}>
                <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.medium }}>{row.aircraftLabel}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginTop: 4 }}>{row.date}</Text>
              </GlassCard>
            </Pressable>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
