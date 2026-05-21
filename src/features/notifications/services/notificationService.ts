import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type { PagedResponse } from '../../../shared/types/api.types';
import { springPageToPagedResponse } from '../../../shared/utils/springPage';
import type { UnreadCountDto, UserNotificationDto } from '../types/notification.types';

export const notificationService = {
  async list(page = 0, size = 20, unreadOnly = false): Promise<PagedResponse<UserNotificationDto>> {
    const { data } = await api.get<unknown>(API.ME.NOTIFICATIONS, {
      params: { page, size, unreadOnly },
    });
    return springPageToPagedResponse<UserNotificationDto>(data);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<UnreadCountDto>(API.ME.NOTIFICATIONS_UNREAD);
    return data.count;
  },

  async markRead(id: string): Promise<UserNotificationDto> {
    const { data } = await api.patch<UserNotificationDto>(API.ME.NOTIFICATION_READ(id));
    return data;
  },

  async markAllRead(): Promise<void> {
    await api.post(API.ME.NOTIFICATIONS_READ_ALL);
  },

  async dismiss(id: string): Promise<void> {
    await api.delete(API.ME.NOTIFICATION_BY_ID(id));
  },
};
