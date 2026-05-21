import { useCallback, useEffect, useState } from 'react';
import { adminUserService } from '../services/adminUserService';
import type { AdminUserDto, ChangeRoleDto } from '../types/admin.types';
import type { PagedResponse } from '../../../shared/types/api.types';

export function useAdminUsers(initialPage = 0, initialSize = 20) {
  const [data, setData] = useState<PagedResponse<AdminUserDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [size] = useState(initialSize);

  const fetchUsers = useCallback(
    async (p: number, silent = false) => {
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);
      try {
        const result = await adminUserService.getUsers(p, size);
        setData(result);
        setPage(p);
      } catch {
        setError('No se pudieron cargar los usuarios.');
      } finally {
        if (silent) setIsRefreshing(false);
        else setIsLoading(false);
      }
    },
    [size],
  );

  useEffect(() => {
    void fetchUsers(page, false);
  }, [fetchUsers, page]);

  const changeRole = useCallback(async (id: string | number, payload: ChangeRoleDto) => {
    setIsSubmitting(true);
    try {
      const updated = await adminUserService.changeUserRole(id, payload);
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((u) => (String(u.id) === String(id) ? updated : u)),
            }
          : prev,
      );
      return true;
    } catch {
      setError('No se pudo cambiar el rol.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const toggleActive = useCallback(async (id: string | number, enable: boolean) => {
    setIsSubmitting(true);
    try {
      const updated = enable
        ? await adminUserService.activateUser(id)
        : await adminUserService.deactivateUser(id);
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((u) => (String(u.id) === String(id) ? updated : u)),
            }
          : prev,
      );
      return true;
    } catch {
      setError('No se pudo actualizar el estado.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const deleteUser = useCallback(async (id: string | number) => {
    setIsSubmitting(true);
    try {
      await adminUserService.deleteUser(id);
      setData((prev) =>
        prev
          ? { ...prev, content: prev.content.filter((u) => String(u.id) !== String(id)) }
          : prev,
      );
      return true;
    } catch {
      setError('No se pudo eliminar el usuario.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    users: data?.content ?? [],
    pagination: data?.page,
    isLoading,
    isRefreshing,
    isSubmitting,
    error,
    changeRole,
    toggleActive,
    deleteUser,
    goToPage: (p: number) => fetchUsers(p, false),
    refetch: () => fetchUsers(page, true),
  };
}
