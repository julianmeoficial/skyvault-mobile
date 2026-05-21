import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type { PagedResponse } from '../../../shared/types/api.types';
import type { AircraftUpdateDto } from '../types/dashboard.types';

function springPageToPaged<T>(data: unknown): PagedResponse<T> {
  if (Array.isArray(data)) {
    const n = data.length;
    return {
      content: data as T[],
      page: {
        number: 0,
        size: n,
        totalElements: n,
        totalPages: 1,
        first: true,
        last: true,
        hasPrevious: false,
        hasNext: false,
      },
    };
  }
  const p = data as {
    content?: T[];
    totalElements?: number;
    totalPages?: number;
    number?: number;
    size?: number;
    last?: boolean;
    first?: boolean;
  };
  const total = p.totalElements ?? p.content?.length ?? 0;
  const size = p.size ?? 20;
  const number = p.number ?? 0;
  return {
    content: p.content ?? [],
    page: {
      number,
      size,
      totalElements: total,
      totalPages: p.totalPages ?? 1,
      first: p.first ?? number === 0,
      last: p.last ?? true,
      hasPrevious: number > 0,
      hasNext: !(p.last ?? true),
    },
  };
}

export type UpdateType = 'Feature' | 'Security' | 'Update' | 'Fix';
export type UpdateAudience = 'All' | 'Admin Only' | 'Beta';

export interface UpdateFormMeta {
  version: string;
  type: UpdateType;
  audience: UpdateAudience;
  title: string;
  description: string;
  aircraftModelId: number;
  categoryId: number;
}

export interface CreateUpdatePayload {
  title: string;
  content: string;
  aircraftModelId: number;
  categoryId: number;
}

export interface RejectUpdatePayload {
  reason: string;
}

export interface UpdateCategoryDto {
  id: number;
  name: string;
  description?: string;
}

export function buildUpdateContent(form: Pick<UpdateFormMeta, 'version' | 'type' | 'audience' | 'description'>): string {
  const version = form.version.trim() || 'v1.0.0';
  const header = `## ${version} (${form.type})\n**Audiencia:** ${form.audience}\n\n`;
  return header + form.description.trim();
}

export function formMetaToCreatePayload(form: UpdateFormMeta): CreateUpdatePayload {
  return {
    title: form.title.trim(),
    content: buildUpdateContent(form),
    aircraftModelId: form.aircraftModelId,
    categoryId: form.categoryId,
  };
}

export const updatesApiService = {
  async listByStatus(
    status: AircraftUpdateDto['status'],
    page = 0,
    size = 30,
  ): Promise<PagedResponse<AircraftUpdateDto>> {
    const { data } = await api.get<unknown>(API.UPDATES.BASE, {
      params: { page, size, sort: 'createdAt,desc', status },
    });
    return springPageToPaged<AircraftUpdateDto>(data);
  },

  async listMine(page = 0, size = 30): Promise<PagedResponse<AircraftUpdateDto>> {
    const { data } = await api.get<unknown>(API.UPDATES.BASE, {
      params: { page, size, sort: 'createdAt,desc', mine: true },
    });
    return springPageToPaged<AircraftUpdateDto>(data);
  },

  async listPublicApproved(page = 0, size = 50): Promise<PagedResponse<AircraftUpdateDto>> {
    const { data } = await api.get<unknown>(API.UPDATES.BASE, {
      params: { page, size, sort: 'createdAt,desc' },
    });
    return springPageToPaged<AircraftUpdateDto>(data);
  },

  async approve(id: number): Promise<AircraftUpdateDto> {
    const { data } = await api.patch<AircraftUpdateDto>(API.UPDATES.APPROVE(id));
    return data;
  },

  async reject(id: number, payload: RejectUpdatePayload): Promise<AircraftUpdateDto> {
    const { data } = await api.patch<AircraftUpdateDto>(API.UPDATES.REJECT(id), payload);
    return data;
  },

  async create(payload: CreateUpdatePayload): Promise<AircraftUpdateDto> {
    const { data } = await api.post<AircraftUpdateDto>(API.UPDATES.BASE, payload);
    return data;
  },

  async update(id: number, payload: CreateUpdatePayload): Promise<AircraftUpdateDto> {
    const { data } = await api.put<AircraftUpdateDto>(API.UPDATES.BY_ID(id), payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(API.UPDATES.BY_ID(id));
  },

  async getById(id: number): Promise<AircraftUpdateDto> {
    const { data } = await api.get<AircraftUpdateDto>(API.UPDATES.BY_ID(id));
    return data;
  },

  async listCategories(): Promise<UpdateCategoryDto[]> {
    const { data } = await api.get<UpdateCategoryDto[]>(API.UPDATES.CATEGORIES);
    return Array.isArray(data) ? data : [];
  },

  /** @deprecated use listCategories */
  async getCategories(): Promise<UpdateCategoryDto[]> {
    return this.listCategories();
  },
};
