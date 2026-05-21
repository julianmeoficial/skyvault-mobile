import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { aircraftService } from '../services/aircraftService';
import type {
  AircraftCardDto,
  AircraftFilters,
  ManufacturerSummaryDto,
  SortOption,
} from '../../../shared/types/aircraft.types';
import { countActiveFilters } from '../utils/filterCount';

export function useAircraftCatalog(initialFilters?: Partial<AircraftFilters>) {
  const [aircraft, setAircraft] = useState<AircraftCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [filters, setFilters] = useState<AircraftFilters>({
    onlyActive: true,
    ...initialFilters,
  });

  const [sort, setSort] = useState<SortOption>({
    field: 'name',
    direction: 'asc',
  });

  const appendInFlightRef = useRef(false);
  const hasDataRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [manufacturers, setManufacturers] = useState<ManufacturerSummaryDto[]>([]);

  useEffect(() => {
    hasDataRef.current = aircraft.length > 0;
  }, [aircraft.length]);

  useEffect(() => {
    void aircraftService.getManufacturers(true).then(setManufacturers).catch(() => setManufacturers([]));
  }, []);

  const validatedFilters = useCallback(() => {
    return {
      ...filters,
      searchTerm:
        filters.searchTerm && filters.searchTerm.trim().length >= 2
          ? filters.searchTerm.trim()
          : undefined,
    };
  }, [filters]);

  useEffect(() => {
    const load = async () => {
      const silent = hasDataRef.current;
      try {
        if (silent) setIsRefreshing(true);
        else setIsLoading(true);
        setError(null);

        if (filters.searchTerm && filters.searchTerm.trim().length === 1) {
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        const response = await aircraftService.getAircraft(validatedFilters(), sort, 0, 20);
        setAircraft(response.content);
        setTotalElements(response.page.totalElements);
        setHasMore(response.page.hasNext);
        setCurrentPage(0);
      } catch (err) {
        setError(getUserFriendlyError(err));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };

    const timer = setTimeout(load, 400);
    return () => clearTimeout(timer);
  }, [
    filters.manufacturerId,
    filters.familyId,
    filters.typeId,
    filters.productionStateId,
    filters.sizeCategoryId,
    filters.searchTerm,
    filters.onlyActive,
    filters.minPassengers,
    filters.maxPassengers,
    filters.minRange,
    filters.maxRange,
    sort.field,
    sort.direction,
    reloadKey,
  ]);

  const loadMore = useCallback(async () => {
    if (isLoading || isRefreshing || isLoadingMore || !hasMore || appendInFlightRef.current) return;

    try {
      appendInFlightRef.current = true;
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await aircraftService.getAircraft(
        validatedFilters(),
        sort,
        nextPage,
        20,
      );
      setAircraft((prev) => [...prev, ...response.content]);
      setHasMore(response.page.hasNext);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoadingMore(false);
      appendInFlightRef.current = false;
    }
  }, [currentPage, hasMore, isLoading, isRefreshing, isLoadingMore, validatedFilters, sort]);

  const refresh = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ onlyActive: true });
    setSort({ field: 'name', direction: 'asc' });
    setReloadKey((k) => k + 1);
  }, []);

  const activeFilterCount = countActiveFilters(filters);

  return {
    aircraft,
    isLoading,
    isRefreshing,
    isLoadingMore,
    error,
    totalElements,
    hasMore,
    filters,
    sort,
    manufacturers,
    activeFilterCount,
    setFilters,
    setSort,
    loadMore,
    refresh,
    resetFilters,
  };
}
