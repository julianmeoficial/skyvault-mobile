import { useEffect } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../theme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, style }: SkeletonProps) {
  const { colors, radius } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 800 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius.sm,
          backgroundColor: colors.borderLight,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
      <Skeleton height={140} />
      <Skeleton height={18} width="70%" />
      <Skeleton height={14} width="50%" />
    </View>
  );
}
