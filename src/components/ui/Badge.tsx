import { Text, View } from 'react-native';
import { useTheme } from '../../theme';

interface BadgeProps {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'info';
}

export function Badge({ label, tone = 'default' }: BadgeProps) {
  const { colors, radius, fontSize, fontFamily, spacing } = useTheme();

  const bg =
    tone === 'success'
      ? colors.success + '22'
      : tone === 'warning'
        ? colors.warning + '22'
        : tone === 'info'
          ? colors.info + '22'
          : colors.accentLight + '44';

  const fg =
    tone === 'success'
      ? colors.success
      : tone === 'warning'
        ? colors.warning
        : tone === 'info'
          ? colors.info
          : colors.primary;

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: bg,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
      }}
    >
      <Text
        style={{
          color: fg,
          fontSize: fontSize.caption,
          fontFamily: fontFamily.semibold,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
