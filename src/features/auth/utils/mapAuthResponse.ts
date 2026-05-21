import type { AuthResponse, AuthUserDto, UserRole } from '../types/auth.types';

interface RawAuthResponse {
  accessToken: string;
  refreshToken?: string;
  username?: string;
  email?: string;
  role?: string;
  user?: AuthUserDto;
}

const VALID_ROLES: UserRole[] = ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_USER'];

function normalizeRole(role?: string): UserRole {
  if (role && VALID_ROLES.includes(role as UserRole)) {
    return role as UserRole;
  }
  return 'ROLE_USER';
}

export function mapAuthResponse(raw: RawAuthResponse): AuthResponse {
  const role = normalizeRole(raw.user?.role ?? raw.role);

  const user: AuthUserDto =
    raw.user ??
    ({
      username: raw.username ?? '',
      email: raw.email ?? '',
      role,
      enabled: true,
    } satisfies AuthUserDto);

  return {
    accessToken: raw.accessToken,
    refreshToken: raw.refreshToken ?? raw.accessToken,
    user: { ...user, role: normalizeRole(user.role) },
  };
}
