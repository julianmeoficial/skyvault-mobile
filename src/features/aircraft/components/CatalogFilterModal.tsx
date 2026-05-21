import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  Pressable,
  Switch,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { aircraftService } from '../services/aircraftService';
import { familyService } from '../../families/services/familyService';
import type { AircraftFilters, SortOption } from '../../../shared/types/aircraft.types';
import type { ManufacturerSummaryDto } from '../../../shared/types/aircraft.types';
import type { FamilyDto } from '../../families/types/family.types';
import type { CatalogSummaryDto } from '../../../shared/types/aircraft.types';
import { SORT_OPTIONS, sortFromValue, sortValueFromOption } from '../utils/catalogSort';
import { LiquidGlassButton } from '../../../components/ui/liquid-glass/LiquidGlassButton';
import { useTheme } from '../../../theme';

interface CatalogFilterModalProps {
  visible: boolean;
  filters: AircraftFilters;
  sort: SortOption;
  onClose: () => void;
  onApply: (filters: AircraftFilters, sort: SortOption) => void;
}

export function CatalogFilterModal({
  visible,
  filters,
  sort,
  onClose,
  onApply,
}: CatalogFilterModalProps) {
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const [draft, setDraft] = useState<AircraftFilters>(filters);
  const [draftSort, setDraftSort] = useState(sort);
  const [manufacturers, setManufacturers] = useState<ManufacturerSummaryDto[]>([]);
  const [families, setFamilies] = useState<FamilyDto[]>([]);
  const [catalog, setCatalog] = useState<CatalogSummaryDto | null>(null);

  useEffect(() => {
    if (!visible) return;
    setDraft(filters);
    setDraftSort(sort);
    void Promise.all([
      aircraftService.getManufacturers(true),
      aircraftService.getCatalogSummary(),
    ]).then(([m, c]) => {
      setManufacturers(m);
      setCatalog(c);
    });
  }, [visible, filters, sort]);

  useEffect(() => {
    if (!draft.manufacturerId) {
      setFamilies([]);
      return;
    }
    void familyService.getFamiliesSummary(draft.manufacturerId).then(setFamilies);
  }, [draft.manufacturerId]);

  const sortVal = sortValueFromOption(draftSort);

  const apply = () => {
    if (
      draft.minPassengers != null &&
      draft.maxPassengers != null &&
      draft.minPassengers > draft.maxPassengers
    ) {
      Alert.alert('Filtros', 'El mínimo de pasajeros no puede ser mayor que el máximo.');
      return;
    }
    if (draft.minRange != null && draft.maxRange != null && draft.minRange > draft.maxRange) {
      Alert.alert('Filtros', 'El alcance mínimo no puede ser mayor que el máximo.');
      return;
    }
    onApply(draft, draftSort);
    onClose();
  };

  const clear = () => {
    const empty: AircraftFilters = { onlyActive: true };
    setDraft(empty);
    setDraftSort({ field: 'name', direction: 'asc' });
    onApply(empty, { field: 'name', direction: 'asc' });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.sheet, { backgroundColor: colors.bgMain }]}>
        <View style={styles.header}>
          <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.bold, fontSize: fontSize.h5 }}>
            Filtros
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X color={colors.textMuted} size={24} />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
          <SectionTitle title="Fabricante" colors={colors} fontFamily={fontFamily} />
          <ChipRow
            items={[{ id: 0, name: 'Todos' }, ...manufacturers.map((m) => ({ id: m.id, name: m.name }))]}
            selectedId={draft.manufacturerId ?? 0}
            onSelect={(id) =>
              setDraft((d) => ({
                ...d,
                manufacturerId: id === 0 ? undefined : Number(id),
                familyId: undefined,
              }))
            }
            colors={colors}
            fontFamily={fontFamily}
          />

          {families.length > 0 ? (
            <>
              <SectionTitle title="Familia" colors={colors} fontFamily={fontFamily} />
              <ChipRow
                items={[{ id: 0, name: 'Todas' }, ...families.map((f) => ({ id: f.id, name: f.name }))]}
                selectedId={draft.familyId ?? 0}
                onSelect={(id) => setDraft((d) => ({ ...d, familyId: id === 0 ? undefined : Number(id) }))}
                colors={colors}
                fontFamily={fontFamily}
              />
            </>
          ) : null}

          {catalog ? (
            <>
              <SectionTitle title="Tipo" colors={colors} fontFamily={fontFamily} />
              <ChipRow
                items={[{ id: 0, name: 'Todos' }, ...catalog.types.map((t) => ({ id: t.id, name: t.name }))]}
                selectedId={draft.typeId ?? 0}
                onSelect={(id) => setDraft((d) => ({ ...d, typeId: id === 0 ? undefined : Number(id) }))}
                colors={colors}
                fontFamily={fontFamily}
              />
              <SectionTitle title="Estado de producción" colors={colors} fontFamily={fontFamily} />
              <ChipRow
                items={[
                  { id: 0, name: 'Todos' },
                  ...catalog.productionStates.map((t) => ({ id: t.id, name: t.name })),
                ]}
                selectedId={draft.productionStateId ?? 0}
                onSelect={(id) => setDraft((d) => ({ ...d, productionStateId: id === 0 ? undefined : Number(id) }))}
                colors={colors}
                fontFamily={fontFamily}
              />
              <SectionTitle title="Categoría de tamaño" colors={colors} fontFamily={fontFamily} />
              <ChipRow
                items={[
                  { id: 0, name: 'Todas' },
                  ...catalog.sizeCategories.map((t) => ({ id: t.id, name: t.name })),
                ]}
                selectedId={draft.sizeCategoryId ?? 0}
                onSelect={(id) => setDraft((d) => ({ ...d, sizeCategoryId: id === 0 ? undefined : Number(id) }))}
                colors={colors}
                fontFamily={fontFamily}
              />
            </>
          ) : null}

          <SectionTitle title="Pasajeros (mín / máx)" colors={colors} fontFamily={fontFamily} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <NumInput
              placeholder="Mín"
              value={draft.minPassengers}
              onChange={(v) => setDraft((d) => ({ ...d, minPassengers: v }))}
              colors={colors}
            />
            <NumInput
              placeholder="Máx"
              value={draft.maxPassengers}
              onChange={(v) => setDraft((d) => ({ ...d, maxPassengers: v }))}
              colors={colors}
            />
          </View>

          <SectionTitle title="Alcance km (mín / máx)" colors={colors} fontFamily={fontFamily} />
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <NumInput
              placeholder="Mín"
              value={draft.minRange}
              onChange={(v) => setDraft((d) => ({ ...d, minRange: v }))}
              colors={colors}
            />
            <NumInput
              placeholder="Máx"
              value={draft.maxRange}
              onChange={(v) => setDraft((d) => ({ ...d, maxRange: v }))}
              colors={colors}
            />
          </View>

          <SectionTitle title="Ordenar por" colors={colors} fontFamily={fontFamily} />
          <ChipRow
            items={SORT_OPTIONS.map((o) => ({ id: o.value, name: o.label }))}
            selectedId={sortVal}
            onSelect={(id) => setDraftSort(sortFromValue(String(id)))}
            colors={colors}
            fontFamily={fontFamily}
            idIsString
          />

          <View style={[styles.row, { marginTop: spacing.md }]}>
            <Text style={{ color: colors.textSecondary, flex: 1 }}>Solo en producción</Text>
            <Switch
              value={draft.onlyActive ?? true}
              onValueChange={(v) => setDraft((d) => ({ ...d, onlyActive: v }))}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <LiquidGlassButton title="Limpiar" variant="ghost" onPress={clear} style={{ flex: 1 }} />
          <LiquidGlassButton title="Aplicar" onPress={apply} style={{ flex: 1 }} />
        </View>
      </View>
    </Modal>
  );
}

function SectionTitle({
  title,
  colors,
  fontFamily,
}: {
  title: string;
  colors: { textMuted: string };
  fontFamily: { semibold: string };
}) {
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontFamily: fontFamily.semibold,
        marginTop: 16,
        marginBottom: 8,
      }}
    >
      {title}
    </Text>
  );
}

function ChipRow({
  items,
  selectedId,
  onSelect,
  colors,
  fontFamily,
  idIsString,
}: {
  items: { id: number | string; name: string }[];
  selectedId: number | string;
  onSelect: (id: number | string) => void;
  colors: { primary: string; glassBackground: string; glassBorder: string; textPrimary: string };
  fontFamily: { medium: string };
  idIsString?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((item) => {
        const sel = idIsString ? selectedId === item.id : selectedId === item.id;
        return (
          <Pressable
            key={String(item.id)}
            onPress={() => onSelect(item.id)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: sel ? colors.primary : colors.glassBorder,
              backgroundColor: sel ? colors.glassBackground : 'transparent',
            }}
          >
            <Text style={{ color: sel ? colors.primary : colors.textPrimary, fontFamily: fontFamily.medium }}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function NumInput({
  placeholder,
  value,
  onChange,
  colors,
}: {
  placeholder: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  colors: { textPrimary: string; glassBorder: string; glassBackground: string };
}) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.textPrimary}
      keyboardType="numeric"
      value={value != null ? String(value) : ''}
      onChangeText={(t) => {
        const n = t.trim() === '' ? undefined : Number(t);
        onChange(Number.isNaN(n as number) ? undefined : n);
      }}
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        backgroundColor: colors.glassBackground,
        borderRadius: 12,
        padding: 12,
        color: colors.textPrimary,
      }}
    />
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
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
});
