# Documentación Técnica — `biopatternsg-ui`

> Plataforma de interfaz web para investigadores genómicos construida con **React 19 + TypeScript + Vite**. Este documento describe las tecnologías, la arquitectura y el flujo de uso de los componentes del proyecto.

---

## Tabla de contenidos

1. [Tecnologías utilizadas](#1-tecnologías-utilizadas)
2. [Gestión de almacenamiento en el navegador](#2-gestión-de-almacenamiento-en-el-navegador)
3. [Arquitectura del proyecto](#3-arquitectura-del-proyecto)
4. [Componentes y vistas](#4-componentes-y-vistas)
5. [Flujo de autenticación y protección de rutas](#5-flujo-de-autenticación-y-protección-de-rutas)
6. [Convenciones y reglas de diseño](#6-convenciones-y-reglas-de-diseño)
7. [Scripts de desarrollo y build](#7-scripts-de-desarrollo-y-build)

---

## 1. Tecnologías utilizadas

### 1.1 Stack base

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework UI | **React** | 19.2.6 | Renderizado declarativo de la interfaz |
| Lenguaje | **TypeScript** | ~6.0.2 | Tipado estático (modo `verbatimModuleSyntax`, `erasableSyntaxOnly`) |
| Bundler / Dev server | **Vite** | 8.0.12 | HMR, build, proxy de desarrollo |
| Routing | **react-router-dom** | 7.15.1 | Rutas SPA, `<Outlet>`, `useNavigate`, `useLocation` |
| Estilos | **Tailwind CSS** | 3.4.19 | Sistema de tokens, utility-first, JIT |
| Utilidades CSS | `class-variance-authority` ^0.7.1 | Variantes tipadas (`Button`, `Badge`, `Label`) |
| Utilidades CSS | `clsx` + `tailwind-merge` | `cn()` para fusionar clases sin conflictos |
| Iconos | **lucide-react** | 1.14.0 | Set de iconos SVG (ArrowRight, Dna, Microscope, etc.) |
| Primitivos accesibles | `@radix-ui/react-*` | últimas | Dialog, Dropdown, Navigation, Form, Checkbox, Label, Slot |

### 1.2 Diseño y sistema de tokens

El sistema de diseño se llama **"The Clinical Lens"** y se compone de:

- **`tailwind.config.ts`** — tokens de color (Material Color System), tipografía (Inter / Space Grotesk), `borderRadius`, `boxShadow` (todas teñidas, sin grises neutros).
- **`src/index.css`** — variables CSS Shadcn-UI bridge, modo `.dark`, utilidades personalizadas:
  - `.pulse-gradient` — gradiente azul primario (135deg, #0066FF → #0052cc)
  - `.glass-panel` — fondo semi-transparente + `backdrop-blur` para tarjetas
  - `.glass-nav` — navbar fija con blur
  - `.shadow-ambient` / `.shadow-ambient-md` — sombras teñidas con `#0d1c2e`
- **`src/lib/utils.ts`** — helper `cn()` que aplica `twMerge(clsx(...))` para combinar clases evitando duplicados.

Reglas aplicadas (resumidas):

- **No-Line** — separación por color de fondo o `outline-variant/15`; nunca `border` 1px.
- **Glass & Gradient** — navbar, modales y cards con `backdrop-blur-xl`; CTAs primarios con `pulse-gradient`.
- **Tipografía** — Inter (headline / body) + Space Grotesk (label uppercase tracking-widest).

### 1.3 Validación de autenticación

La autenticación se valida en **tres capas**:

1. **Validación de formulario (cliente)** — `react-hook-form` + `zod` vía `@hookform/resolvers/zod`.
   - `LoginForm` valida que `username` sea email y `password` no esté vacío.
   - `RegisterForm` valida email + nombres de 2-50 caracteres + password de 8-128 caracteres.
   - Los errores se renderizan localmente y se exponen al `ErrorModal` cuando provienen del backend.

2. **Validación de sesión (cliente)** — `AuthContext` expone `isAuthenticated`, derivado de la presencia de `access_token` en `localStorage`. El guard de router (`<ProtectedRoute />`) consulta este flag junto con `isProtectedRoute(path)` para permitir o redirigir.

3. **Validación contra el backend** — cada request a `config-and-control/*` lleva el header `Authorization: Bearer <access_token>` (inyectado por `httpClient.authFetch`). Si el backend responde `401`, el cliente dispara un único refresh; si éste también falla, se emite el evento `biopatternsg:session-expired` y el `AuthContext` limpia la sesión y obliga a re-autenticarse.

### 1.4 Peticiones a `config-and-control`

Todas las llamadas al backend pasan por los servicios en `src/services/`, que se construyen a partir de constantes declaradas en `src/services/apiConfig.ts`:

```ts
CONFIG_AND_CONTROL  → "" (dev) | VITE_API_URL (prod)
REGISTER_PATH       = "config-and-control/users"
LOGIN_PATH          = "config-and-control/users/login"
REFRESH_PATH        = "config-and-control/users/refresh-token"
```

Cada endpoint se compone como `${CONFIG_AND_CONTROL}/${PATH}`:

- `USERS_ENDPOINT`   → POST register
- `LOGIN_ENDPOINT`   → POST login
- `REFRESH_ENDPOINT` → POST refresh

#### Estrategia de URL (Dev vs Prod)

- **Desarrollo** — `CONFIG_AND_CONTROL = ""`. El navegador hace requests al mismo origen (`localhost:5173`) y Vite las redirige al backend mediante el proxy definido en `vite.config.ts` (`server.proxy["/config-and-control"]`). Esto evita CORS en dev.
- **Producción** — `CONFIG_AND_CONTROL = VITE_API_URL` (leída de `.env.production`).

#### Capa HTTP

- `fetch` nativo (no se usa Axios).
- `authFetch` (en `src/services/httpClient.ts`) es el wrapper que **inyecta el Bearer**, **detecta 401**, **ejecuta un único refresh con single-flight** y **reintenta la petición** con el nuevo token. Si el refresh falla, limpia la sesión y notifica al `AuthContext`.

---

## 2. Gestión de almacenamiento en el navegador

El proyecto **no utiliza `sessionStorage`** (verificado en todo el código: no hay referencias a esa API). El almacenamiento se concentra exclusivamente en `localStorage`, y todo el acceso está **encapsulado en `src/services/tokenStorage.ts`**, de modo que ningún componente ni servicio toca `localStorage` directamente.

### 2.1 Claves de `localStorage`

| Clave | Contenido | Origen | Lectura | Borrado |
|---|---|---|---|---|
| `access_token` | JWT de corta duración (Bearer) | `setTokens()` al login o al refresh | `getAccessToken()` en cada `authFetch` | `clearTokens()` en logout o sesión expirada |
| `refresh_token` | Credencial de larga duración para renovar el `access_token` | `setTokens()` al login o al refresh | `getRefreshToken()` desde `authService.refreshAccessToken()` | `clearTokens()` en logout o sesión expirada |

> Antes de la refactorización de tokens existía la clave `auth_session` con un JSON sin tipar; fue reemplazada por las dos claves separadas para tipar correctamente y permitir el manejo individual.

### 2.2 Ciclo de vida de los tokens

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. Login OK 200                                                         │
│     AuthContext.login(pair)                                              │
│       └─► tokenStorage.setTokens({ access_token, refresh_token })        │
│                                                                          │
│  2. Cada request                                                         │
│     authFetch()                                                          │
│       └─► tokenStorage.getAccessToken()                                  │
│       └─► Header: Authorization: Bearer <access_token>                   │
│                                                                          │
│  3. Si 401                                                               │
│     performRefresh()  (single-flight)                                    │
│       └─► tokenStorage.getRefreshToken()                                 │
│       └─► POST /config-and-control/users/refresh-token                      │
│       └─► tokenStorage.setTokens(new pair)                               │
│       └─► retry request                                                  │
│                                                                          │
│  4. Si refresh falla                                                     │
│     window.dispatchEvent("biopatternsg:session-expired")                 │
│     AuthContext handler                                                  │
│       └─► tokenStorage.clearTokens()                                     │
│       └─► setIsAuthenticated(false)  → ProtectedRoute redirige a /login │
│                                                                          │
│  5. Logout manual (UserMenu)                                             │
│     useAuth().logout()                                                   │
│       └─► tokenStorage.clearTokens()                                     │
│       └─► setIsAuthenticated(false)                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Datos del usuario

A la fecha, el proyecto **no persiste un perfil de usuario** (nombre, email, etc.) en `localStorage`. El único dato del usuario implícito en storage son los tokens, y el `AuthContext` deriva `isAuthenticated` de la presencia de `access_token`. Si en el futuro se almacena el perfil, debe hacerse a través de un nuevo módulo (p. ej. `src/services/userStorage.ts`) siguiendo el mismo principio de encapsulación.

### 2.4 `sessionStorage`

`sessionStorage` **no se usa** en el proyecto actual. No hay archivos que lo importen. Esto es una decisión deliberada: se prefiere persistencia entre recargas (`localStorage`) para que la sesión del investigador no se pierda al refrescar la página durante una sesión de análisis.

---

## 3. Arquitectura del proyecto

El proyecto sigue una variante del **Atomic Design** combinada con **capas por responsabilidad** (domain → services → adapters → components → modules).

### 3.1 Árbol de carpetas

```
src/
├── adapters/                 ← Traduce valores de UI a payloads de API
│   ├── authAdapter.ts
│   └── userAdapter.ts
│
├── context/                  ← React Contexts globales
│   └── AuthContext.tsx       ← AuthProvider + useAuth
│
├── components/               ← UI reutilizable (Atomic Design)
│   ├── atoms/                ← Bloques indivisibles (Button, Input, Label…)
│   ├── molecules/            ← Composición de 2+ átomos (FormField, StatCard…)
│   └── organisms/            ← Secciones completas (Header, HeroSection, LoginForm…)
│
├── modules/                  ← Vistas/pantallas de la app
│   ├── public/               ← Sin auth
│   │   └── landing/
│   ├── authenticator/        ← Login, registro, recuperación
│   │   ├── login/
│   │   └── register/
│   └── dashboard/            ← Protegido (requiere access_token)
│       └── dashboard/
│
├── services/                 ← Lógica de comunicación con el backend
│   ├── apiConfig.ts          ← Constantes de endpoints
│   ├── authService.ts        ← loginUser, refreshAccessToken, logout
│   ├── userService.ts        ← registerUser
│   ├── tokenStorage.ts       ← Encapsula localStorage de tokens
│   └── httpClient.ts         ← authFetch con interceptor + refresh
│
├── domain/                   ← Modelos y tipos (sin lógica)
│   └── models/
│       ├── Auth.ts
│       └── User.ts
│
├── routes/                   ← Configuración declarativa de rutas
│   └── protectedRoutes.ts    ← Lista de rutas que requieren auth
│
├── lib/
│   └── utils.ts              ← cn() helper
│
├── assets/                   ← Logos, imágenes estáticas
├── App.tsx                   ← Router + ProtectedRoute
├── main.tsx                  ← Bootstrap (envuelve con AuthProvider)
└── index.css                 ← Tailwind + tokens CSS
```

### 3.2 Capas y dependencias (regla de oro)

```
domain/models/  ← no importa nada del proyecto (excepto tipos puros)
       ▲
       │ import type
       │
adapters/       ← depende solo de domain
       ▲
services/       ← depende de domain, services (apiConfig, tokenStorage)
       ▲
components/     ← depende de services, adapters, atoms
       ▲
modules/        ← ensambla components y conecta con services
       ▲
App.tsx         ← define rutas; los modules son sus elementos
```

**Regla práctica:** un módulo no debe ser importado por un componente; un componente no debe ser importado por un adapter. Esto evita ciclos y mantiene cada capa testeable de forma aislada.

### 3.3 Archivos clave por capa

| Archivo | Rol |
|---|---|
| `src/domain/models/Auth.ts` | `LoginPayload`, `TokenPair`, `RefreshPayload` |
| `src/domain/models/User.ts` | `RegisterPayload`, `User` |
| `src/services/apiConfig.ts` | `CONFIG_AND_CONTROL`, `USERS_ENDPOINT`, `LOGIN_ENDPOINT`, `REFRESH_ENDPOINT` |
| `src/services/tokenStorage.ts` | `getAccessToken`, `getRefreshToken`, `setTokens`, `setAccessToken`, `clearTokens`, `hasAccessToken` |
| `src/services/authService.ts` | `loginUser`, `refreshAccessToken`, `logout`, `persistSession` |
| `src/services/httpClient.ts` | `authFetch`, evento `biopatternsg:session-expired`, single-flight refresh |
| `src/context/AuthContext.tsx` | `<AuthProvider>`, `useAuth()` → `isAuthenticated`, `login`, `logout` |
| `src/routes/protectedRoutes.ts` | `PROTECTED_ROUTES`, `isProtectedRoute(path)` |
| `src/components/auth/ProtectedRoute.tsx` | Guard de router |
| `src/adapters/authAdapter.ts` | `LoginFormValues` → `LoginPayload` |
| `src/adapters/userAdapter.ts` | `RegisterFormValues` → `RegisterPayload` |

---

## 4. Componentes y vistas

### 4.1 Átomos (`src/components/atoms/`)

Componentes sin estado, altamente reutilizables.

| Átomo | Variantes / props | Usado en |
|---|---|---|
| `Button` | `primary` · `ghost` · `surface` · `outline` · `link` · `destructive` × tamaños `sm/md/lg/xl/icon` | `Header`, `HeroSection`, `CTASection`, `LoginForm`, `RegisterForm`, `SuccessModal`, `ErrorModal`, `UserMenu`, `BentoSection` |
| `Input` | `forwardRef`; estilos del sistema (sin border, fondo `surface-container-high`, focus `ring-primary/30`) | `LoginFormFields`, `RegisterFormFields` |
| `Label` | Tamaños `xs` (default) / `sm` / `md`; basado en `@radix-ui/react-label` | `LoginFormFields`, `RegisterFormFields`, `FormField` |
| `Badge` | `success` · `neutral` · `primary` · `live` | `BentoSection` |
| `NavLink` | `active?: boolean`; resaltado de borde inferior | `Header` (todas las variantes) |
| `Avatar` | `initials?` y `size?: sm/md/lg`; fallback a icono `User` | `UserMenu` |
| `SuccessModal` | Animación glass-panel, cierre con Esc / backdrop / botón | `RegisterForm` |
| `ErrorModal` | Misma estética que `SuccessModal`, paleta error | `LoginForm` |

### 4.2 Moléculas (`src/components/molecules/`)

Composición de átomos con responsabilidad semántica clara.

| Molécula | Composición | Usado en |
|---|---|---|
| `FormField` | `Label` + `Input` + slot opcional `labelRight` | disponible para formularios genéricos |
| `LoginFormFields` | Dos `Label`+`Input` (username, password) con `aria-invalid` y mensajes de error | `LoginForm` |
| `RegisterFormFields` | Cuatro campos (email, firstName, lastName, password), grid 2-col en desktop | `RegisterForm` |
| `StatCard` | Valor grande + `valueAccent` opcional + label uppercase | `StatsSection` |
| `BenefitCard` | Card con `bg-surface-container-high/30` (No-Line) | `StatsSection` |
| `BentoFeatureCard` | Card grande (8 cols) con icono, título, badges, `children` | `BentoSection` |
| `BentoSideCard` | Card compacta (4 cols) con icono, descripción, footer | `BentoSection` |
| `UserMenu` | `Avatar` + `Button` ghost; `useAuth().logout()` + redirect `/` | `dashboard/Header` |

### 4.3 Organismos (`src/components/organisms/`)

Secciones autocontenidas que ya representan una unidad visual completa.

| Organismo | Descripción | Usado en |
|---|---|---|
| `Header` | Navbar fija `glass-nav shadow-nav` con logo, links (Home/Research/Sequencing/Datasets) y acciones (Sign In / Register) | `modules/public/landing` |
| `Footer` | Pie de página oscuro con 4 columnas (Brand, Platform, Research, Legal) | `Landing`, `Login`, `Register` |
| `HeroSection` | Layout asimétrico 7/5: copy editorial + `LoginForm` glass-panel | `Landing` |
| `BentoSection` | Bento grid: 1 card grande (Sequence Mapping) + 2 cards laterales (Variant Discovery, Audit Logs) | `Landing` |
| `StatsSection` | 4 `StatCard` + 3 `BenefitCard` | `Landing` |
| `CTASection` | Bloque `pulse-gradient` full-bleed con CTA principal y secundario | `Landing` |
| `LoginForm` | Form con `react-hook-form` + `zod`, `LoginFormFields`, `ErrorModal`, llama `useAuth().login()` | `HeroSection`, `modules/authenticator/login` |
| `RegisterForm` | Form con `react-hook-form` + `zod`, `RegisterFormFields`, `SuccessModal`, llama `registerUser` | `modules/authenticator/register` |

### 4.4 Vistas (`src/modules/`)

Cada vista es una **página completa** que compone `Header` (propio del módulo), contenido principal y `Footer` (compartido).

#### `modules/public/landing/Landing.tsx` — Landing pública

Ensamblado en orden:

```tsx
<div className="bg-background ...">
  <Header />               ← navbar con Sign In / Register
  <main className="pt-24"> ← offset para header fija
    <HeroSection />        ← copy + LoginForm (ruta rápida de autenticación)
    <BentoSection />       ← Analytics Suite
    <StatsSection />       ← métricas y beneficios
    <CTASection />         ← CTA gradient
  </main>
  <Footer />
</div>
```

La `Header` local (`modules/public/landing/Header.tsx`) expone los botones `Sign In` y `Register` que navegan a `/login` y `/register`.

#### `modules/authenticator/login/Login.tsx` — Login

```tsx
<div className="bg-background ...">
  <Header />               ← Header local: Sign In / Register invisibles (oculto visual)
  <main className="flex-1 pt-28">
    <section className="bg-surface-section ...">
      ...dot grid decorativo...
      <div className="max-w-lg">
        <Badge contextual: "Researcher Access Session" />
        <LoginForm />      ← organism
      </div>
    </section>
  </main>
  <Footer />
</div>
```

`LoginForm` consume `useAuth()` y `LoginFormFields` (molecule), valida con `zod` y al `200` llama a `login(tokens)` y navega a `from ?? "/dashboard"`.

#### `modules/authenticator/register/Register.tsx` — Registro

```tsx
<div className="bg-background ...">
  <Header />               ← Header local: Sign In visible, Register oculto
  <main className="flex-1 pt-28">
    <section className="bg-surface-section ...">
      ...dot grid decorativo...
      <div className="max-w-lg">
        <Badge contextual: "Researcher Onboarding Session" />
        <RegisterForm />   ← organism
      </div>
    </section>
  </main>
  <Footer />
</div>
```

`RegisterForm` consume `RegisterFormFields` y, al recibir `201`, abre `SuccessModal`; al cerrarlo, navega a `/`.

#### `modules/dashboard/dashboard/Dashboard.tsx` — Dashboard (protegido)

```tsx
<div className="bg-background ...">
  <Header />               ← Header del dashboard con UserMenu (logout)
  <main className="flex-1 pt-28">
    <section className="bg-surface-section ...">
      ...dot grid decorativo...
      <div className="max-w-4xl">
        <Badge contextual: "Researcher Dashboard" />
        <h1>Welcome, Researcher</h1>
        <p>...</p>
        <div className="grid md:grid-cols-3">
          {/* 3 StatCard inline (no reutiliza la molecule, son placeholders) */}
        </div>
      </div>
    </section>
  </main>
  <Footer />
</div>
```

El `Header` del dashboard (`modules/dashboard/dashboard/Header.tsx`) reemplaza los botones `Sign In/Register` por la molécula `UserMenu`, que muestra el `Avatar` y un botón "Cerrar sesión" (llama a `useAuth().logout()` y navega a `/`).

### 4.5 Router (`src/App.tsx`)

```tsx
<BrowserRouter>
  <Routes>
    <Route path="/"         element={<Landing />} />
    <Route path="/register" element={<Register />} />
    <Route path="/login"    element={<Login />} />

    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
    </Route>
  </Routes>
</BrowserRouter>
```

Las rutas bajo `<ProtectedRoute />` se evalúan contra `PROTECTED_ROUTES` (en `src/routes/protectedRoutes.ts`). Para añadir una nueva vista privada basta con:

1. Agregar la ruta al array `PROTECTED_ROUTES`.
2. Anidarla bajo `<Route element={<ProtectedRoute />}>` en `App.tsx`.

---

## 5. Flujo de autenticación y protección de rutas

### 5.1 Diagrama

```
LoginForm ─POST /users/login──► Backend
                                   │
                            200 + { access_token, refresh_token }
                                   │
AuthContext.login(tokens) ──► tokenStorage.setTokens
                                   │
              ProtectedRoute re-evalúa isAuthenticated
                                   │
                            navega a location.state.from ?? "/dashboard"
                                   │
                      ┌────────────┴────────────┐
                      │                         │
              componentes hacen            cualquier fetch
              authFetch("/users/me",...)    authFetch("/config-and-control/...")
                      │                         │
              reciben respuesta 200      reciben respuesta 200
                                              │
                                      si 401, httpClient:
                                        1) performRefresh() (single-flight)
                                        2) reintenta con nuevo Bearer
                                        3) si refresh falla:
                                              - clearTokens()
                                              - dispatch "biopatternsg:session-expired"
                                              - AuthContext.logout()
                                              - ProtectedRoute redirige a /login
```

### 5.2 Recarga de página con sesión activa

`AuthProvider` rehidrata `isAuthenticated` con `hasAccessToken()` en su `useEffect` inicial. Si el token está en `localStorage`, el usuario sigue autenticado; si no, `ProtectedRoute` lo envía a `/login`.

### 5.3 Logout

- **Manual** → `UserMenu` (en `dashboard/Header`) llama `useAuth().logout()` → `clearTokens()` + `setIsAuthenticated(false)` → `ProtectedRoute` redirige a `/login`.
- **Automático** → cualquier fallo de refresh dispara el mismo flujo vía el evento `biopatternsg:session-expired`.

---

## 6. Convenciones y reglas de diseño

| Regla | Aplicación |
|---|---|
| **No-Line** | Nunca `border` 1px para separar; usar `bg-surface-container-low` o `outline-variant/15` |
| **Glass & Gradient** | Navbar y modales con `backdrop-blur-xl`; CTAs primarios con `pulse-gradient` |
| **Tipografía** | Inter para headline/body, Space Grotesk para labels (uppercase, `tracking-widest`) |
| **Sombras** | Todas teñidas con `#0d1c2e` (no grises neutros) |
| **Iconos** | Solo `lucide-react` (migración completa desde Material Symbols) |
| **Licencia** | Cabecera Apache 2.0 en todos los archivos `.ts/.tsx` |
| **Alias de import** | `@/...` apunta a `src/...` (configurado en `vite.config.ts` y `tsconfig.app.json`) |
| **TypeScript** | `verbatimModuleSyntax: true` → usar `import type` para tipos; `noUnusedLocals/Parameters` activos |
| **Atomic Design** | Componentes en `atoms/`, `molecules/`, `organisms/`; vistas en `modules/<contexto>/<vista>/` |

---

## 7. Scripts de desarrollo y build

| Comando | Acción |
|---|---|
| `npm run dev` | Vite dev server (HMR) |
| `npm run local` | Idem pero con `--mode development` (carga `.env.development`) |
| `npm run prod` | Idem pero con `--mode production` |
| `npm run build` | `tsc -b && vite build` (type-check + build de producción) |
| `npm run build:local` | Build con variables de development |
| `npm run build:prod` | Build con variables de production |
| `npm run preview` | Sirve el build localmente para inspección |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run license:format` | Añade la cabecera Apache 2.0 a archivos que no la tengan (vía `scripts/add-license.js`) |

### Variables de entorno

Definidas en `.env.example`:

```env
VITE_API_URL=http://localhost:8080
```

- **Dev** — el navegador hace requests a `/config-and-control/...` (mismo origen) y Vite las redirige vía proxy a `VITE_API_URL`.
- **Prod** — el cliente hace requests directamente a `VITE_API_URL`.

---

## Anexo: comandos de verificación usados

```bash
# Type-check sin emitir JS
npx tsc --noEmit

# Build de producción
npm run build
```

Última verificación al cierre de este documento: `npm run build` exitoso — `1868 modules transformed`, CSS 25.94 kB, JS 394.23 kB.
