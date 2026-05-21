import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type { AdminStats, AdminActivityItem } from '../types/dashboard.types';

interface AdminStatsApiDto {
  totalAircraft: number;
  registeredUsers: number;
  openIncidents: number;
  pendingUpdates: number;
}

interface AdminActivityApiDto {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityName?: string;
  occurredAt: string;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export const dashboardAdminService = {
  async fetchAdminStats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStatsApiDto>(API.ADMIN.STATS);
    return {
      totalAircraft: data.totalAircraft,
      registeredUsers: data.registeredUsers,
      openIncidents: data.openIncidents,
      pendingUpdates: data.pendingUpdates,
    };
  },

  async fetchRecentActivity(limit = 8): Promise<AdminActivityItem[]> {
    const { data } = await api.get<AdminActivityApiDto[]>(API.ADMIN.ACTIVITY, {
      params: { limit },
    });
    return data.map((item) => ({
      id: item.id,
      userId: item.userId,
      username: item.username,
      action: item.action,
      entityName: item.entityName,
      timeAgo: formatRelativeTime(item.occurredAt),
    }));
  },
};
