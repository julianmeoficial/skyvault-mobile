import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}

export function GlassCard({ children, style, intensity = 40 }: GlassCardProps) {
  const { colors, radius, scheme } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius: radius.md,
          borderColor: colors.glassBorder,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={scheme === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.content, { backgroundColor: colors.glassBackground }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    marginVertical: 6,
  },
  content: {
    padding: 18,
  },
});
