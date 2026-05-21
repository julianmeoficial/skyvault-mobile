import { useEffect, useState } from 'react';
import { AccessibilityInfo, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

interface BreathingCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  enabled?: boolean;
}

export function BreathingCard({ children, style, enabled = true }: BreathingCardProps) {
  const scale = useSharedValue(1);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!enabled || reduceMotion) {
      cancelAnimation(scale);
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2200 }),
        withTiming(1, { duration: 2200 }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(scale);
  }, [enabled, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
