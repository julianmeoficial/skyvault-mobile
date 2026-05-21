import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import { useTheme } from '../../src/theme';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
import { Badge } from '../../src/components/ui/Badge';
import { userService } from '../../src/features/auth/services/userService';

function roleLabel(role: string): string {
  if (role === 'ROLE_ADMIN') return 'Administrador';
  if (role === 'ROLE_MODERATOR') return 'Moderador';
  return 'Usuario';
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const { colors, spacing, fontSize, fontFamily, toggleScheme, scheme } = useTheme();
  const [profileLoading, setProfileLoading] = useState(false);
  const profileSyncedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      profileSyncedRef.current = false;
      return;
    }
    if (profileSyncedRef.current) return;
    profileSyncedRef.current = true;
    (async () => {
      try {
        setProfileLoading(true);
        const profile = await userService.getProfile();
        setUser(profile);
      } finally {
        setProfileLoading(false);
      }
    })();
  }, [setUser, user]);

  const handleLogout = async () => {
    await logout();
    router.replace('/welcome');
  };

  if (!isHydrated) {
    return <View style={{ flex: 1, backgroundColor: colors.bgMain }} />;
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgMain, padding: spacing.lg }]}>
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: fontSize.h3,
            fontFamily: fontFamily.semibold,
            textAlign: 'center',
          }}
        >
          Tu cuenta
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: 'center', marginVertical: spacing.lg }}>
          Inicia sesión para favoritos, dashboard y comparaciones guardadas.
        </Text>
        <Button title="Iniciar sesión" onPress={() => router.push('/(auth)/login')} />
        <View style={{ height: spacing.sm }} />
        <Button
          title="Ver SkyVault en Inicio"
          onPress={() => router.push('/(tabs)')}
          variant="ghost"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgMain }}
      contentContainerStyle={[styles.container, { padding: spacing.lg }]}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: colors.primary + '33', borderColor: colors.primary },
        ]}
      >
        <Text style={{ color: colors.primary, fontSize: 32, fontFamily: fontFamily.bold }}>
          {user.username.charAt(0).toUpperCase()}
        </Text>
      </View>

      <Text
        style={{
          color: colors.textPrimary,
          fontSize: fontSize.h3,
          fontFamily: fontFamily.semibold,
          marginTop: spacing.md,
        }}
      >
        {user.fullName ?? user.username}
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>{user.email}</Text>
      <Badge label={roleLabel(user.role)} />

      <GlassCard style={{ marginTop: spacing.xl, width: '100%' }}>
        <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>
          Cuenta {user.enabled ? 'activa' : 'inactiva'}
          {profileLoading ? ' · actualizando…' : ''}
        </Text>
        <Button
          title="Editar perfil"
          onPress={() => router.push('/dashboard/profile')}
          variant="ghost"
        />
        <View style={{ height: spacing.sm }} />
        <Button
          title={`Tema: ${scheme === 'dark' ? 'Oscuro' : 'Claro'}`}
          onPress={toggleScheme}
          variant="ghost"
        />
        <View style={{ height: spacing.sm }} />
        <Button title="Cerrar sesión" onPress={handleLogout} />
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
