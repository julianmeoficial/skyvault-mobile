import { Pressable, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../../components/ui/GlassCard';
import { useTheme } from '../../../theme';

interface QuickActionTileProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
}

export function QuickActionTile({ title, subtitle, onPress }: QuickActionTileProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={styles.wrap}
    >
      <GlassCard>
        <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold, fontSize: fontSize.body }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: colors.textMuted, marginTop: spacing.xs, fontSize: fontSize.caption }}>
            {subtitle}
          </Text>
        ) : null}
      </GlassCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, minWidth: '47%' },
});
