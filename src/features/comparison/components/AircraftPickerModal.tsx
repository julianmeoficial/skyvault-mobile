import { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  SectionList,
} from 'react-native';
import { X } from 'lucide-react-native';
import { comparisonService } from '../services/comparisonService';
import type { AircraftOption, GroupedAircraftMap } from '../../../shared/types/comparison.types';
import { SearchBar } from '../../../components/native/SearchBar';
import { useTheme } from '../../../theme';

interface AircraftPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: AircraftOption) => void;
  excludeIds?: number[];
}

export function AircraftPickerModal({
  visible,
  onClose,
  onSelect,
  excludeIds = [],
}: AircraftPickerModalProps) {
  const { colors, spacing, fontFamily, fontSize } = useTheme();
  const [query, setQuery] = useState('');
  const [grouped, setGrouped] = useState<GroupedAircraftMap>({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (q: string) => {
    setLoading(true);
    try {
      if (q.trim().length >= 2) {
        const { options } = await comparisonService.fetchAllAircraftOptions({ search: q, size: 80 });
        setGrouped(comparisonService.groupByManufacturer(options));
      } else {
        setGrouped(await comparisonService.getGroupedAircraftMap());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => void load(query), query.length >= 2 ? 300 : 0);
    return () => clearTimeout(t);
  }, [visible, query, load]);

  const sections = Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((title) => ({
      title,
      data: grouped[title].filter((o) => !excludeIds.includes(o.id)),
    }))
    .filter((s) => s.data.length > 0);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { backgroundColor: colors.bgMain }]}>
        <View style={styles.header}>
          <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
            Elegir aeronave
          </Text>
          <Pressable onPress={onClose}>
            <X color={colors.textMuted} size={24} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: spacing.md }}>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar todos los modelos…" />
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
            renderSectionHeader={({ section: { title } }) => (
              <Text
                style={{
                  color: colors.primary,
                  fontFamily: fontFamily.semibold,
                  marginTop: spacing.md,
                  marginBottom: spacing.xs,
                }}
              >
                {title}
              </Text>
            )}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={{ paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}
              >
                <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.medium }}>
                  {item.displayName}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>
                  {item.model}
                  {item.rangeKm ? ` · ${item.rangeKm.toLocaleString()} km` : ''}
                </Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 24 }}>
                Sin modelos
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
});
