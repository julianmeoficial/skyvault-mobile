import type { SpecificationsDto } from '../../../shared/types/aircraft.types';

export type SpecTab = 'dimensions' | 'weights' | 'performance' | 'cabin' | 'engine' | 'fuel' | 'certification';

export interface SpecFieldDef {
  key: keyof SpecificationsDto | '_cruiseKnots' | '_rangeKm';
  label: string;
  unit?: string;
}

export const SPEC_TABS: { id: SpecTab; label: string; fields: SpecFieldDef[] }[] = [
  {
    id: 'dimensions',
    label: 'Dimensiones',
    fields: [
      { key: 'lengthM', label: 'Longitud', unit: 'm' },
      { key: 'wingspanM', label: 'Envergadura', unit: 'm' },
      { key: 'heightM', label: 'Altura', unit: 'm' },
      { key: 'wingAreaM2', label: 'Área alar', unit: 'm²' },
      { key: 'cabinLengthM', label: 'Cabina long.', unit: 'm' },
      { key: 'cabinWidthM', label: 'Cabina ancho', unit: 'm' },
      { key: 'cabinHeightM', label: 'Cabina alto', unit: 'm' },
    ],
  },
  {
    id: 'weights',
    label: 'Pesos',
    fields: [
      { key: 'emptyWeightKg', label: 'Peso vacío', unit: 'kg' },
      { key: 'maxTakeoffWeightKg', label: 'MTOW', unit: 'kg' },
      { key: 'maxLandingWeightKg', label: 'Peso aterrizaje', unit: 'kg' },
      { key: 'maxPayloadKg', label: 'Carga útil', unit: 'kg' },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    fields: [
      { key: 'maxSpeedKmh', label: 'Vel. máxima', unit: 'km/h' },
      { key: '_cruiseKnots', label: 'Crucero', unit: 'kts' },
      { key: 'serviceCeilingM', label: 'Techo servicio', unit: 'm' },
      { key: '_rangeKm', label: 'Alcance', unit: 'km' },
      { key: 'rangeWithMaxPaxKm', label: 'Alcance max pax', unit: 'km' },
      { key: 'rangeWithMaxPayloadKm', label: 'Alcance max carga', unit: 'km' },
      { key: 'takeoffDistanceM', label: 'Despegue', unit: 'm' },
      { key: 'landingDistanceM', label: 'Aterrizaje', unit: 'm' },
    ],
  },
  {
    id: 'cabin',
    label: 'Cabina',
    fields: [
      { key: 'firstClassSeats', label: 'Primera clase', unit: 'asientos' },
      { key: 'businessClassSeats', label: 'Ejecutiva', unit: 'asientos' },
      { key: 'economyClassSeats', label: 'Económica', unit: 'asientos' },
      { key: 'seatPitchEconomyCm', label: 'Pitch econ.', unit: 'cm' },
      { key: 'seatWidthEconomyCm', label: 'Ancho asiento', unit: 'cm' },
      { key: 'cargoVolumeM3', label: 'Volumen carga', unit: 'm³' },
    ],
  },
  {
    id: 'engine',
    label: 'Motor',
    fields: [
      { key: 'engineCount', label: 'Nº motores' },
      { key: 'engineManufacturer', label: 'Fabricante motor' },
      { key: 'engineModel', label: 'Modelo motor' },
      { key: 'engineThrustN', label: 'Empuje', unit: 'N' },
      { key: 'totalThrustN', label: 'Empuje total', unit: 'N' },
    ],
  },
  {
    id: 'fuel',
    label: 'Combustible',
    fields: [
      { key: 'fuelCapacityLiters', label: 'Capacidad', unit: 'L' },
      { key: 'fuelConsumptionLph', label: 'Consumo', unit: 'L/h' },
    ],
  },
  {
    id: 'certification',
    label: 'Certificación',
    fields: [
      { key: 'certificationAuthorities', label: 'Autoridades' },
      { key: 'noiseLevelDb', label: 'Ruido', unit: 'dB' },
    ],
  },
];

export function formatSpecValue(val: string | number | undefined | null): string {
  if (val === undefined || val === null || val === '') return '—';
  const n = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (typeof n === 'number' && !Number.isNaN(n)) {
    return n.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  }
  return String(val);
}
