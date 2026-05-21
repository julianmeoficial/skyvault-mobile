import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SkyVaultLogo } from '../src/components/native/SkyVaultLogo';
import { Button } from '../src/components/ui/Button';
import { GlassCard } from '../src/components/ui/GlassCard';
import { useTheme } from '../src/theme';
import { useWelcomeMotion } from '../src/features/welcome/hooks/useWelcomeMotion';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { heroEntering, stagger } = useWelcomeMotion();

  const onExplore = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)');
  };

  const onLogin = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/login');
  };

  const onRegister = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(auth)/register');
  };

  return (
    <LinearGradient
      colors={[colors.accentLighter, colors.bgMain, colors.bgSection]}
      locations={[0, 0.45, 1]}
      style={styles.fill}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={heroEntering} style={styles.hero}>
          <Animated.View entering={stagger(80)}>
            <SkyVaultLogo size={108} />
          </Animated.View>

          <Animated.View entering={stagger(160)}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.textPrimary,
                  fontSize: fontSize.h2,
                  fontFamily: fontFamily.bold,
                  marginTop: spacing.lg,
                },
              ]}
            >
              Compara 36 modelos{'\n'}de aviación comercial
            </Text>
          </Animated.View>

          <Animated.View entering={stagger(240)}>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: fontSize.body,
                fontFamily: fontFamily.medium,
                marginTop: spacing.sm,
                textAlign: 'center',
                lineHeight: 24,
              }}
            >
              Airbus vs Boeing — Especificaciones, rendimiento y análisis detallado
            </Text>
          </Animated.View>

          <Animated.View entering={stagger(320)} style={{ width: '100%', marginTop: spacing.xl }}>
            <Button title="Explorar catálogo" onPress={onExplore} />
            <View style={{ height: spacing.sm }} />
            <Button title="Iniciar sesión" onPress={onLogin} variant="ghost" />
            <View style={{ height: spacing.sm }} />
            <Pressable onPress={onRegister} accessibilityRole="button">
              <Text
                style={{
                  color: colors.primary,
                  textAlign: 'center',
                  fontFamily: fontFamily.semibold,
                  fontSize: fontSize.body,
                }}
              >
                Crear cuenta
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={stagger(400)}>
          <GlassCard style={{ marginTop: spacing.xl }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: fontSize.h4,
                fontFamily: fontFamily.semibold,
                marginBottom: spacing.sm,
              }}
            >
              La plataforma definitiva para comparar aeronaves comerciales
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fontSize.body,
                fontFamily: fontFamily.regular,
                lineHeight: 22,
              }}
            >
              SkyVault te proporciona acceso instantáneo a especificaciones técnicas, datos de
              rendimiento y características de diseño de los modelos más importantes de Airbus y
              Boeing. Toma decisiones informadas con información precisa y actualizada.
            </Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={stagger(480)}>
          <View style={[styles.statsRow, { marginTop: spacing.lg, gap: spacing.md }]}>
            {[
              { value: '36', label: 'Modelos' },
              { value: '2', label: 'Fabricantes' },
              { value: '100%', label: 'Datos verificados' },
            ].map((stat) => (
              <GlassCard key={stat.label} style={styles.statCard}>
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: fontSize.h3,
                    fontFamily: fontFamily.bold,
                    textAlign: 'center',
                  }}
                >
                  {stat.value}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: fontSize.caption,
                    fontFamily: fontFamily.medium,
                    textAlign: 'center',
                    marginTop: spacing.xs,
                  }}
                >
                  {stat.label}
                </Text>
              </GlassCard>
            ))}
          </View>
        </Animated.View>

        <Text
          style={{
            color: colors.textMuted,
            textAlign: 'center',
            marginTop: spacing.xl,
            fontSize: fontSize.caption,
            fontFamily: fontFamily.regular,
          }}
        >
          Desliza para explorar
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hero: { alignItems: 'center' },
  title: { textAlign: 'center', lineHeight: 36 },
  statsRow: { flexDirection: 'row' },
  statCard: { flex: 1, paddingVertical: 16 },
});
