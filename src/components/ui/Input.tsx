import { TextInput, View, Text, StyleSheet, type TextInputProps } from 'react-native';
import { useTheme } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { colors, radius, fontSize, fontFamily, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: fontSize.bodySmall,
            fontFamily: fontFamily.medium,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.bgCard,
            borderColor: error ? colors.error : colors.border,
            color: colors.textPrimary,
            borderRadius: radius.sm,
            fontSize: fontSize.body,
            fontFamily: fontFamily.regular,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text style={{ color: colors.error, fontSize: fontSize.caption, marginTop: spacing.xs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    minHeight: 48,
  },
});
