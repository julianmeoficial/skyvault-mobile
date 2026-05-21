import { Stack, Redirect } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useTheme } from '../../src/theme';

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);
  const { colors } = useTheme();

  if (user) {
    return <Redirect href="/(tabs)/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bgMain },
      }}
    />
  );
}
