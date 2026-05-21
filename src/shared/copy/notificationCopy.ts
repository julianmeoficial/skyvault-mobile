import type { UserNotificationType } from '../../features/notifications/types/notification.types';

const friendlyTitles: Partial<Record<UserNotificationType, string>> = {
  UPDATE_PENDING: 'Nuevo reporte por revisar',
  UPDATE_RESUBMITTED: 'Reporte actualizado',
  UPDATE_APPROVED: 'Tu reporte fue aprobado',
  UPDATE_REJECTED: 'Tu reporte no fue aprobado',
  UPDATE_RECEIVED: 'Reporte recibido',
  UPDATE_PUBLISHED: 'Cambio publicado',
  AIRCRAFT_CREATED: 'Nueva aeronave en el catálogo',
  AIRCRAFT_UPDATED: 'Aeronave actualizada',
  UPDATE_CATEGORY_CHANGED: 'Categoría de reportes actualizada',
  SYSTEM_INFO: 'Aviso del sistema',
  API_ACTIVITY: 'Actividad en tu cuenta',
};

export function friendlyNotificationTitle(type: UserNotificationType, fallback: string): string {
  return friendlyTitles[type] ?? fallback;
}

export function getNotificationDisplayCopy(
  type: UserNotificationType,
  title: string,
  message: string,
): { title: string; message: string } {
  return {
    title: friendlyNotificationTitle(type, title),
    message,
  };
}
