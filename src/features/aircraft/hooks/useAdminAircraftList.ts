import { useCallback, useEffect, useMemo, useState } from 'react';
import { aircraftService } from '../services/aircraftService';
import type { AircraftCardDto } from '../../../shared/types/aircraft.types';

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

interface UseAdminAircraftListState {
  aircraft: AircraftCardDto[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
}

export function useAdminAircraftList() {
  const [state, setState] = useState<UseAdminAircraftListState>({
    aircraft: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
    searchQuery: '',
  });

  const loadAll = useCallback(async (silent = false) => {
    setState((prev) => ({
      ...prev,
      ...(silent ? { isRefreshing: true } : { isLoading: true }),
      error: null,
    }));
    try {
      const all: AircraftCardDto[] = [];
      let page = 0;
      let hasMore = true;

      while (hasMore && page < MAX_PAGES) {
        const batch = await aircraftService.getAircraft(
          { onlyActive: false },
          { field: 'name', direction: 'asc' },
          page,
          PAGE_SIZE,
        );
        all.push(...(batch.content ?? []));
        hasMore = batch.page?.hasNext ?? false;
        page++;
      }

      setState((prev) => ({
        ...prev,
        aircraft: all,
        isLoading: false,
        isRefreshing: false,
        error: null,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: 'No se pudo cargar el listado de aeronaves.',
      }));
    }
  }, []);

  useEffect(() => {
    void loadAll(false);
  }, [loadAll]);

  const setSearchQuery = useCallback((searchQuery: string) => {
    setState((prev) => ({ ...prev, searchQuery }));
  }, []);

  const filteredAircraft = useMemo(() => {
    const q = state.searchQuery.trim().toLowerCase();
    if (!q) return state.aircraft;
    return state.aircraft.filter((a) => {
      const hay = [
        a.name,
        a.model,
        a.displayName,
        a.manufacturer?.name,
        a.family?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [state.aircraft, state.searchQuery]);

  return {
    aircraft: filteredAircraft,
    totalCount: state.aircraft.length,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    searchQuery: state.searchQuery,
    setSearchQuery,
    refresh: () => loadAll(true),
  };
}
