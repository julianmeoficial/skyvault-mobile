import type { UserNotificationDto } from '../types/notification.types';

/** Maps web dashboard routes to Expo Router paths. */
export function resolveActionRoute(notification: UserNotificationDto): string {
  const raw =
    notification.actionRoute ??
    notification.payload?.actionRoute ??
    '/dashboard/updates';

  const path = raw.split('?')[0];
  const params = new URLSearchParams(raw.includes('?') ? raw.split('?')[1] : '');
  const status = params.get('status') ?? params.get('filter') ?? notification.payload?.listFilter;

  if (path.includes('/dashboard/updates')) {
    return status ? `/dashboard/updates?status=${status}` : '/dashboard/updates';
  }
  if (path.includes('/dashboard/aircraft')) return '/dashboard/aircraft';
  if (path.includes('/dashboard/users')) return '/dashboard/users';
  if (path.includes('/dashboard/favorites')) return '/dashboard/favorites';
  if (path.includes('/dashboard/profile')) return '/dashboard/profile';

  const aircraftId = notification.payload?.aircraftModelId;
  if (path.includes('/aircraft/') && aircraftId) {
    return `/aircraft/${aircraftId}`;
  }
  if (aircraftId) return `/aircraft/${aircraftId}`;

  return '/dashboard/updates';
}
