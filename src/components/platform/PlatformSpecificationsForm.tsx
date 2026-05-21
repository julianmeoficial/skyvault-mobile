import { SpecificationsList } from '../native/SpecificationsList';
import type { AircraftDetailDto } from '../../shared/types/aircraft.types';

interface PlatformSpecificationsFormProps {
  aircraft: AircraftDetailDto;
}

export function PlatformSpecificationsForm({ aircraft }: PlatformSpecificationsFormProps) {
  return (
    <SpecificationsList
      specs={aircraft.specifications}
      serviceCeilingFt={aircraft.serviceCeilingFt}
      typicalPassengers={aircraft.typicalPassengers}
      maxPassengers={aircraft.maxPassengers}
      rangeKm={aircraft.rangeKm}
    />
  );
}
