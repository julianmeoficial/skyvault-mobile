import api from '../../../lib/api';
import { API } from '../../../constants/api';
import type { PagedResponse } from '../../../shared/types/api.types';
import { springPageToPagedResponse } from '../../../shared/utils/springPage';
import type { UserRole } from '../../auth/types/auth.types';
import type { AdminUserDto, AdminUserUpdateDto, ChangeRoleDto } from '../types/admin.types';

interface AdminUserResponseRaw {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  active: boolean;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

const VALID_ROLES: UserRole[] = ['ROLE_ADMIN', 'ROLE_MODERATOR', 'ROLE_USER'];

function mapAdminUser(raw: AdminUserResponseRaw): AdminUserDto {
  const role = raw.role as UserRole;
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    fullName: raw.fullName ?? undefined,
    role: VALID_ROLES.includes(role) ? role : 'ROLE_USER',
    enabled: raw.active,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export const adminUserService = {
  async getUsers(page = 0, size = 20): Promise<PagedResponse<AdminUserDto>> {
    const { data } = await api.get<unknown>(API.ADMIN.USERS, { params: { page, size } });
    const paged = springPageToPagedResponse<AdminUserResponseRaw>(data);
    return { ...paged, content: paged.content.map(mapAdminUser) };
  },

  async patchUserProfile(id: string | number, payload: AdminUserUpdateDto): Promise<AdminUserDto> {
    const { data } = await api.patch<AdminUserResponseRaw>(API.ADMIN.USER_BY_ID(id), payload);
    return mapAdminUser(data);
  },

  async changeUserRole(id: string | number, payload: ChangeRoleDto): Promise<AdminUserDto> {
    const { data } = await api.patch<AdminUserResponseRaw>(API.ADMIN.USER_ROLE(id), payload);
    return mapAdminUser(data);
  },

  async activateUser(id: string | number): Promise<AdminUserDto> {
    const { data } = await api.patch<AdminUserResponseRaw>(API.ADMIN.USER_ACTIVATE(id));
    return mapAdminUser(data);
  },

  async deactivateUser(id: string | number): Promise<AdminUserDto> {
    const { data } = await api.patch<AdminUserResponseRaw>(API.ADMIN.USER_DEACTIVATE(id));
    return mapAdminUser(data);
  },

  async deleteUser(id: string | number): Promise<void> {
    await api.delete(API.ADMIN.USER_DELETE(id));
  },
};
