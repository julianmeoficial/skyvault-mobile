import type { ComparisonItem } from '../../../shared/types/comparison.types';
import { productionStateLabel } from '../../../shared/copy/productionStateLabel';

export interface ComparisonSpecRow {
  label: string;
  unit?: string;
  getValue: (item: ComparisonItem) => string | number | null | undefined;
}

export const COMPARISON_SPEC_SECTIONS: { title: string; specs: ComparisonSpecRow[] }[] = [
  {
    title: 'GENERAL',
    specs: [
      { label: 'Nombre', getValue: (i) => i.name ?? i.displayName },
      { label: 'Fabricante', getValue: (i) => i.manufacturer?.name ?? i.manufacturer_name },
      { label: 'Familia', getValue: (i) => i.family?.name },
      { label: 'Tipo', getValue: (i) => i.type?.name ?? i.aircraft_type?.name },
      {
        label: 'Estado',
        getValue: (i) =>
          productionStateLabel(i.productionState?.name ?? i.production_state?.name),
      },
      { label: 'Categoría', getValue: (i) => i.sizeCategory?.name },
      { label: 'Introducción', getValue: (i) => i.introductionYear ?? i.introduction_year },
    ],
  },
  {
    title: 'RENDIMIENTO',
    specs: [
      { label: 'Alcance', unit: 'km', getValue: (i) => i.rangeKm ?? i.range_km },
      { label: 'Crucero', unit: 'kts', getValue: (i) => i.cruiseSpeedKnots ?? i.cruise_speed_knots },
      { label: 'Vel. máx.', unit: 'km/h', getValue: (i) => i.maxSpeedKmh },
      { label: 'Techo servicio', unit: 'm', getValue: (i) => i.serviceCeilingM },
      { label: 'Alcance max pax', unit: 'km', getValue: (i) => i.rangeWithMaxPaxKm },
      { label: 'Alcance max carga', unit: 'km', getValue: (i) => i.rangeWithMaxPayloadKm },
      { label: 'Despegue', unit: 'm', getValue: (i) => i.takeoffDistanceM },
      { label: 'Aterrizaje', unit: 'm', getValue: (i) => i.landingDistanceM },
    ],
  },
  {
    title: 'CAPACIDAD',
    specs: [
      { label: 'Pax máx.', getValue: (i) => i.maxPassengers ?? i.max_passengers },
      { label: 'Pax típ.', getValue: (i) => i.typicalPassengers ?? i.typical_passengers },
      { label: 'Primera clase', getValue: (i) => i.firstClassSeats },
      { label: 'Ejecutiva', getValue: (i) => i.businessClassSeats },
      { label: 'Económica', getValue: (i) => i.economyClassSeats },
      { label: 'Carga', unit: 'm³', getValue: (i) => i.cargoVolumeM3 },
    ],
  },
  {
    title: 'DIMENSIONES',
    specs: [
      { label: 'Longitud', unit: 'm', getValue: (i) => i.lengthMeters ?? i.length_meters },
      { label: 'Envergadura', unit: 'm', getValue: (i) => i.wingspanMeters ?? i.wingspan_meters },
      { label: 'Altura', unit: 'm', getValue: (i) => i.heightM },
      { label: 'Área alar', unit: 'm²', getValue: (i) => i.wingAreaM2 },
      { label: 'MTOW', unit: 'kg', getValue: (i) => i.maxTakeoffWeightKg },
      { label: 'Peso vacío', unit: 'kg', getValue: (i) => i.emptyWeightKg },
    ],
  },
  {
    title: 'MOTOR',
    specs: [
      { label: 'Nº motores', getValue: (i) => i.engineCount },
      { label: 'Fabricante', getValue: (i) => i.engineManufacturer ?? i.engine_manufacturer },
      { label: 'Modelo', getValue: (i) => i.engineModel ?? i.engine_model },
      { label: 'Empuje', unit: 'N', getValue: (i) => i.engineThrustN },
      { label: 'Combustible', unit: 'L', getValue: (i) => i.fuelCapacityLiters },
    ],
  },
];
