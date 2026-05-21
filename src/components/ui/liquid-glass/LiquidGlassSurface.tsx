import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../theme';

interface LiquidGlassSurfaceProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
  /** Sin padding interno (sliders, barras). */
  compact?: boolean;
}

export function LiquidGlassSurface({
  children,
  style,
  intensity,
  borderRadius,
  compact = false,
}: LiquidGlassSurfaceProps) {
  const { colors, radius, scheme } = useTheme();
  const r = borderRadius ?? radius.lg;
  const blurIntensity = intensity ?? (scheme === 'light' ? 72 : 50);

  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius: r,
          borderColor: scheme === 'light' ? colors.borderStrong : colors.glassBorder,
          shadowColor: colors.shadowColor,
        },
        style,
      ]}
    >
      <BlurView
        intensity={blurIntensity}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={[StyleSheet.absoluteFill, { borderRadius: r }]}
      />
      <View
        style={[
          styles.inner,
          compact && styles.innerCompact,
          {
            backgroundColor: colors.glassBackground,
            borderRadius: r,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inner: {
    padding: 16,
  },
  innerCompact: {
    padding: 0,
  },
});
