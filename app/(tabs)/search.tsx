import { useState, useEffect, useCallback, useMemo } from 'react';
import { FlatList, View, Text, Pressable, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAircraftCatalog } from '../../src/features/aircraft/hooks/useAircraftCatalog';
import { comparisonService } from '../../src/features/comparison/services/comparisonService';
import { CatalogFilterModal } from '../../src/features/aircraft/components/CatalogFilterModal';
import { GlassSearchBar } from '../../src/components/ui/liquid-glass/GlassSearchBar';
import { CatalogAircraftCard } from '../../src/components/native/CatalogAircraftCard';
import { SkeletonLoader } from '../../src/components/native/SkeletonLoader';
import { EmptyState } from '../../src/components/native/EmptyState';
import { useTheme } from '../../src/theme';
import { SORT_OPTIONS } from '../../src/features/aircraft/utils/catalogSort';
import { aircraftService } from '../../src/features/aircraft/services/aircraftService';
import { FLAT_LIST_PERF } from '../../src/shared/constants/flatListPerf';
import type { CatalogSummaryDto } from '../../src/shared/types/aircraft.types';

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { colors, spacing, fontSize, fontFamily } = useTheme();
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');

  useEffect(() => {
    if (typeof q === 'string' && q.length > 0) setQuery(q);
  }, [q]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string; model: string }[]>([]);
  const [catalog, setCatalog] = useState<CatalogSummaryDto | null>(null);

  useEffect(() => {
    void aircraftService.getCatalogSummary().then(setCatalog).catch(() => setCatalog(null));
  }, []);

  const {
    aircraft,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    totalElements,
    hasMore,
    loadMore,
    refresh,
    filters,
    sort,
    manufacturers,
    activeFilterCount,
    setFilters,
    setSort,
  } = useAircraftCatalog({ searchTerm: '' });

  useEffect(() => {
    setFilters((f) => ({ ...f, searchTerm: query }));
  }, [query, setFilters]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await comparisonService.searchAircraft(query);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const onSelectSuggestion = useCallback(
    (id: string) => {
      router.push(`/aircraft/${id}`);
    },
    [router],
  );

  const chips = useMemo(() => {
    const list: { key: string; label: string; onRemove: () => void }[] = [];
    if (filters.manufacturerId) {
      const m = manufacturers.find((x) => x.id === filters.manufacturerId);
      list.push({
        key: 'mfr',
        label: m?.name ?? 'Fabricante',
        onRemove: () => setFilters((f) => ({ ...f, manufacturerId: undefined, familyId: undefined })),
      });
    }
    if (filters.typeId && catalog) {
      const t = catalog.types.find((x) => x.id === filters.typeId);
      list.push({
        key: 'type',
        label: t?.name ?? 'Tipo',
        onRemove: () => setFilters((f) => ({ ...f, typeId: undefined })),
      });
    }
    if (filters.productionStateId && catalog) {
      const ps = catalog.productionStates.find((x) => x.id === filters.productionStateId);
      list.push({
        key: 'ps',
        label: ps?.name ?? 'Estado',
        onRemove: () => setFilters((f) => ({ ...f, productionStateId: undefined })),
      });
    }
    if (filters.sizeCategoryId && catalog) {
      const sc = catalog.sizeCategories.find((x) => x.id === filters.sizeCategoryId);
      list.push({
        key: 'size',
        label: sc?.name ?? 'Tamaño',
        onRemove: () => setFilters((f) => ({ ...f, sizeCategoryId: undefined })),
      });
    }
    if (filters.minPassengers != null || filters.maxPassengers != null) {
      list.push({
        key: 'pax',
        label: `Pax ${filters.minPassengers ?? '…'}–${filters.maxPassengers ?? '…'}`,
        onRemove: () => setFilters((f) => ({ ...f, minPassengers: undefined, maxPassengers: undefined })),
      });
    }
    if (filters.minRange != null || filters.maxRange != null) {
      list.push({
        key: 'range',
        label: `Alcance ${filters.minRange ?? '…'}–${filters.maxRange ?? '…'} km`,
        onRemove: () => setFilters((f) => ({ ...f, minRange: undefined, maxRange: undefined })),
      });
    }
    if (filters.onlyActive === false) {
      list.push({
        key: 'all',
        label: 'Incluye inactivas',
        onRemove: () => setFilters((f) => ({ ...f, onlyActive: true })),
      });
    }
    const sortLabel = SORT_OPTIONS.find(
      (o) => o.sort.field === sort.field && o.sort.direction === sort.direction,
    )?.label;
    if (sortLabel && sortLabel !== 'Nombre A-Z') {
      list.push({
        key: 'sort',
        label: sortLabel,
        onRemove: () => setSort({ field: 'name', direction: 'asc' }),
      });
    }
    return list;
  }, [filters, sort, manufacturers, catalog, setFilters, setSort]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgMain }}>
      <View style={{ padding: spacing.md, paddingBottom: 0 }}>
        <Text style={{ color: colors.textPrimary, fontSize: fontSize.h4, fontFamily: fontFamily.bold }}>
          Catálogo
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: fontSize.caption, marginBottom: spacing.sm }}>
          {isLoading ? 'Cargando…' : `${totalElements} aeronaves`}
        </Text>
        <GlassSearchBar
          value={query}
          onChangeText={setQuery}
          onFilterPress={() => setFilterOpen(true)}
          activeFilterCount={activeFilterCount}
        />
        {chips.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.sm }}>
            {chips.map((c) => (
              <Pressable
                key={c.key}
                onPress={c.onRemove}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: colors.glassBackground,
                  borderWidth: 1,
                  borderColor: colors.primary,
                }}
              >
                <Text style={{ color: colors.primary, fontSize: fontSize.caption }}>{c.label} ×</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {suggestions.length > 0 ? (
          <View style={{ marginBottom: spacing.md }}>
            {suggestions.map((s) => (
              <Pressable key={s.id} onPress={() => onSelectSuggestion(s.id)} style={{ paddingVertical: 8 }}>
                <Text style={{ color: colors.textPrimary, fontFamily: fontFamily.medium }}>{s.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: fontSize.caption }}>{s.model}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      <CatalogFilterModal
        visible={filterOpen}
        filters={filters}
        sort={sort}
        onClose={() => setFilterOpen(false)}
        onApply={(f, s) => {
          setFilters(f);
          setSort(s);
        }}
      />

      {isLoading && aircraft.length === 0 ? (
        <SkeletonLoader count={3} />
      ) : error && aircraft.length === 0 ? (
        <EmptyState title="Error" message={error} actionLabel="Reintentar" onAction={refresh} />
      ) : (
        <FlatList
          data={aircraft}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xl }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.primary} />
          }
          {...FLAT_LIST_PERF}
          ListEmptyComponent={
            <EmptyState
              title="Sin resultados"
              message="Prueba otros filtros o términos de búsqueda."
              actionLabel="Limpiar filtros"
              onAction={() => {
                setQuery('');
                setFilters({ onlyActive: true });
                setSort({ field: 'name', direction: 'asc' });
              }}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <Text style={{ textAlign: 'center', color: colors.textMuted, padding: spacing.md }}>
                Cargando más…
              </Text>
            ) : null
          }
          renderItem={({ item }) => <CatalogAircraftCard aircraft={item} />}
        />
      )}
    </View>
  );
}
