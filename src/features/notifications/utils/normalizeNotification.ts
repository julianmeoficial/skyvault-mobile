import type {
  NotificationPriority,
  UserNotificationDto,
  UserNotificationType,
} from '../types/notification.types';

const VALID_TYPES: UserNotificationType[] = [
  'UPDATE_PENDING',
  'UPDATE_RESUBMITTED',
  'UPDATE_APPROVED',
  'UPDATE_REJECTED',
  'UPDATE_RECEIVED',
  'UPDATE_PUBLISHED',
  'AIRCRAFT_CREATED',
  'AIRCRAFT_UPDATED',
  'UPDATE_CATEGORY_CHANGED',
  'API_ACTIVITY',
  'SYSTEM_INFO',
];

function coercePriority(value: unknown): NotificationPriority {
  if (value === 'HIGH' || value === 'LOW' || value === 'NORMAL') return value;
  return 'NORMAL';
}

function coerceType(value: unknown): UserNotificationType {
  if (typeof value === 'string' && VALID_TYPES.includes(value as UserNotificationType)) {
    return value as UserNotificationType;
  }
  return 'SYSTEM_INFO';
}

export function normalizeNotification(raw: unknown): UserNotificationDto | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  return {
    id,
    type: coerceType(r.type),
    priority: coercePriority(r.priority),
    title: typeof r.title === 'string' ? r.title : 'Notificación',
    message: typeof r.message === 'string' ? r.message : '',
    payload: (r.payload as UserNotificationDto['payload']) ?? null,
    read: r.read === true,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : new Date().toISOString(),
    readAt: typeof r.readAt === 'string' ? r.readAt : null,
    categoryName: typeof r.categoryName === 'string' ? r.categoryName : null,
    actionRoute: typeof r.actionRoute === 'string' ? r.actionRoute : null,
  };
}
