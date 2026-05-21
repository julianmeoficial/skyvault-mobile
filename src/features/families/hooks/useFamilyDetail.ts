import { useCallback, useEffect, useState } from 'react';
import { familyService } from '../services/familyService';
import type { FamilyDto, FamilyAircraftCardDto } from '../types/family.types';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';

export function useFamilyDetail(familyId: number | undefined) {
  const [family, setFamily] = useState<FamilyDto | null>(null);
  const [aircraft, setAircraft] = useState<FamilyAircraftCardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!familyId || Number.isNaN(familyId)) {
      setError('Familia no válida');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const [familyData, aircraftData] = await Promise.all([
        familyService.getFamilyById(familyId),
        familyService.getFamilyAircraft(familyId),
      ]);
      setFamily(familyData);
      setAircraft(aircraftData);
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  }, [familyId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { family, aircraft, isLoading, error, reload: load };
}
