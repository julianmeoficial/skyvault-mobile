import type { UserRole } from '../../auth/types/auth.types';

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: UserRole;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserUpdateDto {
  username?: string;
  fullName?: string;
  email?: string;
}

export interface ChangeRoleDto {
  role: UserRole;
}
