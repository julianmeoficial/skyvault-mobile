import { isAxiosError } from 'axios';
import type { ProblemDetail } from '../types/api.types';

const extractProblemDetail = (error: unknown): ProblemDetail | null => {
  if (isAxiosError<ProblemDetail>(error) && error.response?.data) {
    const data = error.response.data;
    if (data.title && typeof data.status === 'number') {
      return data;
    }
  }
  return null;
};

const extractErrorString = (error: unknown): string => {
  if (isAxiosError(error)) {
    const pd = extractProblemDetail(error);
    if (pd?.detail) return pd.detail;
    if (pd?.title) return pd.title;
    if (error.response?.status) {
      return `HTTP ${error.response.status}`;
    }
    return error.message ?? 'Unknown error';
  }
  if (error instanceof Error) return error.message;
  return String(error);
};

export type AuthErrorContext = 'login' | 'register' | 'general';

export const getAuthErrorMessage = (error: unknown, context: AuthErrorContext = 'general'): string => {
  if (isAxiosError(error) && error.response?.status) {
    const pd = extractProblemDetail(error);
    const status = error.response.status;

    if (status === 401) {
      if (context === 'login' || context === 'register') {
        return pd?.detail ?? 'Credenciales inválidas.';
      }
      return pd?.detail ?? 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.';
    }
    if (status === 403 && (context === 'login' || context === 'register')) {
      return 'Tu cuenta está desactivada. Contacta al administrador.';
    }
  }
  return getUserFriendlyError(error);
};

export const getUserFriendlyError = (error: unknown): string => {
  const errorMessage = typeof error === 'string' ? error : extractErrorString(error);
  const lowerError = errorMessage.toLowerCase();

  if (isAxiosError(error) && error.response?.status) {
    const status = error.response.status;
    const pd = extractProblemDetail(error);

    switch (status) {
      case 400:
        return pd?.detail ?? 'Los datos enviados no son válidos.';
      case 401:
        return 'Tu sesión ha expirado. Por favor inicia sesión de nuevo.';
      case 403:
        return 'No tienes permisos para acceder a esta sección.';
      case 404:
        return pd?.detail ?? 'No encontramos los datos solicitados.';
      case 409:
        return pd?.detail ?? 'Ya existe un registro con esos datos.';
      case 422:
        return pd?.detail ?? 'Los datos proporcionados no son válidos.';
      case 429:
        return 'Demasiadas solicitudes. Espera unos segundos e intenta de nuevo.';
      case 500:
      case 502:
      case 503:
        return 'El servidor está experimentando problemas. Intenta de nuevo en unos momentos.';
    }
  }

  if (isAxiosError(error) && !error.response) {
    if (error.code === 'ECONNABORTED' || lowerError.includes('timeout')) {
      return 'La solicitud tardó demasiado. Intenta de nuevo.';
    }
    return 'No pudimos conectar con el servidor. Verifica tu conexión.';
  }

  if (lowerError.includes('network') || lowerError.includes('fetch')) {
    return 'No pudimos conectar con el servidor. Verifica tu conexión.';
  }

  return errorMessage.length > 10 && errorMessage.length < 200
    ? errorMessage
    : 'Algo salió mal. Por favor intenta de nuevo.';
};
