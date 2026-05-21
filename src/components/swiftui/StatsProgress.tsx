import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface StatsProgressProps {
  label: string;
  value: number;
  max: number;
}

export function StatsProgress({ label, value, max }: StatsProgressProps) {
  const { colors, spacing, fontSize } = useTheme();
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>{label}</Text>
      <View
        style={{
          height: 8,
          backgroundColor: colors.borderLight,
          borderRadius: 4,
          marginTop: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
}
