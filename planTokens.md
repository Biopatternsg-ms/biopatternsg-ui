# Plan de Tokens — `biopatternsg-ui`

Documento que describe la implementación del sistema de autenticación basado en `access_token` + `refresh_token` para proteger las vistas del dashboard.

---

## 1. Objetivo

Centralizar la gestión de tokens JWT (access + refresh), proteger las rutas del módulo `dashboard` mediante un guard de router, y renovar el `access_token` de forma transparente cuando expire, sin dependencias nuevas (se mantiene `fetch` nativo).

**Decisiones de diseño confirmadas:**

- El backend responde al login con `{ access_token, refresh_token }` en el body.
- Los tokens se persisten en `localStorage`.
- El endpoint de refresh es `POST /config-and-control/users/refresh-token`.
- El árbol de rutas bajo `/dashboard` se considera privado.

---

## 2. Arquitectura

```
LoginForm ─► authService.loginUser()
              │
              ▼
         200 + TokenPair
              │
              ▼
         AuthContext.login()  ─► tokenStorage.setTokens()
              │                      (access_token, refresh_token en localStorage)
              ▼
         navigate(from ?? "/dashboard")
              │
              ▼
         ProtectedRoute (consulta isProtectedRoute + useAuth)
              │
              ▼
         <Dashboard />

Cualquier fetch posterior:
  componente ─► authFetch(input, init)
                   │
                   ├─ inyecta Authorization: Bearer <access_token>
                   │
                   └─ si 401:
                        ├─ performRefresh()  (single-flight, una sola promesa compartida)
                        │     └─ authService.refreshAccessToken()
                        │           └─ POST /config-and-control/users/refresh-token
                        │                 body: { refresh_token }
                        ├─ reintenta la petición original con el nuevo token
                        └─ si refresh falla:
                              ├─ tokenStorage.clearTokens()
                              └─ dispatch CustomEvent("biopatternsg:session-expired")
                                    └─ AuthContext lo escucha → logout global → redirect /login
```

---

## 3. Archivos del plan

### 3.1 Nuevos (6)

| Ruta | Propósito |
|---|---|
| `src/services/tokenStorage.ts` | Capa única de acceso a `localStorage` para tokens. Encapsula `getAccessToken`, `getRefreshToken`, `setTokens`, `setAccessToken`, `clearTokens`, `hasAccessToken`. |
| `src/services/httpClient.ts` | `authFetch(input, init)`: envuelve `fetch`, inyecta Bearer, intercepta 401, dispara refresh con **single-flight** y emite el evento `biopatternsg:session-expired` si el refresh falla. |
| `src/context/AuthContext.tsx` | `AuthProvider` + `useAuth()`. Expone `isAuthenticated`, `login(tokens)`, `logout()`. Rehidrata desde storage al montar y se suscribe al evento de sesión expirada. |
| `src/routes/protectedRoutes.ts` | Registro declarativo de rutas protegidas. Hoy contiene `["/dashboard"]`. Función `isProtectedRoute(path)` para el guard. |
| `src/components/auth/ProtectedRoute.tsx` | Guard de router. Si la ruta es protegida y no hay token, redirige a `/login` preservando el `from` en `location.state`. |
| `planTokens.md` | Este documento. |

### 3.2 Editados (6)

| Ruta | Cambio |
|---|---|
| `src/domain/models/Auth.ts` | Añadidos `TokenPair` y `RefreshPayload`. Eliminado el placeholder `AuthSession` no usado. |
| `src/services/apiConfig.ts` | Añadidos `REFRESH_PATH` y `REFRESH_ENDPOINT`. |
| `src/services/authService.ts` | Reemplazado `saveSession/getSession/clearSession` (no tipados) por `persistSession(tokens)`, `refreshAccessToken()` y `logout()`. `loginUser` se mantiene intacto. |
| `src/main.tsx` | `<App />` envuelto con `<AuthProvider>`. |
| `src/App.tsx` | Ruta `/dashboard` anidada bajo `<Route element={<ProtectedRoute />}>`. |
| `src/components/organisms/LoginForm.tsx` | En el `200` llama a `useAuth().login(tokens)` y navega a `location.state.from ?? "/dashboard"`. |
| `src/components/molecules/UserMenu.tsx` | El botón "Cerrar sesión" usa `useAuth().logout()` en lugar de `clearSession()` para mantener sincronizado el estado de React. |

---

## 4. Contrato esperado del backend

| Endpoint | Método | Body | Respuesta éxito |
|---|---|---|---|
| `/config-and-control/users/login` | `POST` | `{ username, password }` | `200` + `{ access_token, refresh_token }` |
| `/config-and-control/users/refresh-token` | `POST` | `{ refresh_token }` | `200` + `{ access_token, refresh_token }` (nuevo par) |
| `/config-and-control/users/*` (resto) | * | * | requiere `Authorization: Bearer <access_token>` |

> Si el access_token expira, el backend responde `401`. El interceptor ejecuta el refresh y reintenta una sola vez. Si el refresh también devuelve no-2xx, se considera sesión irrecuperable.

---

## 5. Flujos clave

### 5.1 Login

1. Usuario envía el formulario.
2. `LoginForm` llama a `authService.loginUser(payload)`.
3. Si `200`: parsea el body como `TokenPair`, llama a `useAuth().login(pair)` (que persiste y actualiza el contexto) y navega a `from ?? "/dashboard"`.
4. Si `401`: muestra `ErrorModal` con el `message` del backend (o mensaje por defecto).

### 5.2 Acceso a `/dashboard` sin token

1. `ProtectedRoute` lee `useAuth().isAuthenticated` y `isProtectedRoute(pathname)`.
2. Como `/dashboard` está en `PROTECTED_ROUTES` y no hay token, retorna `<Navigate to="/login" replace state={{ from }} />`.

### 5.3 Recarga de página con token

1. `<AuthProvider>` se monta, ejecuta `useEffect` → `setIsAuthenticated(hasAccessToken())`.
2. `ProtectedRoute` ve `isAuthenticated === true` y renderiza `<Outlet />`.

### 5.4 Access token expirado durante una petición

1. `authFetch` recibe un `401`.
2. Llama a `performRefresh()` (si ya hay un refresh en curso, reutiliza esa promesa).
3. `authService.refreshAccessToken()` hace `POST /config-and-control/users/refresh-token` con el refresh_token.
4. Si OK: persiste el nuevo par y reintenta la petición original con el nuevo Bearer.
5. Si falla: `tokenStorage.clearTokens()` + `dispatchEvent("biopatternsg:session-expired")` + `AuthContext` lo escucha y hace logout global. `ProtectedRoute` redirige a `/login` en el siguiente render.

### 5.5 Logout manual

1. `UserMenu` → `useAuth().logout()`.
2. Limpia tokens de `localStorage` y pone `isAuthenticated = false`.
3. `ProtectedRoute` detecta el cambio y redirige a `/login`.

---

## 6. Verificación realizada

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | OK (0 errores) |
| `npm run build` | OK — 1868 modules, CSS 25.94 kB, JS 394.23 kB |

### Pruebas manuales sugeridas

1. **Login válido** → redirige a `/dashboard` y se ve contenido del dashboard.
2. **Acceso directo a `/dashboard` sin token** → redirige a `/login`.
3. **Login válido y luego refresh** → abrir devtools, expirar manualmente el access_token (borrar `access_token` de `localStorage` o esperar expiración), hacer una llamada → el interceptor hace refresh y la operación continúa transparente.
4. **Refresh inválido** → borrar también `refresh_token` y repetir → la app va a `/login`.
5. **Logout** desde `UserMenu` → limpia tokens, redirige a `/`.
6. **Recarga con token válido** → sigue en `/dashboard`.

---

## 7. Notas y extensiones futuras

- **localStorage y XSS**: el diseño aísla el acceso a tokens en `tokenStorage.ts`. Si en el futuro se migra a cookies `httpOnly`, sólo se tocan ese archivo y `httpClient.ts` (el body del refresh dejaría de incluir el token, ya que viajaría en la cookie).
- **Nuevas vistas de dashboard**: cualquier nueva ruta debe agregarse a `PROTECTED_ROUTES` y, opcionalmente, anidarse bajo `<Route element={<ProtectedRoute />}>` en `App.tsx` para heredar la protección.
- **Refrescar proactivo**: hoy el refresh es reactivo al `401`. Si se quiere, se puede añadir un `setTimeout` que decodifique el `exp` del JWT y refresque antes de que expire. Ese código iría en `AuthContext` o en un nuevo hook `useTokenRefresh`.
- **Renovación del usuario en paralelo**: el `AuthContext` no guarda el perfil del usuario. Si más adelante `/users/me` u otro endpoint devuelve datos del usuario, se puede añadir un `useUser` o extender el contexto.
