import axios from 'axios';
import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type { AuthUserDto } from '../types/auth.types';
import {
  mapUserFavoriteToSummary,
  type UserFavoriteResponseRaw,
} from './favoriteMappers';

export interface UpdateProfileDto {
  username?: string;
  fullName?: string;
}

interface MeResponseRaw {
  id?: string;
  username: string;
  email: string;
  fullName?: string | null;
  active?: boolean;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

function mapMeResponseToAuthUser(data: MeResponseRaw): AuthUserDto {
  const role = data.role as AuthUserDto['role'];
  const validRoles: AuthUserDto['role'][] = ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_USER'];
  return {
    id: data.id,
    username: data.username,
    email: data.email ?? '',
    fullName: data.fullName ?? undefined,
    role: validRoles.includes(role) ? role : 'ROLE_USER',
    enabled: data.active !== false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export interface AircraftSummaryDto {
  id: number;
  slug: string;
  model: string;
  manufacturer: string;
  imageUrl?: string;
  aircraftName?: string;
  rangeKm?: number;
  maxPassengers?: number;
  thumbnailUrl?: string;
}

export const userService = {
  async getProfile(): Promise<AuthUserDto> {
    const { data } = await api.get<MeResponseRaw>(API.ME.PROFILE);
    return mapMeResponseToAuthUser(data);
  },

  async updateProfile(payload: UpdateProfileDto): Promise<AuthUserDto> {
    const body: Record<string, string> = {};
    if (payload.username !== undefined) body.username = payload.username;
    if (payload.fullName !== undefined) body.fullName = payload.fullName;
    const { data } = await api.put<MeResponseRaw>(API.ME.UPDATE, body);
    return mapMeResponseToAuthUser(data);
  },

  async getFavorites(): Promise<AircraftSummaryDto[]> {
    const { data } = await api.get<UserFavoriteResponseRaw[]>(API.ME.FAVORITES);
    return data.map(mapUserFavoriteToSummary);
  },

  async addFavorite(aircraftId: number): Promise<void> {
    try {
      await api.post(API.ME.FAVORITE_ADD(aircraftId));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        return;
      }
      throw error;
    }
  },

  async removeFavorite(aircraftId: number): Promise<void> {
    await api.delete(API.ME.FAVORITE_REMOVE(aircraftId));
  },
};
