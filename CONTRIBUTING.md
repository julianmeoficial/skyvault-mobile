# CONTRIBUTING — SkyVault Mobile

Guía para contribuir al proyecto y registro de cambios por versión. Actualiza este archivo cuando merges cambios significativos.

---

## Antes de empezar

1. Lee [README.md](./README.md) para contexto del producto y stack.
2. Lee [SCHEMA.md](./SCHEMA.md) para ubicar archivos y flujos (API, auth, rutas).
3. Para listas, refresh y fluidez: [PERFORMANCE.md](./PERFORMANCE.md).
3. Consulta [AGENTS.md](./AGENTS.md) y la documentación oficial de **[Expo SDK 55](https://docs.expo.dev/versions/v55.0.0/)** antes de escribir código.

---

## Flujo de trabajo

### 1. Rama

Crea una rama desde `main` (o la rama base del equipo):

```bash
git checkout -b feat/nombre-corto
# o: fix/, docs/, chore/
```

### 2. Desarrollo local

```bash
npm install
# Configurar EXPO_PUBLIC_API_BASE_URL (ver README.md)
npm start
```

Prueba en iOS y/o Android según el alcance del cambio.

### 3. Dónde colocar el código

| Tipo de cambio | Ubicación |
|----------------|-----------|
| Pantalla o ruta nueva | `app/` (Expo Router) |
| Layout de grupo `(auth)`, `(tabs)` | `app/(grupo)/_layout.tsx` |
| Componente reutilizable | `src/components/` (crear si no existe) |
| Estado global nuevo | `src/stores/` |
| Llamadas HTTP / lógica de datos | `src/lib/` o `src/services/` |
| Rutas API nuevas | `src/constants/api.ts` |
| Tokens de diseño | `src/theme/` |
| Variables de entorno | Prefijo `EXPO_PUBLIC_` + documentar en README |

Mantén paridad con SkyVault Web cuando portes endpoints o patrones de auth.

### 4. Commits

Se recomienda [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): pantalla de login
fix(api): reintentar refresh tras timeout
docs: actualizar SCHEMA con rutas tabs
chore: bump expo-router
```

### 5. Pull request

Usa la checklist al final de este documento antes de abrir el PR.

---

## Estándares de código

- **TypeScript** en modo `strict` (`tsconfig.json`).
- **Imports:** rutas relativas coherentes con el resto del repo (`../src/...` desde `app/`).
- **Secrets:** nunca commitear `.env`, tokens ni claves; usar variables `EXPO_PUBLIC_*` solo para valores no sensibles.
- **Access token:** solo en memoria vía `tokenManager`; no usar AsyncStorage para tokens.
- **Refresh token:** solo `expo-secure-store`.
- **UI:** reutilizar tokens de `src/theme/` en lugar de valores mágicos dispersos.

---

## Registro de cambios

Formato por versión: fecha, resumen, y secciones **Added**, **Changed**, **Fixed**, **Removed** según aplique.

---

### v1.9.5 — 2026-05-20

**Resumen:** Pulido de UX y optimización de carga/refresh para listas fluidas sin parpadeos ni skeleton global innecesario.

#### Added

- [PERFORMANCE.md](./PERFORMANCE.md) — patrones `isLoading` / `isRefreshing`, FlatList, catálogo, notificaciones y checklist.
- `src/shared/constants/flatListPerf.ts` — props recomendadas para listas.

#### Changed

- Hooks: `useAdminAircraftList`, `useAircraftCatalog`, `useFavorites`, `useStatistics` con refresh en segundo plano.
- Pantallas: catálogo, favoritos, admin aeronaves/usuarios, updates, estadísticas usan `isRefreshing` en pull-to-refresh.
- `CatalogAircraftCard` y `AdminAircraftRow` memoizados; catálogo sin animación `FadeInDown` por ítem.
- Tab perfil: sync API una vez por sesión; notificaciones diferidas con `InteractionManager` al volver a `active`.

#### Fixed

- Pull-to-refresh mostraba spinner de carga completa o vaciaba la sensación de lista (refresh = `isLoading`).
- Re-fetch del perfil en cada render de la tab.

---

### v1.9.4 — 2026-05-20

**Resumen:** Modal de confirmación unificado al guardar perfil, usuarios admin y aeronaves; sin parpadeo del sheet de usuarios tras refetch.

#### Added

- `UserEditModal`: `useMutationFeedback` + `ActionSuccessModal` en guardar datos, rol, activar/desactivar y eliminar.

#### Changed

- `useAdminUsers`: `isRefreshing` para refetch en segundo plano (sin desmontar lista ni modal).
- `users.tsx`: skeleton solo en carga inicial; mutaciones delegadas al modal vía `onMutated`.
- `dashboard/profile`: tras “Listo” vuelve a la tab de perfil (`router.back()`).
- `AircraftFormModal`: cierra antes de refrescar lista; oculta formulario mientras muestra confirmación.

#### Fixed

- Tras editar usuario admin, el modal parecía recargarse sin guardar (refetch + `SkeletonLoader` desmontaba el árbol).

---

### v1.9.3 — 2026-05-20

**Resumen:** Notificaciones en tiempo real con SockJS + STOMP (paridad web); ciclo de contexto roto; miniaturas con cover fijo en el recuadro 88×88.

#### Added

- `NotificationContext.ts` — contexto y `useNotifications()` separados del provider (sin require cycle).
- `normalizeNotification.ts` — ids y campos obligatorios al recibir WS o REST.
- Dependencia `sockjs-client` (mismo transporte que la web en `/ws`).

#### Changed

- `notificationSocket`: `webSocketFactory` con SockJS en lugar de WebSocket crudo; poll 10s si WS caído, 60s si conectado; `AppState` active reconecta y refresca inbox.
- `NotificationProvider`: `presentNotification` al `CREATED` (toast, pulse, items); `listError` + Reintentar en el panel; `wsConnected` en contexto.
- `AircraftThumbnail` / `CatalogAircraftCard` / `AdminAircraftRow`: recuadro 88×88 con `flexShrink: 0`, `overflow: hidden`, imagen `cover` + `absoluteFillObject`.

#### Fixed

- STOMP no conectaba en iOS (backend solo expone SockJS).
- WARN require cycle `NotificationProvider` ↔ `NotificationSheet`.
- Panel de campana vacío pese a badge; fotos que no encajaban en el thumb del catálogo.

#### Roadmap v2.0 (solo documentación)

- iPhone: Live Activities / Dynamic Island sobre el mismo `UserNotificationDto` (development build, no Expo Go). v1.9.3 deja estable SockJS + STOMP + inbox REST + campana/toast.

---

### v1.9.2 — 2026-05-20

**Resumen:** Sin crash ExponentAV en iOS; campana y toast al recibir notificaciones (WS o polling); miniaturas cover en catálogo y admin.

#### Added

- `AircraftThumbnail` compartido (`resizeMode: cover`, `overflow: hidden`).

#### Changed

- Notificaciones: solo haptics (eliminado `expo-av`); feedback en todas las prioridades; polling 20s con detección de `unread-count` subiendo → pulse + toast.
- `CatalogAircraftCard`, `AdminAircraftRow`, `AircraftCard` usan `AircraftThumbnail`.

#### Removed

- Dependencia `expo-av` y `expoAvSafe` (incompatible con Expo SDK 55 / Expo Go).

#### Fixed

- Error `Cannot find native module 'ExponentAV'` al recibir notificaciones HIGH.
- Campana sin animar cuando fallaba WebSocket y solo actualizaba el contador por poll.

---

### v1.9.1 — 2026-05-20

**Resumen:** Edición admin de aeronaves sin salto al catálogo; updates alineados al API web con moderación y motivo de rechazo; campana con pulse y dot al recibir STOMP.

#### Added

- `AdminAircraftRow`, `UpdateDetailModal`, `buildUpdateContent` / `formMetaToCreatePayload`.
- `bellPulseKey` + animación de campana al evento `CREATED`.

#### Changed

- Listado admin aeronaves abre `AircraftFormModal`; enlace «Ver en catálogo» aparte.
- `updates/new` y `updatesApiService` usan `title` + `content` (DTO backend).
- Moderación: modal con aprobar, rechazar con motivo y editar pendientes.
- `aircraft-form` redirige a `/dashboard/aircraft`.

#### Fixed

- Tap en fila admin ya no navegaba a detalle público en lugar de editar.
- POST updates con payload incorrecto (`description` / `version` sueltos).
- Rechazo con motivo fijo en lugar de textarea obligatorio.

---

### v1.9.0 — 2026-05-20

**Resumen:** Tab cuarto por rol (Estadísticas admin / Favoritos resto), carrusel KPI sincronizado, catálogo sin badge, listado admin completo y formulario aeronave alineado al DTO.

#### Added

- `AdminStatsScreen`, `FavoritesTabView`, `FavoritesGuestGate`, `useAdminAircraftList`.
- `aircraftFormUtils`, `determineSizeCategory` en `aircraftService`.
- Formulario aeronave en 5 pasos (identidad, catálogos, rendimiento, imagen, resumen).

#### Changed

- Tab `stats`: invitado/USER/MOD → Favoritos; ADMIN → Estadísticas con carrusel de 3 páginas ↔ slider.
- `CatalogAircraftCard` sin badge de estado.
- Dashboard aeronaves: `onlyActive: false`, búsqueda local, chips horizontales sin truncar fabricantes.

#### Removed

- Badge de estado en tarjetas del catálogo.

---

### v1.8.1 — 2026-05-20

**Resumen:** Arranque en Expo Go sin crash por `ExponentAV`.

#### Fixed

- `expo-av` cargado con `import()` dinámico (`expoAvSafe`); haptics como fallback si el módulo nativo no existe.

---

### v1.8.0 — 2026-05-20

**Resumen:** Corrección de filtros del catálogo, UX comparador/stats/inicio invitado, temas y visor de imagen.

#### Added

- `ImagePreviewModal`, `CompareAircraftStrip`, `catalogStatusLabel` (proxy `isActive` en listado).
- `GlassSearchBar.onSubmit`; chips de filtros ampliados en catálogo.

#### Changed

- `aircraftService.getAircraft` envía todos los params de `AircraftFilterDto`.
- Comparador: vista unificada 2–3 columnas con colores; sin PagerView.
- Stats: slider por índice + KPIs altura fija; glass con más contraste en light/dark.
- `GuestHubView`: CTAs antes de destacadas, búsqueda con `?q=`, banner comparar compacto.

#### Fixed

- Filtros tipo/estado/tamaño/pax/alcance que no filtraban (siempre 36 resultados).
- Badge «—» en catálogo sustituido por «En producción» / «Producción finalizada».

---

### v2.6.0 — 2026-05-20

**Resumen:** Optimización UX y ~90% paridad con web V2.6 — liquid glass, catálogo con filtros en modal, comparador completo, hub invitado Figma, stats segmentados, copy por rol, notificaciones premium y feedback unificado de mutaciones.

#### Added

- `src/components/ui/liquid-glass/` — `LiquidGlassSurface`, `LiquidGlassButton`, `GlassSearchBar`.
- `CatalogFilterModal`, `CatalogAircraftCard`, `GuestHubView`, `DashboardHeroHeader`.
- `AircraftPickerModal`, `comparisonService.fetchAllAircraftOptions` (paginado dinámico).
- `StatsSegmentSlider`, `StatsKpiCarousel`, `StatsRankingList`.
- `src/shared/copy/` — labels, `productionStateLabel`, `notificationCopy`.
- `useMutationFeedback`, `ActionSuccessModal`, `feedbackSound`, `notificationSound`.
- `AircraftFormModal` (wizard 3 pasos), `RequireRole`, edición de updates (`PUT`), perfil con feedback.
- `expo-av` para sonidos (HIGH + éxito, respeta reduce motion).

#### Changed

- Catálogo: barra glass + modal de filtros + chips activos (sin formulario inline).
- Comparador: picker modal buscable con todos los fabricantes (sin `slice(0,8)`).
- Inicio invitado: hub Figma; dashboards autenticados con header gradiente y copy llano.
- Stats: slider Alcance/Asientos/Eficiencia + KPI carousel + ranking.
- Notificaciones: toasts glass horizontales, bell animada, sheet agrupado, auto-dismiss 5s.

---

### v1.5.0 — 2026-05-20

**Resumen:** UX radical (motion, gate invitado, partículas), notificaciones, RBAC completo, datos API completos en detalle y comparación.

#### Added

- `AuthGateHomeView`, `SkyVaultParticleHero`, `BreathingCard`, `ScrollRevealSection`.
- `features/notifications` — service, STOMP socket, `NotificationProvider`, bell, sheet, toasts, `resolveActionRoute`.
- `features/admin` — `adminUserService`, `useAdminUsers`, `UserEditModal`.
- `app/dashboard/aircraft-form`, `app/dashboard/updates/new`.
- `AircraftSpecsTabs`, `AircraftOverviewSection`, `comparisonSpecLabels` ampliado.
- Dependencia `@stomp/stompjs`.

#### Changed

- Tab Inicio invitado: gate de login (ya no marketing en index).
- Detalle aeronave: tabs de especificaciones completas vs lista parcial.
- Comparador: secciones GENERAL, RENDIMIENTO, CAPACIDAD, DIMENSIONES, MOTOR con flatten de `specifications`.
- `Button` variant `secondary`; `EXPO_PUBLIC_WS_URL` activo para notificaciones.

---

### v1.4.0 — 2026-05-20

**Resumen:** Home por rol (marketing vs dashboard), dashboard admin completo, comparador con imágenes y tabla, subpáginas fabricantes/familias, Expo Go sin warnings SwiftUI.

#### Added

- `useAuth`, vistas `UserDashboardView`, `AdminDashboardView`, `ModeratorDashboardView`, `HomeMarketingView`.
- Rutas `app/dashboard/*` (favoritos, comparaciones, perfil, updates, users, aircraft, settings).
- `ComparisonGrid`, `ComparisonSection`, pager en Compare, `getGroupedAircraft`.
- `app/manufacturers/index.tsx`, `app/families/index.tsx`.
- `compareHistory` con AsyncStorage, `useUserComparisonInsights`.
- Dependencias: `@react-native-async-storage/async-storage`, `react-native-pager-view`.

#### Changed

- Tab Inicio deja de ser catálogo; catálogo canónico en Buscar.
- Perfil solo cuenta (login compacto si invitado).
- `PlatformFilterForm` / `PlatformSpecificationsForm` / `StatsProgress` — RN puro en Expo Go.

#### Fixed

- Usuario autenticado ya no ve CTAs de login en Inicio (dashboard según `ROLE_*`).

---

### v1.3.0 — 2026-05-20

**Resumen:** Corrección de login (403), pantalla de bienvenida alineada con web, navegación pública, favoritos y familias.

#### Added

- Pantalla [`app/welcome.tsx`](app/welcome.tsx) con logo SVG, gradientes V2.6, animaciones Reanimated y CTAs.
- [`src/features/auth/`](src/features/auth/) — `mapAuthResponse`, `userService`, `useFavorites`, `FavoriteToggle`.
- [`src/features/families/`](src/features/families/) y ruta `app/families/[id].tsx`.
- [`src/components/native/SkyVaultLogo.tsx`](src/components/native/SkyVaultLogo.tsx).
- [`metro.config.js`](metro.config.js), `react-native-svg-transformer`, `svg.d.ts`.
- `getAuthErrorMessage()` para mensajes de login/registro como en web.

#### Changed

- Flujo inicial: `/` → `/welcome` (no login forzado).
- Tabs públicos sin guard de auth; perfil invitado con CTAs.
- `authStore` usa usuario de respuesta login/register/refresh (paridad `AuthContext` web).
- Versión de producto y documentación **1.3.0**.

#### Fixed

- Interceptor Axios: solo omite Bearer en `/auth/login`, `/auth/register`, `/auth/refresh` (antes bloqueaba `/auth/me` y causaba 403 tras login).
- Mensajes 401/403 en login alineados con web (credenciales / cuenta desactivada).

---

### v1.2.0 — 2026-05-21

**Resumen:** Primera versión navegable del cliente móvil: auth completa, cinco tabs con datos del backend, design system V2.6 en móvil y corrección del toolchain Babel/React para Expo SDK 55.

#### Added

- Pantallas `app/(auth)/login`, `register` y tabs `index`, `search`, `compare`, `stats`, `profile`.
- `register()` en [`src/stores/authStore.ts`](src/stores/authStore.ts).
- Capa `src/features/` (aircraft, comparison, statistics) con services y hooks portados del web.
- `src/components/` (ui, native, swiftui, platform).
- `ThemeProvider` y consumo de tokens vía `useTheme()`.
- [`babel.config.js`](babel.config.js), [`eas.json`](eas.json), [`.env.example`](.env.example).
- Dependencia `@expo/ui` con fallback React Native en Android.
- Rutas de estadísticas extendidas en [`src/constants/api.ts`](src/constants/api.ts).

#### Changed

- Versión de producto y documentación actualizadas a **1.2.0**.
- README y SCHEMA alineados con el árbol real del repositorio.

#### Fixed

- `babel-preset-expo` instalado explícitamente (error Metro al bundlear en iOS).
- `react` y `react-dom` alineados a **19.2.0** según Expo SDK 55.

#### Removed

- `index.ts` legacy (entry activo: `expo-router/entry`).

---

### v1.0.0 — 2026-05-20

**Resumen:** Fundación del cliente móvil SkyVault con Expo Router, autenticación, cliente API y design tokens portados desde SkyVault Web V2.6.

#### Added

- Migración a **Expo Router** (`expo-router/entry`, `app/_layout.tsx`, `app/index.tsx`).
- Cliente HTTP **Axios** con interceptors de refresh y cola ante 401 (`src/lib/api.ts`).
- Catálogo de rutas API 1:1 con el frontend web (`src/constants/api.ts`).
- Store de autenticación **Zustand** con `login`, `logout`, `hydrate` (`src/stores/authStore.ts`).
- Tokens de diseño: colores light/dark, spacing, tipografía Inter (`src/theme/`).
- Configuración Expo para iOS y Android (`app.json`, bundle `com.skyvault.mobile`).
- Documentación: `README.md`, `SCHEMA.md`, `CONTRIBUTING.md`.

#### Changed

- Entry de aplicación de `index.ts` / `App.tsx` hacia Expo Router (ver deuda en Removed/Pendiente).

#### Pendiente (no incluido en v1.0.0)

- Pantallas `app/(auth)/login` y grupo `app/(tabs)/`.
- Carpeta `src/components/` y pantallas de dominio (aeronaves, búsqueda, etc.).
- Cliente WebSocket (`WS_URL` definido sin uso).
- Eliminación de `index.ts` legacy.
- Archivo `.env.example` en el repositorio.

---

## Plantilla para nuevas versiones

Copia y completa al publicar una versión:

```markdown
### vX.Y.Z — YYYY-MM-DD

**Resumen:** Una oración sobre el hito principal.

#### Added
- ...

#### Changed
- ...

#### Fixed
- ...

#### Removed
- ...
```

---

## Checklist de PR

- [ ] El código compila sin errores de TypeScript.
- [ ] `npx expo-doctor` sin problemas críticos.
- [ ] Probado en simulador iOS y/o Android según corresponda.
- [ ] Flujos de auth probados si se tocó `authStore` o `api.ts` (login, hydrate, logout, 401).
- [ ] Nuevas variables de entorno documentadas en `README.md`.
- [ ] Rutas nuevas documentadas en `SCHEMA.md` si cambia la estructura de `app/`.
- [ ] Entrada añadida en **Registro de cambios** (sección de la versión correspondiente).
- [ ] Sin secrets ni archivos `.env*.local` en el commit.
- [ ] Cambios alineados con docs Expo v55 para APIs de Expo usadas.

---

## Preguntas y referencias

| Tema | Archivo |
|------|---------|
| Comandos y variables de entorno | [README.md](./README.md) |
| Árbol y flujos API | [SCHEMA.md](./SCHEMA.md) |
| Reglas para agentes / IA | [AGENTS.md](./AGENTS.md) |
