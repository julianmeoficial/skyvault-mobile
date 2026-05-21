import { useMemo, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { useStatistics } from '../hooks/useStatistics';
import { StatsSegmentSlider, type StatsSegment, SEGMENT_ORDER } from './StatsSegmentSlider';
import { StatsKpiCarousel, type KpiCardData } from './StatsKpiCarousel';
import { StatsRankingList } from './StatsRankingList';
import { SkeletonLoader } from '../../../components/native/SkeletonLoader';
import { EmptyState } from '../../../components/native/EmptyState';
import { useTheme } from '../../../theme';

function segmentFromIndex(index: number): StatsSegment {
  return SEGMENT_ORDER[Math.max(0, Math.min(index, SEGMENT_ORDER.length - 1))] ?? 'range';
}

export function AdminStatsScreen() {
  const { colors, spacing } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const segment = segmentFromIndex(activeIndex);
  const { system, aircraft, popular, isLoading, isRefreshing, error, reload } = useStatistics();

  const onSegmentChange = useCallback((s: StatsSegment) => {
    const idx = SEGMENT_ORDER.indexOf(s);
    if (idx >= 0) setActiveIndex(idx);
  }, []);

  const kpiCards = useMemo((): KpiCardData[] => {
    const top = popular[0];
    return [
      {
        id: 'range',
        title: 'Alcance',
        value: aircraft?.averageRange?.toFixed(0) ?? '—',
        unit: 'km',
        trend: `Catálogo: ${system?.totalAircraft ?? '—'} aeronaves`,
        leaderName: aircraft?.longestRangeAircraft ?? top?.aircraftName ?? '—',
        leaderValue: aircraft?.averageRange ? `${aircraft.averageRange.toFixed(0)} km medio` : undefined,
        progress: 0.92,
      },
      {
        id: 'seats',
        title: 'Asientos',
        value: aircraft?.averagePassengers?.toFixed(0) ?? '—',
        unit: 'pax típicos',
        trend: `${system?.totalFamilies ?? '—'} familias`,
        leaderName: aircraft?.largestAircraft ?? top?.aircraftName,
        progress: 0.78,
      },
      {
        id: 'efficiency',
        title: 'Actividad',
        value: String(system?.totalSearches ?? '—'),
        unit: 'búsquedas',
        trend: `${system?.totalComparisons ?? '—'} comparaciones`,
        leaderName: top?.aircraftName,
        progress: 0.65,
      },
    ];
  }, [system, aircraft, popular]);

  const ranking = useMemo(() => {
    return popular.slice(0, 7).map((p, i) => ({
      rank: i + 1,
      name: p.aircraftName ?? '—',
      value:
        segment === 'range'
          ? `${p.viewCount ?? p.searchCount ?? 0} vistas`
          : segment === 'seats'
            ? `${p.comparisonCount ?? 0} comp.`
            : p.manufacturerName ?? `${p.popularityScore ?? 0}`,
    }));
  }, [popular, segment]);

  if (isLoading && !system) return <SkeletonLoader count={2} />;

  if (error) {
    return <EmptyState title="Estadísticas" message={error} actionLabel="Reintentar" onAction={reload} />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bgMain }}
      contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => void reload()} tintColor={colors.primary} />
      }
    >
      <StatsSegmentSlider value={segment} onChange={onSegmentChange} />
      <StatsKpiCarousel cards={kpiCards} activeIndex={activeIndex} onIndexChange={setActiveIndex} />
      <StatsRankingList rows={ranking} />
    </ScrollView>
  );
}
