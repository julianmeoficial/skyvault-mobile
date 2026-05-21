import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type {
  SystemStatisticsDto,
  AircraftStatisticsDto,
  AircraftPopularityDto,
  ComparisonPopularityDto,
} from '../../../shared/types/statistics.types';

export const statisticsService = {
  async getSystemStatistics(): Promise<SystemStatisticsDto> {
    const { data } = await api.get<SystemStatisticsDto>(API.STATISTICS.SYSTEM);
    return data;
  },

  async getAircraftStatistics(): Promise<AircraftStatisticsDto> {
    const { data } = await api.get<AircraftStatisticsDto>(API.STATISTICS.AIRCRAFT);
    return data;
  },

  async getPopularAircraft(limit = 10): Promise<AircraftPopularityDto[]> {
    const { data } = await api.get<AircraftPopularityDto[]>(
      API.STATISTICS.POPULAR_AIRCRAFT,
      { params: { limit } },
    );
    return data ?? [];
  },

  async getPopularComparisons(limit = 10): Promise<ComparisonPopularityDto[]> {
    const { data } = await api.get<ComparisonPopularityDto[]>(
      API.STATISTICS.POPULAR_COMPARISONS,
      { params: { limit } },
    );
    return data ?? [];
  },
};
