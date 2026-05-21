import { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/stores/authStore';
import { useTheme } from '../../src/theme';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { getAuthErrorMessage } from '../../src/shared/utils/errorMessages';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { colors, fontSize, fontFamily, spacing } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Completa correo y contraseña.');
      return;
    }
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)/');
    } catch (err) {
      setError(getAuthErrorMessage(err, 'login'));
    }
  };

  return (
    <LinearGradient
      colors={[colors.bgMain, colors.accentLighter, colors.bgMain]}
      style={styles.flex}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { padding: spacing.lg }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: fontSize.h2,
              fontFamily: fontFamily.bold,
              marginBottom: spacing.xs,
            }}
          >
            SkyVault
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: fontSize.body,
              marginBottom: spacing.xl,
            }}
          >
            Inicia sesión para explorar el catálogo
          </Text>

          <GlassCard>
            <Input
              label="Correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            {error ? (
              <Text style={{ color: colors.error, marginBottom: spacing.md }}>{error}</Text>
            ) : null}
            <Button title="Iniciar sesión" onPress={handleLogin} loading={isLoading} />
          </GlassCard>

          <Text style={{ textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted }}>
            ¿No tienes cuenta?{' '}
            <Link href="/(auth)/register" style={{ color: colors.primary }}>
              Regístrate
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center' },
});
