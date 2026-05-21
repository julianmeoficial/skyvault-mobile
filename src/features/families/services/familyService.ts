import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type { PagedResponse } from '../../../shared/types/api.types';
import type { FamilyDto, FamilyAircraftCardDto } from '../types/family.types';

export const familyService = {
  async getAllFamilies(params?: {
    page?: number;
    size?: number;
    manufacturerId?: number;
  }): Promise<PagedResponse<FamilyDto>> {
    const { data } = await api.get<PagedResponse<FamilyDto>>(API.FAMILIES.LIST, {
      params: { page: params?.page ?? 0, size: params?.size ?? 20, manufacturerId: params?.manufacturerId },
    });
    return data;
  },

  async getFamilyById(id: number): Promise<FamilyDto> {
    const { data } = await api.get<FamilyDto>(API.FAMILIES.DETAIL(id));
    return data;
  },

  async getFamiliesSummary(manufacturerId: number): Promise<FamilyDto[]> {
    const { data } = await api.get<FamilyDto[]>(API.FAMILIES.SUMMARY, {
      params: { manufacturerId },
    });
    return Array.isArray(data) ? data : [];
  },

  async getFamilyAircraft(id: number, page = 0, size = 20): Promise<FamilyAircraftCardDto[]> {
    const { data } = await api.get<FamilyAircraftCardDto[]>(API.FAMILIES.AIRCRAFT(id), {
      params: { page, size },
    });
    return data;
  },
};
