import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { tokenManager } from '../../../lib/api';
import { WS_URL } from '../../../constants/api';
import { normalizeNotification } from '../utils/normalizeNotification';
import type { UserNotificationWsEvent } from '../types/notification.types';

export type NotificationSocketHandlers = {
  onCreated: (event: UserNotificationWsEvent) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
};

function resolveWsUrl(): string {
  const base = WS_URL.replace(/\/$/, '');
  if (base.startsWith('http://') || base.startsWith('https://')) {
    return base.replace(/\/api\/v1\/?$/, '') + '/ws';
  }
  if (base.startsWith('ws://') || base.startsWith('wss://')) {
    return base.replace(/^ws/, 'http').replace(/^wss/, 'https');
  }
  return base + '/ws';
}

export function createNotificationSocket(handlers: NotificationSocketHandlers): Client {
  const wsUrl = resolveWsUrl();

  const client = new Client({
    webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      handlers.onConnected?.();
      client.subscribe('/user/queue/notifications', (message) => {
        try {
          const body = JSON.parse(message.body) as { event?: string; notification?: unknown };
          if (body.event === 'CREATED' && body.notification) {
            const notification = normalizeNotification(body.notification);
            if (notification) {
              handlers.onCreated({ event: 'CREATED', notification });
            }
          }
        } catch {
          /* malformed */
        }
      });
    },
    onDisconnect: () => handlers.onDisconnected?.(),
    onStompError: () => handlers.onDisconnected?.(),
    onWebSocketError: () => handlers.onDisconnected?.(),
    beforeConnect: () => {
      const token = tokenManager.get();
      if (token) {
        client.connectHeaders = { Authorization: `Bearer ${token}` };
      }
    },
  });

  return client;
}
