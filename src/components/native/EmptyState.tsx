import { View, Text } from 'react-native';
import { useTheme } from '../../theme';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, actionLabel, onAction }: EmptyStateProps) {
  const { colors, fontSize, fontFamily, spacing } = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
      <Text
        style={{
          color: colors.textPrimary,
          fontSize: fontSize.h5,
          fontFamily: fontFamily.semibold,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {message ? (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: fontSize.body,
            fontFamily: fontFamily.regular,
            textAlign: 'center',
            marginBottom: spacing.lg,
          }}
        >
          {message}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
