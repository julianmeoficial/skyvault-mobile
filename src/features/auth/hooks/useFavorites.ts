import { useCallback, useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { userService } from '../services/userService';
import type { AircraftSummaryDto } from '../services/userService';

interface UseFavoritesState {
  favorites: AircraftSummaryDto[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

interface UseFavoritesOptions {
  enabled?: boolean;
}

function extractApiMessage(err: unknown): string | null {
  if (err instanceof AxiosError) {
    const detail = err.response?.data as { detail?: string } | undefined;
    if (typeof detail?.detail === 'string' && detail.detail.length > 0) {
      return detail.detail;
    }
  }
  return null;
}

export function useFavorites(options?: UseFavoritesOptions) {
  const enabled = options?.enabled ?? true;

  const [state, setState] = useState<UseFavoritesState>({
    favorites: [],
    isLoading: enabled,
    isRefreshing: false,
    error: null,
  });

  const fetchFavorites = useCallback(
    async (silent = false) => {
      if (!enabled) return;

      setState((prev) => ({
        ...prev,
        isLoading: silent ? prev.isLoading : prev.favorites.length === 0,
        isRefreshing: silent && prev.favorites.length > 0,
        error: null,
      }));
      try {
        const favorites = await userService.getFavorites();
        setState({ favorites, isLoading: false, isRefreshing: false, error: null });
      } catch (err) {
        const apiMsg = extractApiMessage(err);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: apiMsg ?? 'No se pudieron cargar los favoritos.',
        }));
      }
    },
    [enabled],
  );

  const addFavorite = useCallback(
    async (aircraftId: number): Promise<void> => {
      setState((prev) => ({ ...prev, error: null }));
      try {
        await userService.addFavorite(aircraftId);
        await fetchFavorites(true);
      } catch (err) {
        const apiMsg = extractApiMessage(err);
        setState((prev) => ({
          ...prev,
          error: apiMsg ?? 'No se pudo agregar a favoritos.',
        }));
      }
    },
    [fetchFavorites],
  );

  const removeFavorite = useCallback(
    async (aircraftId: number): Promise<void> => {
      setState((prev) => ({
        ...prev,
        error: null,
        favorites: prev.favorites.filter((f) => f.id !== aircraftId),
      }));
      try {
        await userService.removeFavorite(aircraftId);
      } catch (err) {
        await fetchFavorites(true);
        const apiMsg = extractApiMessage(err);
        setState((prev) => ({
          ...prev,
          error: apiMsg ?? 'No se pudo eliminar de favoritos.',
        }));
      }
    },
    [fetchFavorites],
  );

  const isFavorite = useCallback(
    (aircraftId: number): boolean => state.favorites.some((f) => f.id === aircraftId),
    [state.favorites],
  );

  const toggleFavorite = useCallback(
    async (aircraftId: number): Promise<void> => {
      if (isFavorite(aircraftId)) {
        await removeFavorite(aircraftId);
      } else {
        await addFavorite(aircraftId);
      }
    },
    [isFavorite, addFavorite, removeFavorite],
  );

  useEffect(() => {
    if (enabled) {
      void fetchFavorites(false);
    } else {
      setState({ favorites: [], isLoading: false, isRefreshing: false, error: null });
    }
  }, [enabled, fetchFavorites]);

  return {
    favorites: state.favorites,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    refetch: () => fetchFavorites(true),
  };
}
