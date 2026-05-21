import type { UserRole } from '../types/auth.types';
import type { AuthUser } from '../../../stores/authStore';

export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isStaff(user: AuthUser | null): boolean {
  return hasRole(user, ['ROLE_ADMIN', 'ROLE_MODERATOR']);
}

export function canEditAircraft(user: AuthUser | null): boolean {
  return hasRole(user, ['ROLE_ADMIN', 'ROLE_MODERATOR']);
}

export function canDeleteAircraft(user: AuthUser | null): boolean {
  return hasRole(user, ['ROLE_ADMIN']);
}
