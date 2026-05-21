import type {
  AircraftCreatePayload,
  AircraftDetailDto,
  CatalogSummaryDto,
  TypeDto,
} from '../../../shared/types/aircraft.types';

export function isCargoAircraftType(type: Pick<TypeDto, 'name' | 'code'> | null | undefined): boolean {
  if (!type?.name) return false;
  const name = type.name.toLowerCase();
  const code = (type.code ?? '').toLowerCase();
  return (
    name.includes('carguero') ||
    name.includes('cargo') ||
    name.includes('freight') ||
    code.includes('cargo') ||
    code.includes('carg')
  );
}

export function resolveIsCargoType(typeId: number, types: TypeDto[]): boolean {
  if (!typeId) return false;
  const found = types.find((t) => t.id === typeId);
  return isCargoAircraftType(found);
}

export function extractPrimaryImageUrl(d: AircraftDetailDto): string {
  const images = d.images;
  if (!images?.length) return '';
  const primary =
    images.find((i) => i.isPrimary) ??
    images.find((i) => i.imageType === 'main') ??
    images[0];
  return primary?.url?.trim() ?? '';
}

function resolveFormName(d: AircraftDetailDto): string {
  const rawName = (d.name ?? '').trim();
  const model = (d.model ?? '').trim();
  const displayName = (d.displayName ?? '').trim();
  if (!rawName || !model || rawName.toLowerCase() !== model.toLowerCase()) {
    return rawName;
  }
  if (displayName && displayName.toLowerCase() !== model.toLowerCase()) {
    return displayName;
  }
  const manufacturer = d.manufacturer?.name?.trim();
  return manufacturer ? `${manufacturer} ${model}` : rawName;
}

export function detailToCreatePayload(d: AircraftDetailDto): AircraftCreatePayload {
  const imageUrl = extractPrimaryImageUrl(d);
  return {
    name: resolveFormName(d),
    model: d.model ?? '',
    displayName: d.displayName,
    description: d.description,
    manufacturerId: d.manufacturer?.id ?? 0,
    familyId: d.family?.id ?? 0,
    typeId: d.type?.id ?? 0,
    productionStateId: d.productionState?.id ?? 0,
    sizeCategoryId: d.sizeCategory?.id ?? 0,
    introductionYear: d.introductionYear ?? new Date().getFullYear(),
    firstFlightDate: d.firstFlightDate?.slice(0, 10),
    typicalPassengers: d.typicalPassengers ?? 0,
    maxPassengers: d.maxPassengers ?? 0,
    rangeKm: d.rangeKm ?? 0,
    cruiseSpeedKnots: d.cruiseSpeedKnots ?? 0,
    serviceCeilingFt: d.serviceCeilingFt,
    minCrew: d.minCrew,
    isActive: d.isActive !== false,
    primaryImageUrl: imageUrl || undefined,
  };
}

export function applyCargoPassengers(
  form: AircraftCreatePayload,
  types: TypeDto[],
): AircraftCreatePayload {
  if (!resolveIsCargoType(form.typeId, types)) return form;
  return { ...form, typicalPassengers: 0, maxPassengers: 0 };
}

function validatePassengerCounts(
  typical: number,
  max: number,
  isCargo: boolean,
): string | null {
  if (!Number.isFinite(typical) || !Number.isFinite(max)) {
    return 'Indica valores numéricos válidos para la capacidad.';
  }
  if (typical < 0 || max < 0) return 'La capacidad no puede ser negativa.';
  if (typical > 1000 || max > 1000) return 'La capacidad no puede superar 1000.';
  if (max < typical) return 'Los pasajeros máximos no pueden ser menores que los típicos.';
  if (isCargo) {
    if (typical !== 0 || max !== 0) {
      return 'Las aeronaves de carga usan 0 pasajeros típicos y 0 máximos.';
    }
    return null;
  }
  if (typical === 0 && max === 0) {
    return 'Indica al menos 1 pasajero o selecciona el tipo «Carguero».';
  }
  if (typical < 1) return 'Los pasajeros típicos deben ser al menos 1.';
  if (max < 1) return 'Los pasajeros máximos deben ser al menos 1.';
  return null;
}

export function validateAircraftFormStep(
  step: number,
  form: AircraftCreatePayload,
  catalog: CatalogSummaryDto | null,
): string | null {
  const types = catalog?.types ?? [];
  const isCargo = resolveIsCargoType(form.typeId, types);

  if (step === 0) {
    if (!form.name.trim()) return 'El nombre es obligatorio.';
    if (!form.model.trim()) return 'El modelo es obligatorio.';
  }
  if (step === 1) {
    if (!form.manufacturerId) return 'Selecciona un fabricante.';
    if (!form.familyId) return 'Selecciona una familia.';
    if (!form.typeId) return 'Selecciona un tipo de aeronave.';
    if (!form.productionStateId) return 'Selecciona un estado de producción.';
    if (!form.sizeCategoryId) return 'Selecciona una categoría de tamaño.';
  }
  if (step === 2) {
    const year = form.introductionYear;
    if (!Number.isFinite(year) || year < 1900 || year > 2030) {
      return 'El año de introducción debe estar entre 1900 y 2030.';
    }
    const paxErr = validatePassengerCounts(
      form.typicalPassengers,
      form.maxPassengers,
      isCargo,
    );
    if (paxErr) return paxErr;
    if (!Number.isFinite(form.rangeKm) || form.rangeKm < 100) {
      return 'El alcance debe ser al menos 100 km.';
    }
    if (!Number.isFinite(form.cruiseSpeedKnots) || form.cruiseSpeedKnots < 100) {
      return 'La velocidad de crucero debe ser al menos 100 nudos.';
    }
    if (form.serviceCeilingFt != null && form.serviceCeilingFt > 0) {
      if (form.serviceCeilingFt < 1000 || form.serviceCeilingFt > 60000) {
        return 'El techo de servicio debe estar entre 1000 y 60000 ft.';
      }
    }
    if (form.minCrew != null && form.minCrew > 0) {
      if (form.minCrew < 1 || form.minCrew > 10) {
        return 'La tripulación mínima debe estar entre 1 y 10.';
      }
    }
  }
  if (step === 3) {
    const url = (form.primaryImageUrl ?? '').trim();
    if (url && !url.startsWith('https://')) {
      return 'La dirección de la imagen debe ser segura (empezar por https://).';
    }
  }
  return null;
}

export function validateAircraftForm(
  form: AircraftCreatePayload,
  catalog: CatalogSummaryDto | null,
): string | null {
  for (let step = 0; step <= 3; step++) {
    const err = validateAircraftFormStep(step, form, catalog);
    if (err) return err;
  }
  return null;
}
