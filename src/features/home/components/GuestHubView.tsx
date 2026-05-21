import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { GitCompare } from 'lucide-react-native';
import { SkyVaultLogo } from '../../../components/native/SkyVaultLogo';
import { Button } from '../../../components/ui/Button';
import { GlassSearchBar } from '../../../components/ui/liquid-glass/GlassSearchBar';
import { CatalogAircraftCard } from '../../../components/native/CatalogAircraftCard';
import { LiquidGlassSurface } from '../../../components/ui/liquid-glass/LiquidGlassSurface';
import { aircraftService } from '../../aircraft/services/aircraftService';
import type { AircraftCardDto } from '../../../shared/types/aircraft.types';
import { useTheme } from '../../../theme';
import { useStaggerEntrance } from '../../../hooks/useStaggerEntrance';

export function GuestHubView() {
  const router = useRouter();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const { stagger } = useStaggerEntrance();
  const [featured, setFeatured] = useState<AircraftCardDto[]>([]);
  const [searchQ, setSearchQ] = useState('');

  const gradientColors = [colors.primaryDark, '#1e4061', colors.primary] as const;

  useEffect(() => {
    void aircraftService.getFeaturedAircraft(4).then(setFeatured);
  }, []);

  const goCompare = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/(tabs)/compare');
  };

  const goSearch = (q?: string) => {
    const term = (q ?? searchQ).trim();
    if (term.length >= 2) {
      router.push({ pathname: '/(tabs)/search', params: { q: term } });
    } else {
      router.push('/(tabs)/search');
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={stagger(0)}
          style={{ alignItems: 'center', paddingTop: spacing.lg, paddingHorizontal: spacing.lg }}
        >
          <SkyVaultLogo size={72} />
          <Text
            style={{
              color: '#fff',
              fontSize: fontSize.h4,
              fontFamily: fontFamily.bold,
              marginTop: spacing.sm,
            }}
          >
            SkyVault
          </Text>
          <Text
            style={{
              color: 'rgba(227,232,239,0.85)',
              fontSize: fontSize.bodySmall,
              marginTop: spacing.xs,
              textAlign: 'center',
            }}
          >
            Catálogo y comparador de aeronaves
          </Text>
        </Animated.View>

        <Animated.View entering={stagger(60)} style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <GlassSearchBar
            value={searchQ}
            onChangeText={setSearchQ}
            placeholder="Buscar aeronave…"
            onFilterPress={() => goSearch()}
            onSubmit={() => goSearch()}
            activeFilterCount={0}
          />
        </Animated.View>

        <Animated.View entering={stagger(120)} style={{ paddingHorizontal: spacing.lg }}>
          <LiquidGlassSurface borderRadius={16} style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
            <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: fontSize.h6 }}>
              Empieza aquí
            </Text>
            <Text style={{ color: 'rgba(227,232,239,0.8)', marginTop: spacing.xs, fontSize: fontSize.bodySmall }}>
              Inicia sesión para favoritos y reportes, o explora el catálogo sin cuenta.
            </Text>
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              <Button title="Iniciar sesión" onPress={() => router.push('/(auth)/login')} />
              <Button title="Crear cuenta" variant="secondary" onPress={() => router.push('/(auth)/register')} />
            </View>
          </LiquidGlassSurface>
        </Animated.View>

        {featured.length > 0 ? (
          <Animated.View entering={stagger(200)} style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
            <Text style={{ color: '#fff', fontFamily: fontFamily.bold, fontSize: fontSize.h6 }}>
              Destacadas
            </Text>
            <Text style={{ color: 'rgba(227,232,239,0.7)', fontSize: fontSize.caption, marginBottom: spacing.sm }}>
              Toca una imagen para verla en grande
            </Text>
            {featured.map((a) => (
              <CatalogAircraftCard key={a.id} aircraft={a} />
            ))}
          </Animated.View>
        ) : null}

        <Animated.View entering={stagger(280)} style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <Pressable onPress={goCompare}>
            <LiquidGlassSurface borderRadius={16} style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <GitCompare color="#fff" size={22} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontFamily: fontFamily.semibold, fontSize: fontSize.body }}>
                    Solo comparar
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: fontSize.caption, marginTop: 2 }}>
                    2 o 3 modelos, sin cuenta
                  </Text>
                </View>
              </View>
            </LiquidGlassSurface>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}
