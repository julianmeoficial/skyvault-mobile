import { FilterForm } from '../native/FilterForm';
import type { AircraftFilters } from '../../shared/types/aircraft.types';

interface PlatformFilterFormProps {
  filters: AircraftFilters;
  onChange: (partial: Partial<AircraftFilters>) => void;
}

/** Filtros en React Native puro (Expo Go compatible). */
export function PlatformFilterForm(props: PlatformFilterFormProps) {
  return <FilterForm {...props} />;
}
