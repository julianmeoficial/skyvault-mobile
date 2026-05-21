import { View } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { NotificationBell } from '../../features/notifications/components/NotificationBell';

export function TabHeaderRight() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <NotificationBell />
    </View>
  );
}
