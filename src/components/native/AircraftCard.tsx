import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { GlassCard } from '../ui/GlassCard';
import { BreathingCard } from '../motion/BreathingCard';
import { Badge } from '../ui/Badge';
import { AircraftThumbnail } from '../media/AircraftThumbnail';
import type { AircraftCardDto } from '../../shared/types/aircraft.types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AircraftCardProps {
  aircraft: AircraftCardDto;
}

export function AircraftCard({ aircraft }: AircraftCardProps) {
  const router = useRouter();
  const { colors, fontSize, fontFamily, spacing, radius } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageUri =
    aircraft.thumbnailUrl ??
    (aircraft as { mainImageUrl?: string }).mainImageUrl;

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => {
        scale.value = withSpring(0.97);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      onPress={() => router.push(`/aircraft/${aircraft.id}`)}
    >
      <BreathingCard enabled={false}>
        <GlassCard style={{ marginBottom: spacing.sm, overflow: 'hidden' }}>
          <AircraftThumbnail
            uri={imageUri}
            width="100%"
            height={140}
            borderRadius={radius.md}
          />
          <View style={styles.body}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: fontSize.h6,
                fontFamily: fontFamily.semibold,
              }}
              numberOfLines={1}
            >
              {aircraft.displayName ?? aircraft.name}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: fontSize.bodySmall,
                fontFamily: fontFamily.regular,
                marginTop: spacing.xs,
              }}
            >
              {aircraft.manufacturer?.name}
              {aircraft.rangeKm ? ` · ${aircraft.rangeKm.toLocaleString()} km` : ''}
            </Text>
            {aircraft.productionState?.name ? (
              <View style={{ marginTop: spacing.sm }}>
                <Badge label={aircraft.productionState.name} />
              </View>
            ) : null}
          </View>
        </GlassCard>
      </BreathingCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  body: { padding: 12, paddingTop: 10 },
});
