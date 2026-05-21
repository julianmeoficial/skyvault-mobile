import { Pressable, Text, StyleSheet, ActivityIndicator, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors, radius, fontSize, fontFamily, fontWeight, spacing } = useTheme();

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? colors.primary : isSecondary ? colors.glassBackground : 'transparent',
          borderColor: isPrimary || isSecondary ? colors.primary : colors.border,
          borderRadius: radius.sm,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          opacity: pressed ? 0.9 : disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#fff' : colors.primary} />
      ) : (
        <Text
          style={{
            color: isPrimary ? '#FFFFFF' : colors.primary,
            fontSize: fontSize.bodySmall,
            fontFamily: fontFamily.semibold,
            fontWeight: fontWeight.semibold,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
