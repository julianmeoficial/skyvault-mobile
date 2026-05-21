import type { AircraftFilters } from '../../../shared/types/aircraft.types';

export function countActiveFilters(filters: AircraftFilters): number {
  let n = 0;
  if (filters.manufacturerId) n++;
  if (filters.familyId) n++;
  if (filters.typeId) n++;
  if (filters.productionStateId) n++;
  if (filters.sizeCategoryId) n++;
  if (filters.minPassengers != null) n++;
  if (filters.maxPassengers != null) n++;
  if (filters.minRange != null) n++;
  if (filters.maxRange != null) n++;
  if (filters.onlyActive === false) n++;
  return n;
}
