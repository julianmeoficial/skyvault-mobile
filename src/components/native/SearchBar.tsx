import { View, TextInput, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../theme';
import { GlassCard } from '../ui/GlassCard';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar aeronaves…',
}: SearchBarProps) {
  const { colors, fontSize, fontFamily, spacing } = useTheme();

  return (
    <GlassCard style={{ marginBottom: spacing.md }} intensity={30}>
      <View style={styles.row}>
        <Search size={20} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            marginLeft: spacing.sm,
            color: colors.textPrimary,
            fontSize: fontSize.body,
            fontFamily: fontFamily.regular,
            paddingVertical: spacing.xs,
          }}
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
