/** Props recomendadas para FlatList con listas medianas/grandes (catálogo, admin, favoritos). */
export const FLAT_LIST_PERF = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 8,
  windowSize: 7,
  removeClippedSubviews: true,
  updateCellsBatchingPeriod: 50,
} as const;
