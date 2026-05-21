export type NotificationPriority = 'HIGH' | 'NORMAL' | 'LOW';

export type UserNotificationType =
  | 'UPDATE_PENDING'
  | 'UPDATE_RESUBMITTED'
  | 'UPDATE_APPROVED'
  | 'UPDATE_REJECTED'
  | 'UPDATE_RECEIVED'
  | 'UPDATE_PUBLISHED'
  | 'AIRCRAFT_CREATED'
  | 'AIRCRAFT_UPDATED'
  | 'UPDATE_CATEGORY_CHANGED'
  | 'API_ACTIVITY'
  | 'SYSTEM_INFO';

export interface NotificationPayload {
  updateId?: number;
  aircraftModelId?: number;
  aircraftModelName?: string;
  categoryId?: number;
  categoryName?: string;
  status?: string;
  entityType?: string;
  actionRoute?: string;
  listFilter?: string;
}

export interface UserNotificationDto {
  id: string;
  type: UserNotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  payload?: NotificationPayload | null;
  read: boolean;
  createdAt: string;
  readAt?: string | null;
  categoryName?: string | null;
  actionRoute?: string | null;
}

export interface UserNotificationWsEvent {
  event: 'CREATED';
  notification: UserNotificationDto;
}

export interface UnreadCountDto {
  count: number;
}

export interface ToastNotification extends UserNotificationDto {
  toastId: string;
}
