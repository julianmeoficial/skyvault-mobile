# Rendimiento y refresh — SkyVault Mobile

Guía de patrones para que la app se sienta fluida en listas, pull-to-refresh, mutaciones y pantallas con datos del API.

**Versión:** 1.9.5

Para ubicar archivos y pantallas, ver [SCHEMA.md](./SCHEMA.md). Para dónde colocar código nuevo, ver la tabla en [CONTRIBUTING.md](./CONTRIBUTING.md#3-dónde-colocar-el-código).

---

## Principios

1. **Carga inicial vs refresh:** `isLoading` solo cuando no hay datos en pantalla (skeleton). `isRefreshing` para pull-to-refresh o refetch en segundo plano **sin desmontar** la UI.
2. **No bloquear con skeleton global** si ya hay lista: evita parpadeos y modales que “reaparecen” (ver v1.9.4 usuarios admin).
3. **Listas largas:** usar `FLAT_LIST_PERF` de [`src/shared/constants/flatListPerf.ts`](src/shared/constants/flatListPerf.ts) y filas memoizadas (`React.memo` en cards).
4. **Animaciones en listas:** evitar `entering` por ítem en scroll (catálogo); reservar animaciones para modales o pantallas estáticas.
5. **Trabajo pesado al volver a primer plano:** diferir con `InteractionManager.runAfterInteractions` (notificaciones).
6. **Mutaciones:** confirmar con `ActionSuccessModal` en el modal o pantalla de edición; no vaciar la lista padre con skeleton mientras el usuario confirma.

---

## Patrón de hook de lista

```ts
// Carga inicial
setIsLoading(true);

// Refetch con datos ya mostrados
setIsRefreshing(true);

// Pantalla
if (isLoading && items.length === 0) return <SkeletonLoader />;
<FlatList refreshing={isRefreshing} onRefresh={() => refetch()} />
```

Hooks que siguen este patrón:

| Hook | Pantalla |
|------|----------|
| `useAdminUsers` | `app/dashboard/users.tsx` |
| `useAdminAircraftList` | `app/dashboard/aircraft.tsx` |
| `useAircraftCatalog` | `app/(tabs)/search.tsx` |
| `useFavorites` | `FavoritesTabView` |
| `useStatistics` | `AdminStatsScreen` |

---

## Feedback de mutaciones (v1.9.4+)

Al guardar perfil, usuarios admin o aeronaves, usar **`useMutationFeedback`** + **`ActionSuccessModal`** (`src/features/dashboard/hooks/useMutationFeedback.ts`, `src/components/feedback/ActionSuccessModal.tsx`).

| Regla | Motivo |
|-------|--------|
| La pantalla lista usa `isRefreshing`, no `isLoading`, tras mutar | El modal sigue montado; no desmontar filas con skeleton |
| `UserEditModal` delega refetch vía `onMutated` | Evita que `users.tsx` muestre skeleton global y “cierre” el sheet |
| `AircraftFormModal` cierra el formulario antes de mostrar confirmación | Lista admin visible debajo; refresh en segundo plano |
| Perfil dashboard: tras “Listo”, `router.back()` a la tab | Una sola sync API por sesión en tab perfil (ver abajo) |

---

## FlatList

Props compartidas (`FLAT_LIST_PERF`):

- `initialNumToRender: 10`
- `maxToRenderPerBatch: 8`
- `windowSize: 7`
- `removeClippedSubviews: true`
- `updateCellsBatchingPeriod: 50`

Componentes de fila memoizados: `CatalogAircraftCard`, `AdminAircraftRow`.

---

## Catálogo (`useAircraftCatalog`)

- Debounce **400 ms** en cambios de filtros/búsqueda antes de llamar al API.
- Búsqueda con un solo carácter no dispara petición.
- Paginación: `loadMore` con ref anti-doble petición (`appendInFlightRef`).
- Refresh manual: incrementa `reloadKey`; si ya hay resultados, solo `isRefreshing`.
- Sin animación `FadeInDown` por ítem en la lista.

---

## Admin aeronaves

`useAdminAircraftList` carga hasta 20 páginas × 50 ítems en una sola pasada (máx. 1000). El filtro por texto es **local** (`useMemo`) para no martillar el API al escribir en el buscador.

---

## Updates (admin)

En `app/dashboard/updates.tsx`, al cambiar segmento (pendientes / aprobadas / rechazadas):

- Mantener la lista del segmento anterior visible hasta que llegue la nueva respuesta.
- Usar `isRefreshing` en refetch, no skeleton de pantalla completa si ya hay ítems.
- Evitar flash blanco al cambiar chips de filtro.

---

## Notificaciones

- Tiempo real: SockJS + STOMP ([SCHEMA.md](./SCHEMA.md#notificaciones-tiempo-real)).
- Poll de respaldo: 60 s conectado / 10 s desconectado.
- Al volver a `active`: reconexión + `refreshInbox` **después** de que terminen animaciones/transiciones (`InteractionManager`).

---

## Perfil (tab)

Sincronización con `GET /me/profile` **una vez por sesión** en la tab (ref `profileSyncedRef`), no en cada cambio de email en store.

---

## Checklist al añadir una pantalla con lista

- [ ] Skeleton solo si `isLoading && data.length === 0`
- [ ] `refreshing={isRefreshing}`, no `isLoading`
- [ ] `keyExtractor` estable
- [ ] Considerar `FLAT_LIST_PERF` y `memo` en el ítem
- [ ] Evitar animaciones Reanimated en cada celda del scroll
- [ ] Mutaciones: modal de éxito sin skeleton global en la lista padre

---

## Verificación manual

| Acción | Esperado |
|--------|----------|
| Pull-to-refresh en catálogo / favoritos / admin | Spinner en header; lista visible sin skeleton completo |
| Cambiar segmento en updates (admin) | Lista previa visible hasta cargar; sin flash blanco |
| Guardar usuario admin en modal | Modal estable; lista no parpadea ni se desmonta |
| Scroll rápido en catálogo | Sin tirones por animaciones de entrada |
| Abrir app tras background | Inbox/campana se actualiza sin bloquear la UI |
