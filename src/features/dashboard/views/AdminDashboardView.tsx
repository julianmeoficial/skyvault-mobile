import { ScrollView, Text, View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../../auth/hooks/useAuth';
import { useAdminStats } from '../hooks/useAdminStats';
import { StatCard } from '../components/StatCard';
import { DashboardQuickActions } from '../components/DashboardQuickActions';
import { GlassCard } from '../../../components/ui/GlassCard';
import { DashboardHeroHeader } from '../../../components/layout/DashboardHeroHeader';
import { dashboardCopy } from '../../../shared/copy/labels';
import { useTheme } from '../../../theme';
import { dashboardAdminService } from '../services/dashboardAdminService';
import { useEffect, useState } from 'react';
import type { AdminActivityItem } from '../types/dashboard.types';

export function AdminDashboardView() {
  const { user } = useAuth();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { stats, isLoading, error, refetch } = useAdminStats();
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);

  useEffect(() => {
    void dashboardAdminService.fetchRecentActivity(5).then(setActivity).catch(() => setActivity([]));
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgMain }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Animated.View entering={FadeInDown.springify()}>
        <DashboardHeroHeader
          title={dashboardCopy.admin.greeting}
          subtitle={`${user?.username ?? ''} · ${dashboardCopy.admin.subtitle}`}
        />
      </Animated.View>

      {error ? (
        <Pressable onPress={() => void refetch()}>
          <Text style={{ color: colors.error, marginBottom: spacing.md }}>{error} — Toca para reintentar</Text>
        </Pressable>
      ) : null}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <StatCard label="AERONAVES" value={isLoading ? '…' : (stats?.totalAircraft ?? '—')} />
        <StatCard label="USUARIOS" value={isLoading ? '…' : (stats?.registeredUsers ?? '—')} />
        <StatCard
          label="INCIDENCIAS"
          value={isLoading ? '…' : (stats?.openIncidents ?? 0)}
          accentColor={colors.error}
        />
        <StatCard
          label="UPDATES PEND."
          value={isLoading ? '…' : (stats?.pendingUpdates ?? 0)}
        />
      </View>

      <DashboardQuickActions showAdminLinks showModeration />

      {activity.length > 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold, marginBottom: spacing.sm }}>
            Actividad reciente
          </Text>
          {activity.map((item) => (
            <GlassCard key={item.id} style={{ marginBottom: spacing.sm }}>
              <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.medium }}>{item.action}</Text>
              <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                {item.username} · {item.timeAgo}
              </Text>
            </GlassCard>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}
