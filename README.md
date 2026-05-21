# SkyVault Mobile

Aplicación móvil de **SkyVault** para iOS y Android. Cliente nativo del ecosistema SkyVault que consume el backend API v1 (catálogo de aeronaves, autenticación, perfil, búsqueda, comparación, estadísticas, notificaciones y panel admin).

**Versión:** 1.9.5  
**Estado:** Listas fluidas con refresh en segundo plano, notificaciones SockJS + STOMP, dashboards por rol, catálogo con filtros modal, comparador completo, RBAC admin y patrones documentados en [PERFORMANCE.md](./PERFORMANCE.md).

---

## Requisitos

- Node.js 18+ (recomendado LTS)
- npm
- [Expo CLI](https://docs.expo.dev/) (vía `npx expo`)
- Backend SkyVault (Spring Boot) en ejecución para datos reales
- Para desarrollo local:
  - **iOS:** Xcode + Simulator (macOS) o [Expo Go](https://expo.dev/go)
  - **Android:** Android Studio + emulador o dispositivo físico

---

## Desarrollo local

Orden recomendado para probar la app de punta a punta:

1. **Backend** — Arranca el proyecto Spring Boot en IntelliJ (o tu IDE). Verifica health en `http://localhost:8080/api/v1/health/liveness` (o el puerto que uses).
2. **Variables de entorno** — Copia y ajusta la URL del API (ver sección siguiente).
3. **Dependencias** — `npm install` en la raíz de este repo.
4. **Expo** — `npm start` en la terminal de Cursor (o tu terminal).
5. **Simulador** — Pulsa `i` en la consola de Expo para iOS, o `a` para Android. No hace falta abrir Xcode manualmente salvo que quieras elegir otro dispositivo o hacer un build nativo.

El Dev Server mostrará una URL tipo `exp://192.168.x.x:8081`. En **iOS Simulator**, la API del backend debe usar la **IP LAN de tu Mac**, no `localhost`.

---

## Inicio rápido

```bash
npm install
cp .env.example .env
# Editar EXPO_PUBLIC_API_BASE_URL (ver tabla abajo)

npm start
# En la consola de Expo: i = iOS simulator, a = Android
```

Atajos:

```bash
npm run ios      # expo start --ios
npm run android  # expo start --android
```

---

## Variables de entorno

Expo expone variables públicas con el prefijo `EXPO_PUBLIC_`. Defínelas en `.env` o `.env.local` en la raíz (no se commitean archivos `*.local` según `.gitignore`).

| Plataforma | `EXPO_PUBLIC_API_BASE_URL` recomendada |
|------------|----------------------------------------|
| iOS Simulator | `http://<IP-LAN-de-tu-Mac>:8080/api/v1` (ej. `http://192.168.1.250:8080/api/v1`) |
| Android Emulator | `http://10.0.2.2:8080/api/v1` |
| Dispositivo físico / staging | URL pública del backend (Railway, Render, etc.) |

```bash
# Obtener IP LAN en macOS
ipconfig getifaddr en0
```

| Variable | Descripción |
|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL del REST API (debe incluir `/api/v1`) |
| `EXPO_PUBLIC_WS_URL` | Endpoint SockJS para notificaciones STOMP (ej. `http://localhost:8080/ws`) |

Tras cambiar `.env`, **reinicia** Metro (`Ctrl+C` y `npm start` de nuevo).

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| `Cannot find module 'babel-preset-expo'` | Ejecutar `npx expo install babel-preset-expo` (incluido desde v1.2.0) |
| Aviso de versiones de `react` / `react-dom` | `npx expo install react react-dom` para alinear con Expo SDK 55 |
| Bundling falla tras un fix | `rm -rf .expo` y `npm start` de nuevo |
| Network Error / no hay datos | Revisar IP en `.env`, backend arriba, CORS en Spring |
| Cambios en `.env` no aplican | Reiniciar el servidor Expo |
| Notificaciones sin conectar en iOS | El backend expone **SockJS** en `/ws`, no WebSocket crudo; revisar `EXPO_PUBLIC_WS_URL` y [SCHEMA.md](./SCHEMA.md#notificaciones-tiempo-real) |

Verificación del toolchain:

```bash
npx expo-doctor
npx tsc --noEmit
```

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia Expo Dev Server |
| `npm run ios` | Abre la app en simulador iOS |
| `npm run android` | Abre la app en emulador/dispositivo Android |
| `npm run web` | Modo web (secundario) |

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | [Expo](https://expo.dev/) SDK 55 |
| UI | React 19.2 + React Native 0.83 |
| Navegación | [Expo Router](https://docs.expo.dev/router/introduction/) ~55 |
| Estado global | [Zustand](https://zustand.docs.pmnd.rs/) 5 |
| HTTP | [Axios](https://axios-http.com/) 1.16 |
| Tiempo real | `sockjs-client` + `@stomp/stompjs` (notificaciones) |
| Persistencia | expo-secure-store (refresh token); AsyncStorage (historial comparaciones) |
| Tipografía | Inter (`@expo-google-fonts/inter`) |
| Animación | react-native-reanimated, gesture-handler |
| Diseño móvil | ThemeProvider, expo-blur, expo-linear-gradient, expo-haptics, liquid glass |
| iOS nativo (opcional) | `@expo/ui` (SwiftUI) con fallback React Native |
| Lenguaje | TypeScript (strict) |

**Documentación de referencia:** [Expo SDK 55](https://docs.expo.dev/versions/v55.0.0/) — [AGENTS.md](./AGENTS.md).

---

## Relación con SkyVault Web V2.6

- **API:** `src/constants/api.ts` (mapa 1:1 con el web).
- **HTTP:** `src/lib/api.ts` (refresh JWT, tokens en memoria + SecureStore).
- **Features:** servicios y tipos portados desde el frontend web (`src/features/`, `src/shared/types/`).
- **Copy:** `src/shared/copy/` alineado con etiquetas y estados de producción del web.
- **Diseño:** tokens en `src/theme/` alineados con SkyVault Design System V2.6.

---

## Estructura del proyecto

```
app/           → Pantallas Expo Router (welcome, auth, tabs, dashboard, detalle)
src/
  features/    → Dominio: aircraft, auth, comparison, statistics, favorites,
                 notifications, admin, dashboard, families, home, welcome
  components/  → ui, native, liquid-glass, media, motion, feedback, layout,
                 navigation, platform, swiftui
  shared/      → types, copy, constants (flatListPerf), utils
  stores/      → authStore
  theme/       → tokens + ThemeProvider
  lib/         → cliente Axios
  constants/   → api.ts
  hooks/       → useStaggerEntrance
  utils/       → expoUiAvailable
```

Detalle de rutas, RBAC y módulos: **[SCHEMA.md](./SCHEMA.md)**.

---

## Estado actual (v1.9.5)

### Implementado

- **Navegación:** welcome pública; 5 tabs; cuarta tab dinámica (Favoritos vs Estadísticas admin); stack `dashboard/*` con guard de auth
- **Inicio:** invitado → `GuestHubView`; autenticado → dashboard por rol (USER / MOD / ADMIN)
- **Catálogo:** búsqueda, filtros en modal, chips activos, miniaturas 88×88 cover, refresh sin skeleton global
- **Comparador:** 2–3 columnas, picker paginado, historial en AsyncStorage
- **Notificaciones:** inbox REST, badge, sheet, toasts, SockJS + STOMP, polling de respaldo, haptics (sin `expo-av`)
- **Admin:** usuarios (rol, activar, eliminar), CRUD aeronaves (formulario 5 pasos), updates con moderación y motivo de rechazo
- **Estadísticas:** `AdminStatsScreen` con carrusel KPI y rankings (solo admin en tab stats)
- **UX:** liquid glass, `ActionSuccessModal` / `useMutationFeedback`, temas claro/oscuro, motion en welcome y dashboards
- **Rendimiento:** patrones `isLoading` / `isRefreshing` — ver [PERFORMANCE.md](./PERFORMANCE.md)

Historial de versiones: [CONTRIBUTING.md](./CONTRIBUTING.md#registro-de-cambios).

### Pendiente

- Push nativo FCM/APNs
- FLIP modal admin como en web (GSAP)
- Noticias, About, FAQ
- Live Activities / Dynamic Island (roadmap v2.0; requiere development build)
- SwiftUI opcional vía `npx expo run:ios` (más allá de Expo Go)

---

## Documentación adicional

| Archivo | Contenido |
|---------|-----------|
| [SCHEMA.md](./SCHEMA.md) | Árbol, rutas, RBAC, flujos, API, notificaciones |
| [PERFORMANCE.md](./PERFORMANCE.md) | Carga, refresh y fluidez de listas |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribución y changelog |
| [AGENTS.md](./AGENTS.md) | Reglas para agentes / IA |
