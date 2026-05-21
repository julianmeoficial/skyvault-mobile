import { View, Text, StyleSheet } from 'react-native';
import { GlassCard } from '../../../components/ui/GlassCard';
import { BreathingCard } from '../../../components/motion/BreathingCard';
import { useTheme } from '../../../theme';

interface StatCardProps {
  label: string;
  value: string | number;
  accentColor?: string;
}

export function StatCard({ label, value, accentColor }: StatCardProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();

  return (
    <BreathingCard style={{ minWidth: '47%', flex: 1 }}>
    <GlassCard style={styles.card}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: fontSize.caption,
          fontFamily: fontFamily.medium,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: accentColor ?? colors.primary,
          fontSize: fontSize.h3,
          fontFamily: fontFamily.bold,
          marginTop: spacing.xs,
        }}
      >
        {value}
      </Text>
    </GlassCard>
    </BreathingCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 14, paddingHorizontal: 12 },
});
