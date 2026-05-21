import type { SortOption } from '../../../shared/types/aircraft.types';

export const SORT_OPTIONS: { label: string; value: string; sort: SortOption }[] = [
  { label: 'Nombre A-Z', value: 'name-asc', sort: { field: 'name', direction: 'asc' } },
  { label: 'Nombre Z-A', value: 'name-desc', sort: { field: 'name', direction: 'desc' } },
  { label: 'Más recientes', value: 'introductionYear-desc', sort: { field: 'introductionYear', direction: 'desc' } },
  { label: 'Más antiguos', value: 'introductionYear-asc', sort: { field: 'introductionYear', direction: 'asc' } },
  { label: 'Mayor capacidad', value: 'maxPassengers-desc', sort: { field: 'maxPassengers', direction: 'desc' } },
  { label: 'Mayor alcance', value: 'rangeKm-desc', sort: { field: 'rangeKm', direction: 'desc' } },
];

export function sortValueFromOption(sort: SortOption): string {
  const field = sort.field === 'maxPassengers' ? 'maxPassengers' : sort.field;
  return `${field}-${sort.direction}`;
}

export function sortFromValue(value: string): SortOption {
  const found = SORT_OPTIONS.find((o) => o.value === value);
  return found?.sort ?? { field: 'name', direction: 'asc' };
}
