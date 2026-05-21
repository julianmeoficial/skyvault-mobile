import { Pressable, Text, StyleSheet, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../theme';

interface LiquidGlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
}

export function LiquidGlassButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: LiquidGlassButtonProps) {
  const { colors, radius, fontSize, fontFamily, spacing } = useTheme();

  const handlePress = () => {
    if (!disabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary
            ? colors.primary
            : isSecondary
              ? colors.glassBackground
              : 'transparent',
          borderColor: isPrimary ? colors.primary : colors.glassBorder,
          borderRadius: radius.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          opacity: pressed ? 0.88 : disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: isPrimary ? '#fff' : colors.primary,
          fontSize: fontSize.bodySmall,
          fontFamily: fontFamily.semibold,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
