import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { statisticsService } from '../services/statisticsService';
import type {
  SystemStatisticsDto,
  AircraftStatisticsDto,
  AircraftPopularityDto,
  ComparisonPopularityDto,
} from '../../../shared/types/statistics.types';

export function useStatistics() {
  const [system, setSystem] = useState<SystemStatisticsDto | null>(null);
  const [aircraft, setAircraft] = useState<AircraftStatisticsDto | null>(null);
  const [popular, setPopular] = useState<AircraftPopularityDto[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonPopularityDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDataRef = useRef(false);

  useEffect(() => {
    hasDataRef.current = system != null;
  }, [system]);

  const load = useCallback(async (silent = false) => {
    const silentLoad = silent && hasDataRef.current;
    if (silentLoad) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const [sys, ac, pop, comp] = await Promise.all([
        statisticsService.getSystemStatistics(),
        statisticsService.getAircraftStatistics(),
        statisticsService.getPopularAircraft(8),
        statisticsService.getPopularComparisons(5),
      ]);
      setSystem(sys);
      setAircraft(ac);
      setPopular(pop);
      setComparisons(comp);
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load(false);
  }, [load]);

  return {
    system,
    aircraft,
    popular,
    comparisons,
    isLoading,
    isRefreshing,
    error,
    reload: () => load(true),
  };
}
