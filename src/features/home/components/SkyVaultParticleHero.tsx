import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '../../../theme';

const ORB_COUNT = 24;

type Orb = {
  id: number;
  baseX: number;
  baseY: number;
  size: number;
  phase: number;
};

interface SkyVaultParticleHeroProps {
  scrollY?: SharedValue<number>;
  height?: number;
}

export function SkyVaultParticleHero({ scrollY, height = 220 }: SkyVaultParticleHeroProps) {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const touchX = useSharedValue(-1);
  const touchY = useSharedValue(-1);
  const impulse = useSharedValue(0);

  const orbs: Orb[] = useMemo(
    () =>
      Array.from({ length: ORB_COUNT }, (_, i) => ({
        id: i,
        baseX: ((i * 37) % 100) / 100,
        baseY: ((i * 53) % 100) / 100,
        size: 4 + (i % 5),
        phase: (i / ORB_COUNT) * Math.PI * 2,
      })),
    [],
  );

  const tap = Gesture.Tap().onStart((e) => {
    touchX.value = e.x;
    touchY.value = e.y;
    impulse.value = 1;
    impulse.value = withTiming(0, { duration: 900 });
  });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.container, { height, width }]}>
        {orbs.map((orb) => (
          <ParticleOrb
            key={orb.id}
            orb={orb}
            width={width}
            height={height}
            color={colors.primary}
            touchX={touchX}
            touchY={touchY}
            impulse={impulse}
            scrollY={scrollY}
          />
        ))}
      </Animated.View>
    </GestureDetector>
  );
}

function ParticleOrb({
  orb,
  width,
  height,
  color,
  touchX,
  touchY,
  impulse,
  scrollY,
}: {
  orb: Orb;
  width: number;
  height: number;
  color: string;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  impulse: SharedValue<number>;
  scrollY?: SharedValue<number>;
}) {
  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withSpring(1, { damping: 20, stiffness: 40 });
    return () => cancelAnimation(drift);
  }, [drift]);

  const style = useAnimatedStyle(() => {
    const scrollOffset = scrollY ? scrollY.value * 0.15 : 0;
    let x = orb.baseX * width;
    let y = orb.baseY * height + scrollOffset;

    if (touchX.value >= 0 && impulse.value > 0.05) {
      const dx = x - touchX.value;
      const dy = y - touchY.value;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (80 / dist) * impulse.value;
      x += (dx / dist) * force;
      y += (dy / dist) * force;
    }

    const pulse = 0.85 + Math.sin(orb.phase + drift.value) * 0.15;

    return {
      position: 'absolute',
      left: x,
      top: y,
      width: orb.size * pulse,
      height: orb.size * pulse,
      borderRadius: orb.size,
      backgroundColor: color,
      opacity: 0.35 + pulse * 0.25,
    };
  });

  return <Animated.View style={style} />;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
});
