import { createContext, useContext } from 'react';
import type { UserNotificationDto } from '../types/notification.types';

export type NotificationContextValue = {
  unreadCount: number;
  bellPulseKey: number;
  hasHighPriorityUnread: boolean;
  wsConnected: boolean;
  panelOpen: boolean;
  items: UserNotificationDto[];
  loading: boolean;
  listError: string | null;
  togglePanel: () => void;
  refreshList: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  dismiss: (id: string) => Promise<void>;
  openNotification: (n: UserNotificationDto) => void;
};

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
}
