import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RecentComparisonRow } from '../types/dashboard.types';

export const MAX_RECENT_COMPARISONS = 8;

export function getComparisonStorageUserId(
  user: { id?: string | number; email?: string } | null | undefined,
): string | null {
  if (!user) return null;
  if (user.id != null && String(user.id).length > 0) return String(user.id);
  if (user.email?.trim()) return user.email.trim().toLowerCase();
  return null;
}

const HISTORY_KEY_PREFIX = 'sv_recent_comparisons_v1_';
const COUNT_KEY_PREFIX = 'sv_user_comparison_count_';

interface StoredRow {
  id: string;
  ids: number[];
  labels: string[];
  at: string;
}

function historyKey(userId: string): string {
  return `${HISTORY_KEY_PREFIX}${userId}`;
}

function countKey(userId: string): string {
  return `${COUNT_KEY_PREFIX}${userId}`;
}

async function readHistory(userId: string): Promise<StoredRow[]> {
  try {
    const raw = await AsyncStorage.getItem(historyKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredRow[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function recordComparisonSession(
  userId: string | null | undefined,
  ids: number[],
  labelParts: string[],
): Promise<void> {
  if (!userId || ids.length < 2) return;

  const sortedIds = [...ids].sort((a, b) => a - b);
  const idKey = sortedIds.join('-');
  const prev = await readHistory(userId);
  const wasNew = !prev.some((r) => r.id === idKey);

  const row: StoredRow = {
    id: idKey,
    ids: sortedIds,
    labels: labelParts.filter(Boolean),
    at: new Date().toISOString(),
  };

  const next = prev.filter((r) => r.id !== row.id);
  next.unshift(row);
  await AsyncStorage.setItem(historyKey(userId), JSON.stringify(next.slice(0, MAX_RECENT_COMPARISONS)));

  if (wasNew) {
    const n = Number((await AsyncStorage.getItem(countKey(userId))) ?? '0');
    await AsyncStorage.setItem(countKey(userId), String(n + 1));
  }
}

export async function getUserComparisonCount(userId: string | null | undefined): Promise<number> {
  if (!userId) return 0;
  return Number((await AsyncStorage.getItem(countKey(userId))) ?? '0');
}

export async function getRecentComparisonRows(
  userId: string | null | undefined,
): Promise<RecentComparisonRow[]> {
  if (!userId) return [];

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));

  const rows = await readHistory(userId);
  return rows.map((r) => ({
    id: r.id,
    aircraftLabel: r.labels.length ? r.labels.join(' · ') : r.ids.map(String).join(', '),
    date: fmt(r.at),
    ids: r.ids,
  }));
}
