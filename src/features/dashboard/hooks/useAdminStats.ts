import { useCallback, useEffect, useState } from 'react';
import { dashboardAdminService } from '../services/dashboardAdminService';
import type { AdminStats } from '../types/dashboard.types';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setStats(await dashboardAdminService.fetchAdminStats());
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { stats, isLoading, error, refetch };
}
