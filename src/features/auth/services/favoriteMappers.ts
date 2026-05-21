import type { AircraftSummaryDto } from './userService';

export interface UserFavoriteResponseRaw {
  id: number;
  userId?: string;
  aircraftModelId: number;
  aircraftModelName: string;
  aircraftSlug: string;
  aircraftManufacturerName?: string | null;
  aircraftName?: string;
  rangeKm?: number | null;
  maxPassengers?: number | null;
  thumbnailUrl?: string | null;
  createdAt?: string;
}

export function favoriteSlugForRoute(aircraftSlug: string): string {
  return aircraftSlug.trim().toLowerCase().replace(/\s+/g, '-');
}

export function mapUserFavoriteToSummary(raw: UserFavoriteResponseRaw): AircraftSummaryDto {
  return {
    id: raw.aircraftModelId,
    slug: favoriteSlugForRoute(raw.aircraftSlug),
    model: raw.aircraftModelName,
    manufacturer: raw.aircraftManufacturerName ?? '',
    aircraftName: raw.aircraftName,
    rangeKm: raw.rangeKm ?? undefined,
    maxPassengers: raw.maxPassengers ?? undefined,
    thumbnailUrl: raw.thumbnailUrl ?? undefined,
  };
}
