/** Etiqueta de estado en listado (GET /aircraft no incluye productionState en la card). */
export function catalogStatusLabel(isActive?: boolean): string {
  if (isActive === false) return 'Producción finalizada';
  return 'En producción';
}

export function productionStateLabel(name?: string | null): string {
  if (!name) return '—';
  const n = name.toLowerCase();
  if (n.includes('finaliz') || n.includes('retired') || n.includes('retir')) return 'Producción finalizada';
  if (n.includes('production') || n.includes('producción') || n.includes('produccion')) {
    return 'En producción';
  }
  if (n.includes('service') || n.includes('servicio')) return 'En servicio';
  if (n.includes('active') || n.includes('activ')) return 'Activo';
  if (n.includes('development') || n.includes('desarrollo')) return 'En desarrollo';
  return name;
}
