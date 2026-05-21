import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { AdminStatsScreen } from '../../src/features/statistics/components/AdminStatsScreen';
import { FavoritesTabView } from '../../src/features/favorites/components/FavoritesTabView';
import { FavoritesGuestGate } from '../../src/features/favorites/components/FavoritesGuestGate';

export default function StatsTabScreen() {
  const { user, isAdmin } = useAuth();

  if (!user) return <FavoritesGuestGate />;
  if (isAdmin) return <AdminStatsScreen />;
  return <FavoritesTabView />;
}
