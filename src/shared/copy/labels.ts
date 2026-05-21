import type { UserRole } from '../../features/auth/types/auth.types';

export const dashboardCopy = {
  user: {
    greeting: 'Hola',
    subtitle: 'Resumen de tu actividad en SkyVault',
    newReport: 'Nuevo reporte',
    newReportSub: 'Sugerir un cambio',
    favorites: 'Favoritos',
    comparisons: 'Comparaciones',
    recentComparisons: 'Comparaciones recientes',
  },
  moderator: {
    greeting: 'Panel de moderación',
    subtitle: 'Revisa reportes y aeronaves del catálogo',
    moderateReports: 'Revisar reportes',
    aircraft: 'Aeronaves',
  },
  admin: {
    greeting: 'Panel administrador',
    subtitle: 'Gestión del catálogo y usuarios',
    users: 'Usuarios',
    aircraft: 'Aeronaves',
    settings: 'Configuración',
    moderateReports: 'Moderar reportes',
  },
} as const;

export function roleDisplayName(role?: UserRole | string): string {
  if (role === 'ROLE_ADMIN') return 'Administrador';
  if (role === 'ROLE_MODERATOR') return 'Moderador';
  return 'Usuario';
}

export const updatesCopy = {
  user: {
    title: 'Tus reportes',
    empty: 'Aún no has enviado reportes.',
    create: 'Enviar reporte',
    pending: 'En revisión',
  },
  staff: {
    title: 'Moderación de reportes',
    pending: 'Pendientes',
    approved: 'Aprobados',
    rejected: 'Rechazados',
    approve: 'Aprobar',
    reject: 'Rechazar',
  },
};
