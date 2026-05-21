import { View, Text, StyleSheet } from 'react-native';
import { LiquidGlassSurface } from '../../../components/ui/liquid-glass/LiquidGlassSurface';
import { useTheme } from '../../../theme';

export interface RankingRow {
  rank: number;
  name: string;
  value: string;
}

interface StatsRankingListProps {
  title?: string;
  rows: RankingRow[];
}

export function StatsRankingList({ title = 'Ranking', rows }: StatsRankingListProps) {
  const { colors, spacing, fontFamily, fontSize } = useTheme();

  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5, marginBottom: spacing.sm }}>
        {title}
      </Text>
      {rows.map((row) => (
        <LiquidGlassSurface key={row.rank} style={{ marginBottom: spacing.sm, padding: 12 }} borderRadius={16}>
          <View style={styles.row}>
            <View style={[styles.rankCircle, { backgroundColor: colors.primary }]}>
              <Text style={{ color: '#fff', fontFamily: fontFamily.bold }}>{row.rank}</Text>
            </View>
            <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.semibold, flex: 1 }} numberOfLines={1}>
              {row.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontFamily: fontFamily.regular }}>{row.value}</Text>
          </View>
        </LiquidGlassSurface>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
