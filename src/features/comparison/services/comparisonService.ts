import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type {
  AircraftOption,
  ComparisonItem,
  GroupedAircraft,
  GroupedAircraftMap,
} from '../../../shared/types/comparison.types';
import type { AircraftCardDto } from '../../../shared/types/aircraft.types';
import type { PagedResponse } from '../../../shared/types/api.types';

interface CompareResultDto {
  aircraft: ComparisonItem[];
}

interface SearchSuggestionDto {
  id?: number | string;
  aircraftId?: number | string;
  name?: string;
  label?: string;
  model?: string;
  subtitle?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  model: string;
}

function parseSpecNum(v?: string): number | undefined {
  if (v === undefined || v === null || v === '') return undefined;
  const n = parseFloat(String(v).replace(/,/g, ''));
  return Number.isNaN(n) ? undefined : n;
}

function flattenComparisonItem(item: ComparisonItem): ComparisonItem {
  const s = item.specifications;
  if (!s) return item;
  return {
    ...item,
    lengthMeters: item.lengthMeters ?? parseSpecNum(s.lengthM),
    wingspanMeters: item.wingspanMeters ?? parseSpecNum(s.wingspanM),
    heightM: item.heightM ?? parseSpecNum(s.heightM),
    wingAreaM2: item.wingAreaM2 ?? parseSpecNum(s.wingAreaM2),
    emptyWeightKg: item.emptyWeightKg ?? parseSpecNum(s.emptyWeightKg),
    maxTakeoffWeightKg: item.maxTakeoffWeightKg ?? parseSpecNum(s.maxTakeoffWeightKg),
    maxSpeedKmh: item.maxSpeedKmh ?? parseSpecNum(s.maxSpeedKmh),
    serviceCeilingM: item.serviceCeilingM ?? parseSpecNum(s.serviceCeilingM),
    rangeWithMaxPaxKm: item.rangeWithMaxPaxKm ?? parseSpecNum(s.rangeWithMaxPaxKm),
    rangeWithMaxPayloadKm: item.rangeWithMaxPayloadKm ?? parseSpecNum(s.rangeWithMaxPayloadKm),
    takeoffDistanceM: item.takeoffDistanceM ?? parseSpecNum(s.takeoffDistanceM),
    landingDistanceM: item.landingDistanceM ?? parseSpecNum(s.landingDistanceM),
    engineManufacturer: item.engineManufacturer ?? s.engineManufacturer,
    engineModel: item.engineModel ?? s.engineModel,
    engineCount: item.engineCount ?? parseSpecNum(s.engineCount),
    engineThrustN: item.engineThrustN ?? parseSpecNum(s.engineThrustN),
    fuelCapacityLiters: item.fuelCapacityLiters ?? parseSpecNum(s.fuelCapacityLiters),
    firstClassSeats: item.firstClassSeats ?? parseSpecNum(s.firstClassSeats),
    businessClassSeats: item.businessClassSeats ?? parseSpecNum(s.businessClassSeats),
    economyClassSeats: item.economyClassSeats ?? parseSpecNum(s.economyClassSeats),
    cargoVolumeM3: item.cargoVolumeM3 ?? parseSpecNum(s.cargoVolumeM3),
  };
}

export const comparisonService = {
  async fetchComparisonData(ids: string[]): Promise<ComparisonItem[]> {
    if (ids.length < 2 || ids.length > 3) {
      throw new Error('Selecciona entre 2 y 3 aeronaves para comparar');
    }

    const { data } = await api.get<CompareResultDto | ComparisonItem[]>(
      API.AIRCRAFT.COMPARE,
      {
        params: {
          ids: ids.join(','),
          includeSpecifications: 'true',
          includeImages: 'true',
          normalizeUnits: 'true',
          unitFormat: 'metric',
        },
      },
    );

    const raw =
      typeof data === 'object' && data !== null && 'aircraft' in data && Array.isArray(data.aircraft)
        ? data.aircraft
        : Array.isArray(data)
          ? data
          : null;
    if (raw) return raw.map(flattenComparisonItem);
    throw new Error('Formato de respuesta inválido');
  },

  async searchAircraft(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const { data } = await api.get<SearchSuggestionDto[]>(API.SEARCH.SUGGEST, {
      params: { q: query.trim(), limit: 10, type: 'aircraft', onlyActive: 'true' },
    });

    if (!Array.isArray(data)) return [];

    return data.map((item) => ({
      id: String(item.id ?? item.aircraftId ?? ''),
      name: String(item.name ?? item.label ?? ''),
      model: String(item.model ?? item.subtitle ?? ''),
    }));
  },

  cardToOption(aircraft: AircraftCardDto | ComparisonItem): AircraftOption {
    return {
      id: Number(aircraft.id),
      name: aircraft.name,
      model: aircraft.model ?? '',
      displayName: aircraft.displayName ?? aircraft.name,
      manufacturer: aircraft.manufacturer ?? { id: 0, name: 'Otro' },
      family: aircraft.family ?? { id: 0, name: '' },
      thumbnailUrl: aircraft.thumbnailUrl,
      typicalPassengers:
        (aircraft as ComparisonItem).typicalPassengers ??
        (aircraft as ComparisonItem).typical_passengers,
      rangeKm: (aircraft as ComparisonItem).rangeKm ?? (aircraft as ComparisonItem).range_km,
    };
  },

  groupByManufacturer(options: AircraftOption[]): GroupedAircraftMap {
    const map: GroupedAircraftMap = {};
    options.forEach((o) => {
      const key = o.manufacturer?.name ?? 'Otros';
      if (!map[key]) map[key] = [];
      map[key].push(o);
    });
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => a.displayName.localeCompare(b.displayName, 'es'));
    });
    return map;
  },

  async fetchAllAircraftOptions(params?: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<{ options: AircraftOption[]; hasMore: boolean; total: number }> {
    const search = params?.search?.trim();
    const page = params?.page ?? 0;
    const size = params?.size ?? 50;

    if (search && search.length >= 2) {
      const { data } = await api.get<AircraftCardDto[]>(API.AIRCRAFT.SEARCH, {
        params: { q: search, limit: size },
      });
      const list = Array.isArray(data) ? data : [];
      return {
        options: list.map((a) => this.cardToOption(a)),
        hasMore: false,
        total: list.length,
      };
    }

    const { data } = await api.get<PagedResponse<AircraftCardDto>>(API.AIRCRAFT.LIST, {
      params: { size, page, onlyActive: true, sortField: 'name', sortDirection: 'ASC' },
    });
    const content = data.content ?? [];
    return {
      options: content.map((a) => this.cardToOption(a)),
      hasMore: data.page?.hasNext ?? false,
      total: data.page?.totalElements ?? content.length,
    };
  },

  async getGroupedAircraft(): Promise<GroupedAircraft> {
    const all: AircraftOption[] = [];
    let page = 0;
    let hasMore = true;
    while (hasMore && page < 20) {
      const batch = await this.fetchAllAircraftOptions({ page, size: 100 });
      all.push(...batch.options);
      hasMore = batch.hasMore;
      page++;
    }
    const map = this.groupByManufacturer(all);
    return {
      Airbus: map.Airbus ?? [],
      Boeing: map.Boeing ?? [],
    };
  },

  async getGroupedAircraftMap(): Promise<GroupedAircraftMap> {
    const all: AircraftOption[] = [];
    let page = 0;
    let hasMore = true;
    while (hasMore && page < 20) {
      const batch = await this.fetchAllAircraftOptions({ page, size: 100 });
      all.push(...batch.options);
      hasMore = batch.hasMore;
      page++;
    }
    return this.groupByManufacturer(all);
  },
};
