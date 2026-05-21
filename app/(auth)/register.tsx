import { useState, useCallback } from 'react';
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

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const { colors, fontSize, fontFamily, spacing } = useTheme();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const next: Record<string, string> = {};
    if (!USERNAME_REGEX.test(username)) {
      next.username = 'Entre 3 y 20 caracteres: letras, números o guión bajo.';
    }
    if (!EMAIL_REGEX.test(email)) {
      next.email = 'Ingresa un correo válido.';
    }
    if (password.length < 8) {
      next.password = 'Mínimo 8 caracteres.';
    } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      next.password = 'Incluye al menos una mayúscula y un número.';
    }
    if (password !== confirmPassword) {
      next.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [username, email, password, confirmPassword]);

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register(username.trim(), email.trim(), password);
      router.replace('/(tabs)/');
    } catch (err) {
      setErrors({ general: getAuthErrorMessage(err, 'register') });
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
            Crear cuenta
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: spacing.xl }}>
            Únete y explora el catálogo de aeronaves
          </Text>

          <GlassCard>
            <Input label="Usuario" value={username} onChangeText={setUsername} error={errors.username} />
            <Input
              label="Correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />
            <Input
              label="Confirmar contraseña"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />
            {errors.general ? (
              <Text style={{ color: colors.error, marginBottom: spacing.md }}>{errors.general}</Text>
            ) : null}
            <Button title="Crear cuenta" onPress={handleRegister} loading={isLoading} />
          </GlassCard>

          <Text style={{ textAlign: 'center', marginTop: spacing.lg, color: colors.textMuted }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/(auth)/login" style={{ color: colors.primary }}>
              Inicia sesión
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
