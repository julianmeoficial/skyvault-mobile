import { useAuthStore } from '../../../stores/authStore';
import type { UserRole } from '../types/auth.types';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isModerator = user?.role === 'ROLE_MODERATOR' || isAdmin;

  const hasRole = (role: UserRole): boolean => user?.role === role;
  const hasAnyRole = (roles: UserRole[]): boolean =>
    roles.some((r) => user?.role === r);

  return {
    user,
    isAuthenticated,
    isLoading,
    isHydrated,
    isAdmin,
    isModerator,
    hasRole,
    hasAnyRole,
  };
}
