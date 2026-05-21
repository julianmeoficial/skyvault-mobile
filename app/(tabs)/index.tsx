import { View } from 'react-native';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { GuestHubView } from '../../src/features/home/components/GuestHubView';
import { UserDashboardView } from '../../src/features/dashboard/views/UserDashboardView';
import { AdminDashboardView } from '../../src/features/dashboard/views/AdminDashboardView';
import { ModeratorDashboardView } from '../../src/features/dashboard/views/ModeratorDashboardView';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { useTheme } from '../../src/theme';

export default function HomeScreen() {
  const { user, isHydrated, isAdmin, isModerator } = useAuth();
  const { colors } = useTheme();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgMain, padding: 16 }}>
        <SkeletonLoader count={4} />
      </View>
    );
  }

  if (!user) {
    return <GuestHubView />;
  }

  if (isAdmin) {
    return <AdminDashboardView />;
  }

  if (isModerator) {
    return <ModeratorDashboardView />;
  }

  return <UserDashboardView />;
}
