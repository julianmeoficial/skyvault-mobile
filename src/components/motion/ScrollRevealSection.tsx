import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

interface ScrollRevealSectionProps {
  children: ReactNode;
  scrollY: SharedValue<number>;
  /** Approximate Y offset of this section in the scroll content */
  sectionOffset: number;
  sectionHeight?: number;
  style?: StyleProp<ViewStyle>;
}

export function ScrollRevealSection({
  children,
  scrollY,
  sectionOffset,
  sectionHeight = 120,
  style,
}: ScrollRevealSectionProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.value,
      [sectionOffset - sectionHeight, sectionOffset - 40],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return {
      opacity: progress,
      transform: [{ translateY: interpolate(progress, [0, 1], [24, 0]) }],
    };
  });

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
