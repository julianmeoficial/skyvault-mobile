import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useEffect, useMemo } from 'react';
import { LiquidGlassSurface } from '../../../components/ui/liquid-glass/LiquidGlassSurface';
import { useTheme } from '../../../theme';

export type StatsSegment = 'range' | 'seats' | 'efficiency';

export const SEGMENT_ORDER: StatsSegment[] = ['range', 'seats', 'efficiency'];

const SEGMENTS: { id: StatsSegment; label: string }[] = [
  { id: 'range', label: 'Alcance' },
  { id: 'seats', label: 'Asientos' },
  { id: 'efficiency', label: 'Eficiencia' },
];

const PADDING = 4;

interface StatsSegmentSliderProps {
  value: StatsSegment;
  onChange: (v: StatsSegment) => void;
}

export function StatsSegmentSlider({ value, onChange }: StatsSegmentSliderProps) {
  const { colors, fontFamily, fontSize } = useTheme();
  const trackWidth = useSharedValue(0);
  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(0);

  const activeIndex = useMemo(
    () => SEGMENTS.findIndex((s) => s.id === value),
    [value],
  );

  useEffect(() => {
    const w = trackWidth.value;
    if (w <= 0 || activeIndex < 0) return;
    const inner = w - PADDING * 2;
    const segW = inner / SEGMENTS.length;
    indicatorW.value = withSpring(segW, { damping: 20, stiffness: 220 });
    indicatorX.value = withSpring(PADDING + activeIndex * segW, { damping: 20, stiffness: 220 });
  }, [activeIndex, trackWidth, indicatorX, indicatorW]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorW.value,
  }));

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    trackWidth.value = w;
    const inner = w - PADDING * 2;
    const segW = inner / SEGMENTS.length;
    indicatorW.value = segW;
    indicatorX.value = PADDING + activeIndex * segW;
  };

  return (
    <LiquidGlassSurface style={styles.wrap} borderRadius={20} compact>
      <View style={styles.track} onLayout={onTrackLayout}>
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: colors.primary, borderRadius: 14 },
            indicatorStyle,
          ]}
        />
        {SEGMENTS.map((s) => {
          const active = value === s.id;
          return (
            <Pressable key={s.id} onPress={() => onChange(s.id)} style={styles.segment}>
              <Text
                style={{
                  color: active ? '#fff' : colors.textMuted,
                  fontFamily: fontFamily.semibold,
                  fontSize: fontSize.bodySmall,
                }}
              >
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </LiquidGlassSurface>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16, padding: 0 },
  track: {
    flexDirection: 'row',
    padding: PADDING,
    position: 'relative',
    minHeight: 48,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: 0,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    zIndex: 1,
  },
});
