import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import type { Client } from '@stomp/stompjs';
import { playIncomingNotificationFeedback } from '../utils/notificationSound';
import { normalizeNotification } from '../utils/normalizeNotification';
import { useAuthStore } from '../../../stores/authStore';
import { notificationService } from '../services/notificationService';
import { createNotificationSocket } from '../services/notificationSocket';
import type { ToastNotification, UserNotificationDto } from '../types/notification.types';
import { resolveActionRoute } from '../utils/resolveActionRoute';
import { getUserFriendlyError } from '../../../shared/utils/errorMessages';
import { NotificationContext } from './NotificationContext';
import { NotificationSheet } from '../components/NotificationSheet';
import { NotificationToastHost } from '../components/NotificationToastHost';

const MAX_TOASTS = 3;
const POLL_CONNECTED_MS = 60_000;
const POLL_DISCONNECTED_MS = 10_000;
const SYNC_COUNT_DEBOUNCE_MS = 400;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const stompRef = useRef<Client | null>(null);
  const isAuthenticated = !!user;
  const prevUnreadRef = useRef(0);
  const toastedIdsRef = useRef<Set<string>>(new Set());
  const wsConnectedRef = useRef(false);
  const syncCountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [bellPulseKey, setBellPulseKey] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [items, setItems] = useState<UserNotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  const pulseBell = useCallback(() => {
    setBellPulseKey((k) => k + 1);
  }, []);

  const syncUnreadFromApi = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      prevUnreadRef.current = count;
    } catch {
      /* silent */
    }
  }, [isAuthenticated]);

  const scheduleSyncUnreadFromApi = useCallback(() => {
    if (syncCountTimerRef.current) clearTimeout(syncCountTimerRef.current);
    syncCountTimerRef.current = setTimeout(() => {
      void syncUnreadFromApi();
    }, SYNC_COUNT_DEBOUNCE_MS);
  }, [syncUnreadFromApi]);

  const presentNotification = useCallback(
    (n: UserNotificationDto, options: { bumpUnreadCount?: boolean } = {}) => {
      const { bumpUnreadCount = true } = options;
      const toastId = `${n.id}-${Date.now()}`;

      if (!toastedIdsRef.current.has(n.id)) {
        toastedIdsRef.current.add(n.id);
        setToasts((prev) => [{ ...n, toastId }, ...prev].slice(0, MAX_TOASTS));
        setTimeout(() => dismissToast(toastId), 5000);
      }

      if (!n.read) {
        if (bumpUnreadCount) {
          setUnreadCount((c) => c + 1);
          prevUnreadRef.current += 1;
        }
        pulseBell();
        void playIncomingNotificationFeedback(n.priority);
      }

      setItems((prev) => {
        if (prev.some((p) => p.id === n.id)) {
          return prev.map((p) => (p.id === n.id ? n : p));
        }
        return [n, ...prev];
      });
    },
    [dismissToast, pulseBell],
  );

  const refreshList = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setListError(null);
    try {
      const page = await notificationService.list(0, 40, false);
      const normalized = page.content
        .map((n) => normalizeNotification(n))
        .filter((n): n is UserNotificationDto => n != null);
      setItems(normalized);
      normalized.forEach((n) => toastedIdsRef.current.add(n.id));
    } catch (err) {
      setListError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshInbox = useCallback(async () => {
    await Promise.all([syncUnreadFromApi(), refreshList()]);
  }, [syncUnreadFromApi, refreshList]);

  const refreshCountWithPollFallback = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await notificationService.getUnreadCount();
      const prev = prevUnreadRef.current;

      if (count > prev) {
        pulseBell();
        void playIncomingNotificationFeedback('NORMAL');
        try {
          const page = await notificationService.list(0, Math.min(count - prev, 10), true);
          for (const raw of page.content) {
            const n = normalizeNotification(raw);
            if (n && !n.read) {
              presentNotification(n, { bumpUnreadCount: false });
            }
          }
        } catch {
          /* listado opcional en fallback */
        }
      }

      setUnreadCount(count);
      prevUnreadRef.current = count;
    } catch {
      /* silent */
    }
  }, [isAuthenticated, presentNotification, pulseBell]);

  const handleIncoming = useCallback(
    (event: { event: string; notification: UserNotificationDto }) => {
      if (event.event !== 'CREATED') return;
      const n = normalizeNotification(event.notification);
      if (!n) return;
      presentNotification(n, { bumpUnreadCount: true });
      scheduleSyncUnreadFromApi();
    },
    [presentNotification, scheduleSyncUnreadFromApi],
  );

  const setWsState = useCallback((connected: boolean) => {
    wsConnectedRef.current = connected;
    setWsConnected(connected);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setBellPulseKey(0);
      setWsConnected(false);
      setItems([]);
      setToasts([]);
      setListError(null);
      setPanelOpen(false);
      prevUnreadRef.current = 0;
      toastedIdsRef.current.clear();
      wsConnectedRef.current = false;
      stompRef.current?.deactivate();
      stompRef.current = null;
      return;
    }

    void refreshInbox();

    const client = createNotificationSocket({
      onCreated: handleIncoming,
      onConnected: () => {
        setWsState(true);
        startPoll(true);
        void refreshInbox();
      },
      onDisconnected: () => {
        setWsState(false);
        startPoll(false);
      },
    });
    stompRef.current = client;
    try {
      client.activate();
    } catch {
      setWsState(false);
    }

    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const runPoll = () => {
      if (wsConnectedRef.current) {
        void refreshCountWithPollFallback();
      } else {
        void refreshCountWithPollFallback();
        void refreshList();
      }
    };

    const startPoll = (connected: boolean) => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(runPoll, connected ? POLL_CONNECTED_MS : POLL_DISCONNECTED_MS);
    };

    startPoll(false);

    const onAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        stompRef.current?.activate();
        InteractionManager.runAfterInteractions(() => {
          void refreshInbox();
        });
      }
    };
    const appSub = AppState.addEventListener('change', onAppState);

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      appSub.remove();
      if (syncCountTimerRef.current) clearTimeout(syncCountTimerRef.current);
      client.deactivate();
      stompRef.current = null;
    };
  }, [
    isAuthenticated,
    handleIncoming,
    refreshInbox,
    refreshCountWithPollFallback,
    refreshList,
    setWsState,
  ]);

  const togglePanel = useCallback(() => {
    setPanelOpen((o) => {
      const next = !o;
      if (next) {
        void refreshList();
        if (unreadCount > 0 && items.length === 0) {
          void refreshInbox();
        }
      }
      return next;
    });
  }, [refreshList, refreshInbox, unreadCount, items.length]);

  const markRead = useCallback(
    async (id: string) => {
      const updated = await notificationService.markRead(id);
      const n = normalizeNotification(updated) ?? updated;
      setItems((prev) => prev.map((item) => (item.id === id ? n : item)));
      setUnreadCount((c) => Math.max(0, c - 1));
      prevUnreadRef.current = Math.max(0, prevUnreadRef.current - 1);
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    prevUnreadRef.current = 0;
  }, []);

  const dismiss = useCallback(
    async (id: string) => {
      await notificationService.dismiss(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      await syncUnreadFromApi();
    },
    [syncUnreadFromApi],
  );

  const openNotification = useCallback(
    (n: UserNotificationDto) => {
      setPanelOpen(false);
      if (!n.read) void markRead(n.id);
      router.push(resolveActionRoute(n) as never);
    },
    [markRead, router],
  );

  const hasHighPriorityUnread = useMemo(
    () => items.some((n) => !n.read && n.priority === 'HIGH'),
    [items],
  );

  const value = useMemo(
    () => ({
      unreadCount,
      bellPulseKey,
      hasHighPriorityUnread,
      wsConnected,
      panelOpen,
      items,
      loading,
      listError,
      togglePanel,
      refreshList,
      markRead,
      markAllRead,
      dismiss,
      openNotification,
    }),
    [
      unreadCount,
      bellPulseKey,
      hasHighPriorityUnread,
      wsConnected,
      panelOpen,
      items,
      loading,
      listError,
      togglePanel,
      refreshList,
      markRead,
      markAllRead,
      dismiss,
      openNotification,
    ],
  );

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationSheet />
      <NotificationToastHost toasts={toasts} onDismiss={dismissToast} onPress={openNotification} />
    </NotificationContext.Provider>
  );
}
