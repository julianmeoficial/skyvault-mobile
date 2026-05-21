import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { useTheme } from '../../src/theme';

export default function DashboardLayout() {
  const { user, isHydrated } = useAuth();
  const { colors } = useTheme();

  if (!isHydrated) return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bgMain },
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.bgMain },
      }}
    >
      <Stack.Screen name="favorites" options={{ title: 'Favoritos' }} />
      <Stack.Screen name="comparisons" options={{ title: 'Comparaciones' }} />
      <Stack.Screen name="profile" options={{ title: 'Editar perfil' }} />
      <Stack.Screen name="updates" options={{ title: 'Actualizaciones' }} />
      <Stack.Screen name="users" options={{ title: 'Usuarios' }} />
      <Stack.Screen name="aircraft" options={{ title: 'Aeronaves (admin)' }} />
      <Stack.Screen name="aircraft-form" options={{ title: 'Formulario aeronave' }} />
      <Stack.Screen name="updates/new" options={{ title: 'Nuevo reporte' }} />
      <Stack.Screen name="settings" options={{ title: 'Configuración' }} />
    </Stack>
  );
}
