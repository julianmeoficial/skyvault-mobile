import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

interface DashboardHeroHeaderProps {
  title: string;
  subtitle: string;
}

export function DashboardHeroHeader({ title, subtitle }: DashboardHeroHeaderProps) {
  const { spacing, fontSize, fontFamily } = useTheme();

  return (
    <LinearGradient
      colors={['#0e1d2c', '#1e4061']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ padding: spacing.md, borderRadius: 16, marginBottom: spacing.md }}
    >
      <Text style={{ color: '#fff', fontSize: fontSize.h4, fontFamily: fontFamily.bold }}>{title}</Text>
      <Text style={{ color: 'rgba(227,232,239,0.8)', marginTop: spacing.xs, fontSize: fontSize.bodySmall }}>
        {subtitle}
      </Text>
    </LinearGradient>
  );
}
