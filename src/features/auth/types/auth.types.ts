export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export type UserRole = 'ROLE_ADMIN' | 'ROLE_MODERATOR' | 'ROLE_USER';

export interface AuthUserDto {
  id?: string | number;
  username: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}
