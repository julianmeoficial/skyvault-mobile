import { useState, useEffect, useCallback } from 'react';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { aircraftService } from '../services/aircraftService';
import type { AircraftDetailDto } from '../../../shared/types/aircraft.types';

export function useAircraftDetail(identifier: string | undefined) {
  const [aircraft, setAircraft] = useState<AircraftDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!identifier) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await aircraftService.getAircraftDetail(identifier);
      setAircraft(data);
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    load();
  }, [load]);

  return { aircraft, isLoading, error, reload: load };
}
