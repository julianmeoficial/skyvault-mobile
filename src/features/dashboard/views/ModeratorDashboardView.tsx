import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAdminStats } from '../hooks/useAdminStats';
import { StatCard } from '../components/StatCard';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import { DashboardHeroHeader } from '../../../components/layout/DashboardHeroHeader';
import { dashboardCopy } from '../../../shared/copy/labels';
import { useTheme } from '../../../theme';

export function ModeratorDashboardView() {
  const { user } = useAuth();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { stats, isLoading } = useAdminStats();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgMain }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Animated.View entering={FadeInDown.springify()}>
        <DashboardHeroHeader
          title={dashboardCopy.moderator.greeting}
          subtitle={`${user?.username ?? ''} — ${dashboardCopy.moderator.subtitle}`}
        />
      </Animated.View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <StatCard
          label="UPDATES PENDIENTES"
          value={isLoading ? '…' : (stats?.pendingUpdates ?? 0)}
        />
        <StatCard label="INCIDENCIAS" value={isLoading ? '…' : (stats?.openIncidents ?? 0)} />
      </View>

      <DashboardQuickActions showModeration />
    </ScrollView>
  );
}
