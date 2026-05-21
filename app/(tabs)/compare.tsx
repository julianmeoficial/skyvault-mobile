import { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useComparison } from '../../src/features/comparison/hooks/useComparison';
import { AircraftPickerModal } from '../../src/features/comparison/components/AircraftPickerModal';
import { CompareAircraftStrip } from '../../src/features/comparison/components/CompareAircraftStrip';
import { ComparisonGrid } from '../../src/features/comparison/components/ComparisonGrid';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/native/EmptyState';
import { useAuth } from '../../src/features/auth/hooks/useAuth';
import {
  getComparisonStorageUserId,
  recordComparisonSession,
} from '../../src/features/dashboard/utils/compareHistory';
import type { AircraftOption } from '../../src/shared/types/comparison.types';
import { useTheme } from '../../src/theme';
import { COMPARE_COLORS } from '../../src/features/comparison/components/ComparisonSection';

export default function CompareScreen() {
  const params = useLocalSearchParams<{ ids?: string }>();
  const { user } = useAuth();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const {
    selectedIds,
    items,
    isLoading,
    error,
    addId,
    removeId,
    clearAll,
    runCompare,
    maxItems,
  } = useComparison();

  const [pickerSlot, setPickerSlot] = useState<number | null>(null);
  const [optionsCache, setOptionsCache] = useState<Record<number, AircraftOption>>({});

  useEffect(() => {
    const idsParam = params.ids;
    if (!idsParam || typeof idsParam !== 'string') return;
    const ids = idsParam.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
    if (ids.length < 2) return;
    let cancelled = false;
    (async () => {
      for (const id of ids) {
        if (!cancelled) addId(id);
      }
      if (!cancelled) await runCompare();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deep link once
  }, [params.ids]);

  useEffect(() => {
    if (items.length > 0) {
      setOptionsCache((c) => {
        const next = { ...c };
        items.forEach((i) => {
          next[i.id] = {
            id: i.id,
            name: i.name,
            displayName: i.displayName ?? i.name,
            model: i.model ?? '',
            manufacturer: i.manufacturer ?? { id: 0, name: '' },
            family: i.family ?? { id: 0, name: '' },
            thumbnailUrl: i.thumbnailUrl,
          };
        });
        return next;
      });
    }
  }, [items]);

  useEffect(() => {
    if (items.length >= 2 && user) {
      const uid = getComparisonStorageUserId(user);
      void recordComparisonSession(
        uid,
        items.map((i) => i.id),
        items.map((i) => i.displayName ?? i.name),
      );
    }
  }, [items, user]);

  const onPick = useCallback(
    (option: AircraftOption) => {
      addId(option.id);
      setOptionsCache((c) => ({ ...c, [option.id]: option }));
      setPickerSlot(null);
    },
    [addId],
  );

  const findOption = (id: number): AircraftOption | undefined => optionsCache[id];

  const slotWidth = selectedIds.filter(Boolean).length <= 2 ? '48%' : '31%';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgMain }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={{ color: colors.textPrimary, fontSize: fontSize.h5, fontFamily: fontFamily.semibold }}>
        Comparar aeronaves
      </Text>
      <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>
        Selecciona 2 o 3 modelos para comparar
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {[0, 1, 2].map((slot) => {
          const id = selectedIds[slot];
          const opt = id ? findOption(id) : undefined;
          return (
            <Pressable
              key={slot}
              onPress={() => setPickerSlot(slot)}
              style={{
                width: slotWidth,
                minHeight: 120,
                backgroundColor: COMPARE_COLORS[slot % 3],
                borderRadius: 12,
                padding: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {opt?.thumbnailUrl ? (
                <Image
                  source={{ uri: opt.thumbnailUrl }}
                  style={{ width: '100%', height: 56, borderRadius: 8, marginBottom: 4 }}
                />
              ) : null}
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: fontSize.caption,
                  fontFamily: fontFamily.semibold,
                }}
                numberOfLines={2}
              >
                {opt ? opt.displayName : `+ Slot ${slot + 1}`}
              </Text>
              {id ? (
                <Pressable onPress={() => removeId(id)} hitSlop={8}>
                  <Text style={{ color: colors.error, fontSize: fontSize.caption, marginTop: 4 }}>Quitar</Text>
                </Pressable>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <AircraftPickerModal
        visible={pickerSlot !== null}
        onClose={() => setPickerSlot(null)}
        onSelect={onPick}
        excludeIds={selectedIds}
      />

      <Button
        title={isLoading ? 'Comparando…' : 'Comparar'}
        onPress={runCompare}
        loading={isLoading}
        disabled={selectedIds.length < 2}
      />

      {error ? <Text style={{ color: colors.error, marginTop: spacing.md }}>{error}</Text> : null}

      {items.length > 0 ? (
        <View style={{ marginTop: spacing.lg }}>
          <CompareAircraftStrip items={items} />
          <ComparisonGrid items={items} />
        </View>
      ) : selectedIds.length === 0 ? (
        <EmptyState title="Comparador vacío" message="Añade 2 o 3 aeronaves." />
      ) : null}

      {selectedIds.length > 0 ? (
        <Button title="Limpiar" onPress={clearAll} variant="ghost" style={{ marginTop: spacing.md }} />
      ) : null}
    </ScrollView>
  );
}
