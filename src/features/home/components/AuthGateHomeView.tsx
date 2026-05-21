import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SkyVaultLogo } from '../../../components/native/SkyVaultLogo';
import { Button } from '../../../components/ui/Button';
import { GlassCard } from '../../../components/ui/GlassCard';
import { SkyVaultParticleHero } from './SkyVaultParticleHero';
import { ScrollRevealSection } from '../../../components/motion/ScrollRevealSection';
import { useTheme } from '../../../theme';
import { useStaggerEntrance } from '../../../hooks/useStaggerEntrance';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export function AuthGateHomeView() {
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { stagger, reduceMotion } = useStaggerEntrance();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const goCompare = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/compare');
  };

  return (
    <AnimatedScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: colors.bgMain }}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
    >
      <View style={{ alignItems: 'center', paddingTop: spacing.xl }}>
        <Animated.View entering={stagger(0)}>
          <SkyVaultLogo size={120} />
        </Animated.View>
        <SkyVaultParticleHero scrollY={scrollY} height={reduceMotion ? 80 : 200} />
      </View>

      <ScrollRevealSection scrollY={scrollY} sectionOffset={180} style={{ paddingHorizontal: spacing.lg }}>
        <Animated.View entering={stagger(120)}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: fontSize.h4,
              fontFamily: fontFamily.bold,
              textAlign: 'center',
            }}
          >
            Para usar SkyVault, inicia sesión
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: fontSize.body,
              fontFamily: fontFamily.regular,
              textAlign: 'center',
              marginTop: spacing.sm,
            }}
          >
            Accede a favoritos, reportes, moderación y tu panel personal.
          </Text>
        </Animated.View>
      </ScrollRevealSection>

      <Animated.View
        entering={stagger(200)}
        style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm }}
      >
        <Button title="Iniciar sesión" onPress={() => router.push('/(auth)/login')} />
        <Button
          title="Crear cuenta"
          variant="secondary"
          onPress={() => router.push('/(auth)/register')}
        />
      </Animated.View>

      <Animated.View entering={stagger(280)} style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
        <Pressable onPress={goCompare}>
          <GlassCard>
            <Text style={{ color: colors.primary, fontFamily: fontFamily.semibold, fontSize: fontSize.body }}>
              O si lo prefieres, usa solo el módulo de Comparaciones
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fontSize.caption,
                marginTop: spacing.xs,
                fontFamily: fontFamily.regular,
              }}
            >
              Compara aeronaves sin cuenta · Toca para ir a Comparar
            </Text>
          </GlassCard>
        </Pressable>
      </Animated.View>

      <Animated.View entering={stagger(360)} style={{ alignItems: 'center', marginTop: spacing.md }}>
        <Pressable onPress={() => router.push('/welcome')}>
          <Text style={{ color: colors.textSecondary, fontFamily: fontFamily.medium }}>
            Explorar SkyVault sin cuenta
          </Text>
        </Pressable>
      </Animated.View>
    </AnimatedScrollView>
  );
}
