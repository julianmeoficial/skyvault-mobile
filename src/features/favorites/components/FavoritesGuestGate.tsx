import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Button } from '../../../components/ui/Button';
import { LiquidGlassSurface } from '../../../components/ui/liquid-glass/LiquidGlassSurface';
import { useTheme } from '../../../theme';

export function FavoritesGuestGate() {
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain, padding: spacing.lg, justifyContent: 'center' }}>
      <LiquidGlassSurface borderRadius={24}>
        <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
          <Heart color={colors.primary} size={48} />
        </View>
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: fontFamily.bold,
            fontSize: fontSize.h5,
            textAlign: 'center',
          }}
        >
          Tus favoritos
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fontSize.bodySmall,
            textAlign: 'center',
            marginTop: spacing.sm,
            lineHeight: 22,
          }}
        >
          Inicia sesión para guardar aeronaves y verlas aquí cuando quieras.
        </Text>
        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <Button title="Iniciar sesión" onPress={() => router.push('/(auth)/login')} />
          <Button title="Crear cuenta" variant="secondary" onPress={() => router.push('/(auth)/register')} />
        </View>
      </LiquidGlassSurface>
    </View>
  );
}
