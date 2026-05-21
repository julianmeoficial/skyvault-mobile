import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getComparisonStorageUserId,
  getRecentComparisonRows,
  getUserComparisonCount,
} from '../utils/compareHistory';
import type { RecentComparisonRow } from '../types/dashboard.types';

export function useUserComparisonInsights() {
  const { user, isAuthenticated } = useAuth();
  const storageUserId = isAuthenticated ? getComparisonStorageUserId(user) : null;

  const [userComparisonCount, setUserComparisonCount] = useState(0);
  const [recentRows, setRecentRows] = useState<RecentComparisonRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshLocalHistory = useCallback(async () => {
    if (!storageUserId) {
      setUserComparisonCount(0);
      setRecentRows([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [count, rows] = await Promise.all([
      getUserComparisonCount(storageUserId),
      getRecentComparisonRows(storageUserId),
    ]);
    setUserComparisonCount(count);
    setRecentRows(rows);
    setIsLoading(false);
  }, [storageUserId]);

  useEffect(() => {
    void refreshLocalHistory();
  }, [refreshLocalHistory]);

  return { userComparisonCount, recentRows, isLoading, refreshLocalHistory };
}
