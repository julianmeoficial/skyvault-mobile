import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type { PagedResponse } from '../../../shared/types/api.types';
import type {
  AircraftCardDto,
  AircraftCreatePayload,
  AircraftDetailDto,
  AircraftFilters,
  AircraftUpdatePayload,
  CatalogSummaryDto,
  ManufacturerSummaryDto,
  SizeCategoryDto,
  SortOption,
} from '../../../shared/types/aircraft.types';

export type PagedResponseDto<T> = PagedResponse<T>;

const MANUFACTURER_FALLBACK: ManufacturerSummaryDto[] = [
  { id: 1, name: 'Airbus', code: 'AIR', country: 'France/Germany', aircraftCount: 18 },
  { id: 2, name: 'Boeing', code: 'BA', country: 'United States', aircraftCount: 18 },
];

export const aircraftService = {
  async getAircraft(
    filters?: AircraftFilters,
    sort?: SortOption,
    page = 0,
    size = 20,
  ): Promise<PagedResponseDto<AircraftCardDto>> {
    const params: Record<string, unknown> = { page, size };

    if (filters) {
      if (filters.manufacturerId) params.manufacturerId = filters.manufacturerId;
      if (filters.familyId) params.familyId = filters.familyId;
      if (filters.typeId) params.typeId = filters.typeId;
      if (filters.productionStateId) params.productionStateId = filters.productionStateId;
      if (filters.sizeCategoryId) params.sizeCategoryId = filters.sizeCategoryId;
      if (filters.minPassengers != null) params.minPassengers = filters.minPassengers;
      if (filters.maxPassengers != null) params.maxPassengers = filters.maxPassengers;
      if (filters.minRange != null) params.minRange = filters.minRange;
      if (filters.maxRange != null) params.maxRange = filters.maxRange;
      if (filters.searchTerm?.trim()) params.searchTerm = filters.searchTerm.trim();
      if (filters.onlyActive !== undefined) params.onlyActive = filters.onlyActive;
    }

    if (sort) {
      params.sortField = sort.field;
      params.sortDirection = sort.direction.toUpperCase();
    }

    const { data } = await api.get<PagedResponseDto<AircraftCardDto>>(
      API.AIRCRAFT.LIST,
      { params },
    );
    return data;
  },

  async getAllAircraft(): Promise<AircraftCardDto[]> {
    const response = await this.getAircraft({ onlyActive: true }, undefined, 0, 100);
    return response.content;
  },

  async getAircraftByManufacturer(manufacturerId: number): Promise<AircraftCardDto[]> {
    const response = await this.getAircraft(
      { manufacturerId, onlyActive: true },
      undefined,
      0,
      100,
    );
    return response.content;
  },

  async searchAircraft(query: string, limit = 20): Promise<AircraftCardDto[]> {
    if (!query || query.trim().length < 2) return [];
    const { data } = await api.get<AircraftCardDto[]>(API.AIRCRAFT.SEARCH, {
      params: { q: query.trim(), limit },
    });
    return data;
  },

  async getAircraftDetail(identifier: string | number): Promise<AircraftDetailDto> {
    const { data } = await api.get<AircraftDetailDto>(API.AIRCRAFT.DETAIL(identifier));
    return data;
  },

  async getFeaturedAircraft(limit = 6): Promise<AircraftCardDto[]> {
    try {
      const { data } = await api.get<AircraftCardDto[]>(API.AIRCRAFT.FEATURED, {
        params: { limit },
      });
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  async getManufacturers(onlyActive = true): Promise<ManufacturerSummaryDto[]> {
    try {
      const { data } = await api.get<ManufacturerSummaryDto[]>(API.MANUFACTURERS.SUMMARY, {
        params: { onlyActive },
      });
      return data?.length ? data : MANUFACTURER_FALLBACK;
    } catch {
      return MANUFACTURER_FALLBACK;
    }
  },

  async getCatalogSummary(): Promise<CatalogSummaryDto> {
    const { data } = await api.get<CatalogSummaryDto>(API.CATALOG.ALL);
    return data;
  },

  async determineSizeCategory(passengers: number): Promise<SizeCategoryDto> {
    const { data } = await api.get<SizeCategoryDto>(API.CATALOG.DETERMINE_SIZE, {
      params: { passengers },
    });
    return data;
  },

  async createAircraft(payload: AircraftCreatePayload): Promise<AircraftDetailDto> {
    const { data } = await api.post<AircraftDetailDto>(API.AIRCRAFT.LIST, payload);
    return data;
  },

  async updateAircraft(id: number, payload: AircraftUpdatePayload): Promise<AircraftDetailDto> {
    const { data } = await api.put<AircraftDetailDto>(API.AIRCRAFT.DETAIL(id), payload);
    return data;
  },

  async deleteAircraft(id: number): Promise<void> {
    await api.delete(API.AIRCRAFT.DETAIL(id));
  },
};
