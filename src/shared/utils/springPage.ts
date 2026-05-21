import type { PagedResponse } from '../types/api.types';

interface SpringPageRaw<T> {
  content?: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
}

function isPagedResponse<T>(raw: unknown): raw is PagedResponse<T> {
  if (!raw || typeof raw !== 'object') return false;
  const o = raw as Record<string, unknown>;
  return (
    Array.isArray(o.content) &&
    o.page !== null &&
    typeof o.page === 'object' &&
    typeof (o.page as Record<string, unknown>).totalElements === 'number'
  );
}

export function springPageToPagedResponse<T>(raw: unknown): PagedResponse<T> {
  if (isPagedResponse<T>(raw)) return raw;
  const r = raw as SpringPageRaw<T>;
  const content = Array.isArray(r.content) ? r.content : [];
  const totalElements = r.totalElements ?? content.length;
  const size = r.size ?? (content.length || 20);
  const number = r.number ?? 0;
  const totalPages = r.totalPages ?? Math.max(1, Math.ceil(totalElements / size));
  return {
    content,
    page: {
      number,
      size,
      totalElements,
      totalPages,
      first: r.first ?? number === 0,
      last: r.last ?? number >= totalPages - 1,
      hasPrevious: number > 0,
      hasNext: number < totalPages - 1,
    },
  };
}
