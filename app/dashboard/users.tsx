import { useState } from 'react';
import { FlatList, View, Text, Pressable } from 'react-native';
import { RequireRole } from '../../src/features/auth/components/RequireRole';
import { useAdminUsers } from '../../src/features/admin/hooks/useAdminUsers';
import type { AdminUserDto } from '../../src/features/admin/types/admin.types';
import { UserEditModal } from '../../src/features/admin/components/UserEditModal';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Badge } from '../../src/components/ui/Badge';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { useTheme } from '../../src/theme';
import { FLAT_LIST_PERF } from '../../src/shared/constants/flatListPerf';

export default function DashboardUsersScreen() {
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const { users, isLoading, isRefreshing, error, refetch } = useAdminUsers(0, 50);

  const [editUser, setEditUser] = useState<AdminUserDto | null>(null);

  if (isLoading && users.length === 0) return <SkeletonLoader />;

  return (
    <RequireRole roles={['ROLE_ADMIN']}>
      <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: spacing.md }}
          onRefresh={() => void refetch()}
          refreshing={isRefreshing}
          ListHeaderComponent={
            error ? (
              <Text style={{ color: colors.error, marginBottom: spacing.sm }}>{error}</Text>
            ) : null
          }
          ListEmptyComponent={
            <Text style={{ color: colors.textMuted, textAlign: 'center' }}>Sin usuarios</Text>
          }
          {...FLAT_LIST_PERF}
        renderItem={({ item }) => (
            <Pressable onPress={() => setEditUser(item)}>
              <GlassCard style={{ marginBottom: spacing.sm }}>
                <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>
                  {item.username}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>{item.email}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.xs }}>
                  <Badge label={item.role.replace('ROLE_', '')} />
                  <Badge label={item.enabled ? 'Activo' : 'Inactivo'} />
                </View>
              </GlassCard>
            </Pressable>
          )}
        />
        <UserEditModal
          user={editUser}
          visible={editUser != null}
          onClose={() => setEditUser(null)}
          onMutated={() => void refetch()}
        />
      </View>
    </RequireRole>
  );
}
