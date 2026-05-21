import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { tokenManager } from '../lib/api';
import api from '../lib/api';
import { API } from '../constants/api';
import { mapAuthResponse } from '../features/auth/utils/mapAuthResponse';
import type { AuthUserDto } from '../features/auth/types/auth.types';

export type AuthUser = AuthUserDto;

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

async function persistSession(
  accessToken: string,
  refreshToken: string,
  user: AuthUser,
): Promise<AuthUser> {
  tokenManager.set(accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
  return user;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isHydrated: false,

  setUser: (user) => set({ user }),

  hydrate: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) {
        set({ isHydrated: true });
        return;
      }
      const { data } = await api.post(API.AUTH.REFRESH, { refreshToken });
      const session = mapAuthResponse(data);
      const user = await persistSession(session.accessToken, session.refreshToken, session.user);
      set({ user, isHydrated: true });
    } catch {
      tokenManager.clear();
      await SecureStore.deleteItemAsync('refreshToken');
      set({ user: null, isHydrated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post(API.AUTH.LOGIN, { email, password });
      const session = mapAuthResponse(data);
      const user = await persistSession(session.accessToken, session.refreshToken, session.user);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post(API.AUTH.REGISTER, { username, email, password });
      const session = mapAuthResponse(data);
      const user = await persistSession(session.accessToken, session.refreshToken, session.user);
      set({ user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post(API.AUTH.LOGOUT);
    } finally {
      tokenManager.clear();
      await SecureStore.deleteItemAsync('refreshToken');
      set({ user: null });
    }
  },
}));
