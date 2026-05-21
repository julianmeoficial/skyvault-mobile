import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { SlidersHorizontal } from 'lucide-react-native';
import { useTheme } from '../../../theme';

interface GlassSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress: () => void;
  activeFilterCount?: number;
  onSubmit?: () => void;
}

export function GlassSearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar aeronave…',
  onFilterPress,
  activeFilterCount = 0,
  onSubmit,
}: GlassSearchBarProps) {
  const { colors, radius, fontSize, fontFamily, spacing } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          borderRadius: radius.lg,
          borderColor: colors.glassBorder,
          backgroundColor: colors.glassBackground,
        },
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={{
          flex: 1,
          color: colors.textPrimary,
          fontSize: fontSize.body,
          fontFamily: fontFamily.regular,
          paddingVertical: spacing.md,
          paddingLeft: spacing.md,
        }}
        accessibilityLabel="Buscar aeronave"
        returnKeyType="search"
        onSubmitEditing={onSubmit}
      />
      <Pressable
        onPress={onFilterPress}
        style={[styles.filterBtn, { borderLeftColor: colors.border }]}
        accessibilityLabel="Abrir filtros"
      >
        <SlidersHorizontal color={colors.primary} size={22} />
        {activeFilterCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{activeFilterCount > 9 ? '9+' : activeFilterCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
});
