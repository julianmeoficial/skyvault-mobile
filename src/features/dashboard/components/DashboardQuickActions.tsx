import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { QuickActionTile } from './QuickActionTile';
import { useTheme } from '../../../theme';

interface DashboardQuickActionsProps {
  showAdminLinks?: boolean;
  showModeration?: boolean;
  showNewUpdate?: boolean;
}

export function DashboardQuickActions({
  showAdminLinks = false,
  showModeration = false,
  showNewUpdate = false,
}: DashboardQuickActionsProps) {
  const router = useRouter();
  const { spacing } = useTheme();

  return (
    <View style={[styles.row, { gap: spacing.sm, marginTop: spacing.md }]}>
      <QuickActionTile
        title="Comparar"
        subtitle="2–3 modelos"
        onPress={() => router.push('/(tabs)/compare')}
      />
      <QuickActionTile
        title="Catálogo"
        subtitle="Buscar aeronaves"
        onPress={() => router.push('/(tabs)/search')}
      />
      <QuickActionTile
        title="Favoritos"
        onPress={() => router.push('/dashboard/favorites')}
      />
      {showNewUpdate ? (
        <QuickActionTile
          title="Nuevo reporte"
          subtitle="Incidencia / update"
          onPress={() => router.push('/dashboard/updates/new')}
        />
      ) : null}
      {showModeration ? (
        <QuickActionTile
          title="Moderar updates"
          onPress={() => router.push('/dashboard/updates')}
        />
      ) : null}
      {showAdminLinks ? (
        <>
          <QuickActionTile title="Usuarios" onPress={() => router.push('/dashboard/users')} />
          <QuickActionTile title="Aeronaves admin" onPress={() => router.push('/dashboard/aircraft')} />
          <QuickActionTile title="Configuración" onPress={() => router.push('/dashboard/settings')} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
