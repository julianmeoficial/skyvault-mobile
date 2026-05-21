import { ScrollView, View, Text, Pressable } from 'react-native';
import { AircraftThumbnail } from '../../../components/media/AircraftThumbnail';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { SkyVaultLogo } from '../../../components/native/SkyVaultLogo';
import { Button } from '../../../components/ui/Button';
import { GlassCard } from '../../../components/ui/GlassCard';
import { aircraftService } from '../../aircraft/services/aircraftService';
import type { AircraftCardDto, ManufacturerSummaryDto } from '../../../shared/types/aircraft.types';
import { useTheme } from '../../../theme';
import { useStaggerEntrance } from '../../../hooks/useStaggerEntrance';
import { SkeletonLoader } from '../../../components/native/SkeletonLoader';

export function HomeMarketingView() {
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { stagger } = useStaggerEntrance();
  const [featured, setFeatured] = useState<AircraftCardDto[]>([]);
  const [manufacturers, setManufacturers] = useState<ManufacturerSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [f, m] = await Promise.all([
          aircraftService.getFeaturedAircraft(3),
          aircraftService.getManufacturers(),
        ]);
        setFeatured(f);
        setManufacturers(m.slice(0, 2));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onExplore = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/search');
  };

  return (
    <LinearGradient
      colors={[colors.accentLighter, colors.bgMain]}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xl * 2 }}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Animated.View entering={stagger(0)} style={{ alignItems: 'center' }}>
          <SkyVaultLogo size={96} />
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: fontSize.h3,
              fontFamily: fontFamily.bold,
              textAlign: 'center',
              marginTop: spacing.md,
              lineHeight: 32,
            }}
          >
            Compara 36 modelos{'\n'}de aviación comercial
          </Text>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }}>
            Airbus vs Boeing — Especificaciones y análisis detallado
          </Text>
        </Animated.View>

        <Animated.View entering={stagger(120)} style={{ marginTop: spacing.lg }}>
          <Button title="Explorar catálogo" onPress={onExplore} />
          <View style={{ height: spacing.sm }} />
          <Button title="Comparar aeronaves" onPress={() => router.push('/(tabs)/compare')} variant="ghost" />
          <View style={{ height: spacing.sm }} />
          <Button title="Iniciar sesión" onPress={() => router.push('/(auth)/login')} variant="ghost" />
        </Animated.View>

        <Animated.View entering={stagger(200)}>
          <GlassCard style={{ marginTop: spacing.xl }}>
            <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: fontSize.h5 }}>
              La plataforma definitiva para comparar aeronaves comerciales
            </Text>
            <Text style={{ color: colors.textMuted, marginTop: spacing.sm, lineHeight: 22 }}>
              Acceso instantáneo a especificaciones, rendimiento y diseño de Airbus y Boeing.
            </Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={stagger(280)}>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: fontFamily.semibold,
              fontSize: fontSize.h5,
              marginTop: spacing.xl,
              marginBottom: spacing.md,
            }}
          >
            Modelos destacados
          </Text>
          {loading ? (
            <SkeletonLoader count={2} />
          ) : (
            featured.map((a) => (
              <Pressable key={a.id} onPress={() => router.push(`/aircraft/${a.id}`)}>
                <GlassCard style={{ marginBottom: spacing.sm, flexDirection: 'row', gap: spacing.sm }}>
                  <AircraftThumbnail uri={a.thumbnailUrl} size={72} borderRadius={8} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                      {a.manufacturer?.name}
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>
                      {a.displayName ?? a.name}
                    </Text>
                    {a.rangeKm ? (
                      <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                        Alcance: {a.rangeKm.toLocaleString()} km
                      </Text>
                    ) : null}
                  </View>
                </GlassCard>
              </Pressable>
            ))
          )}
        </Animated.View>

        <Animated.View entering={stagger(360)}>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: fontFamily.semibold,
              marginTop: spacing.lg,
              marginBottom: spacing.sm,
            }}
          >
            Fabricantes
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {manufacturers.map((m) => (
              <Pressable
                key={m.id}
                style={{ flex: 1 }}
                onPress={() => router.push(`/manufacturers/${m.id}`)}
              >
                <GlassCard>
                  <Text style={{ color: colors.primary, fontFamily: fontFamily.bold }}>{m.name}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                    {m.aircraftCount ?? '—'} modelos
                  </Text>
                </GlassCard>
              </Pressable>
            ))}
            <Pressable style={{ flex: 1 }} onPress={() => router.push('/manufacturers')}>
              <GlassCard>
                <Text style={{ color: colors.primary, fontFamily: fontFamily.medium }}>Ver todos</Text>
              </GlassCard>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={stagger(440)}>
          <Pressable onPress={() => router.push('/families')} style={{ marginTop: spacing.lg }}>
            <GlassCard>
              <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold }}>
                Familias de aeronaves
              </Text>
              <Text style={{ color: colors.textMuted, marginTop: spacing.xs }}>
                A320, 737, 787 y más — explora por familia
              </Text>
            </GlassCard>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}
