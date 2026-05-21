import type { AxiosError } from 'axios';

export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}

export interface PagedResponse<T> {
  content: T[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    numberOfElements?: number;
    first: boolean;
    last: boolean;
    hasPrevious: boolean;
    hasNext: boolean;
    empty?: boolean;
  };
  filters?: Record<string, unknown> | null;
  sort?: string | null;
}

export type AxiosApiError = AxiosError<ProblemDetail>;
