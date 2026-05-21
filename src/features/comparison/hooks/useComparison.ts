import { useState, useCallback } from 'react';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { comparisonService } from '../services/comparisonService';
import type { ComparisonItem } from '../../../shared/types/comparison.types';

const MAX_ITEMS = 3;

export function useComparison() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addId = useCallback((id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_ITEMS) {
        setError(`Máximo ${MAX_ITEMS} aeronaves`);
        return prev;
      }
      setError(null);
      return [...prev, id];
    });
  }, []);

  const removeId = useCallback((id: number) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    setItems((prev) => prev.filter((x) => x.id !== id));
    setError(null);
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds([]);
    setItems([]);
    setError(null);
  }, []);

  const runCompare = useCallback(async () => {
    if (selectedIds.length < 2) {
      setError('Selecciona al menos 2 aeronaves');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await comparisonService.fetchComparisonData(
        selectedIds.map(String),
      );
      setItems(data);
    } catch (err) {
      setError(getUserFriendlyError(err));
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIds]);

  return {
    selectedIds,
    items,
    isLoading,
    error,
    addId,
    removeId,
    clearAll,
    runCompare,
    maxItems: MAX_ITEMS,
  };
}
