// Traducido de frontend/src/lib/axios.config.ts SkyVault Web V2.6
// Access token en memoria (no AsyncStorage) para máxima seguridad en capas altas.
// El refresh token se guarda en SecureStore (equivalente a httpOnly cookie en móvil).

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, API } from '../constants/api';

// Token en memoria — nunca en AsyncStorage (accesible sin cifrar)
let accessToken: string | null = null;

export const tokenManager = {
  get:   ()              => accessToken,
  set:   (t: string)    => { accessToken = t; },
  clear: ()              => { accessToken = null; },
};

// Cola de peticiones que esperan refresh
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject:  (reason?: unknown) => void;
}> = [];

const flushQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
};

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'] as const;

function isPublicAuthPath(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url === path || url.startsWith(`${path}?`));
}

// REQUEST — añade Authorization: Bearer <token>
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenManager.get();
  if (token && !isPublicAuthPath(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE — maneja 401 con refresh automático (igual que en el web)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const { data } = await axios.post(
          `${BASE_URL}${API.AUTH.REFRESH}`,
          { refreshToken }
        );
        tokenManager.set(data.accessToken);
        flushQueue(null, data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError);
        tokenManager.clear();
        await SecureStore.deleteItemAsync('refreshToken');
        // El authStore (Zustand) detectará token null y redirigirá a login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;