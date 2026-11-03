# Plan técnico — 001

## Enfoque

El login se construye como una **capa de cliente sobre el contrato ya ratificado**: el portal no
decide identidad ni autorización, solo envía credenciales, obedece la respuesta del backend y
mantiene el estado de sesión **en memoria**.

1. `app/login/page.tsx` deja de ser un placeholder y renderiza un formulario de acceso accesible
   (React Hook Form + Zod), con un segundo paso para el código TOTP cuando el backend responde
   `mfa_required`.
2. Un módulo `src/features/auth/` concentra las rutas del contrato, los esquemas Zod de respuesta, el
   cliente HTTP y el estado de sesión. Ningún componente llama a `fetch` por su cuenta ni escribe
   rutas literales.
3. `fetch` se hace con `credentials: 'include'`: el navegador envía las cookies `HttpOnly` y el código
   nunca las lee. No hay `Authorization` en el cliente.
4. El guardia de rutas pide `GET /auth/me` al montar la aplicación, guarda la identidad en memoria y
   deriva los permisos del enum de roles del backend. Sin rol válido no hay acceso (denegación por
   defecto).
5. Ante un `401` en una llamada autenticada se intenta **un** `POST /auth/refresh`; si falla, se
   descarta el estado en memoria y se redirige al acceso. No hay reintentos en bucle ni temporizadores
   que renueven en segundo plano.

## Archivos afectados

| Ruta                                        | Cambio                                                                  |
| :------------------------------------------ | :---------------------------------------------------------------------- |
| `apps/portal/app/login/page.tsx`            | Reemplaza el placeholder por el flujo de acceso.                        |
| `apps/portal/app/login/login-form.tsx`      | **Nuevo.** Formulario de credenciales y mensajes de error.              |
| `apps/portal/app/login/mfa-form.tsx`        | **Nuevo.** Captura del código TOTP de 6 dígitos.                        |
| `apps/portal/app/providers.tsx`             | **Nuevo.** `QueryClientProvider` sin persister (caché solo en memoria). |
| `apps/portal/src/features/auth/schemas.ts`  | **Nuevo.** Esquemas Zod espejo de `packages/contracts/openapi.json`.    |
| `apps/portal/src/features/auth/contract.ts` | **Nuevo.** Rutas y nombres de campo del contrato en un solo lugar.      |
| `apps/portal/src/features/auth/client.ts`   | **Nuevo.** `fetch` con `credentials: 'include'` y validación Zod.       |
| `apps/portal/src/features/auth/errors.ts`   | **Nuevo.** Mapeo de `code` a mensaje único para el usuario.             |
| `apps/portal/src/features/auth/session.tsx` | **Nuevo.** Contexto de sesión en memoria + guardia por rol.             |
| `apps/portal/src/features/auth/*.test.ts`   | **Nuevo.** Pruebas unitarias y de integración con `fetch` inyectado.    |
| `apps/portal/app/layout.tsx`                | Envuelve la aplicación en `providers.tsx`.                              |
| `apps/portal/src/lib/a11y.test.ts`          | Se conserva; aporta la verificación de 48 px (RNF-04).                  |

## Decisiones técnicas

| Decisión                                                           | Alternativa descartada                              | Motivo                                                                                                     |
| :----------------------------------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Sesión en cookie `HttpOnly` emitida por el backend                 | Token de acceso en memoria o en `localStorage`      | RNF-01, RNF-02 y ADR 0007: el token no debe ser legible por JavaScript ni persistirse.                     |
| Estado de sesión solo en memoria (contexto + caché de React Query) | `persistQueryClient` o almacenamiento del navegador | Cualquier persistencia de identidad o roles incumple RNF-01 y facilita el escalamiento.                    |
| Validar cada respuesta con Zod antes de usarla                     | Castear con `as` o leer campos sueltos              | El contrato exige validación; un payload inesperado debe fallar cerrado, no renderizarse.                  |
| Rutas y campos centralizados en `contract.ts`                      | Cadenas literales repartidas en componentes         | Un cambio de contrato se refleja en un solo archivo y se detecta en revisión.                              |
| `credentials: 'include'` contra `servers.url` (`/api/v1`)          | Proxy BFF en Next o pasar el token por cabecera     | El contrato ya define same-origin; el BFF añade superficie y el token por cabecera contradice el ADR 0007. |
| Guardia basado en `GET /auth/me`                                   | Decodificar el JWT en el cliente                    | El cliente no puede leer la cookie; además el backend es la autoridad de roles.                            |
| React Hook Form + `zodResolver`                                    | Estado manual con `useState`                        | Ya son dependencias del portal y evitan validaciones duplicadas.                                           |
| Pruebas de lógica con Vitest en entorno `node`                     | Añadir jsdom y Testing Library en esta fase         | No se agregan dependencias sin aprobación; ver supuestos.                                                  |
| Un solo intento de `refresh` por respuesta `401`                   | Reintento con espera o renovación periódica         | Evita bucles y respeta el `429` + `Retry-After` del contrato.                                              |

## Contratos y datos

- **Endpoints usados (solo los del contrato):**
  - `POST /api/v1/auth/login` → `LoginRequest` / `LoginResult`.
  - `POST /api/v1/auth/mfa/verify` → `MfaVerifyRequest` / `AuthenticatedResult`.
  - `GET /api/v1/auth/me` → `MeResponse`.
  - `POST /api/v1/auth/refresh` → `204` / `401`.
  - `POST /api/v1/auth/logout` → `204`.
- **Eventos Socket.IO:** ninguno; el login no abre tiempo real.
- **Estados canónicos implicados:** **ninguno**. Esta spec no toca custodia ni telemetría.
- **Migraciones o cambios de esquema:** **ninguno**; el portal no escribe datos.

## Pruebas

- **Unitaria (Vitest, entorno `node`):**
  - Cada esquema Zod acepta la respuesta del contrato y rechaza campos faltantes, roles fuera del
    enum y `status` desconocido.
  - `errors.ts` traduce `auth_failed`, `role_not_allowed` y `rate_limited` sin reflejar la entrada.
  - La decisión del guardia devuelve denegación ante lista de roles vacía o desconocida.
  - `assertTouchTarget` sigue exigiendo 48 px (RNF-04).
- **Integración (sin red):** `fetch` inyectado como dependencia.
  - Login `authenticated` → estado autenticado y `me` consultado.
  - Login `mfa_required` → estado pendiente de segundo factor; ninguna ruta protegida habilitada.
  - `mfa/verify` correcto → estado autenticado; incorrecto → sigue pendiente y muestra error único.
  - `401` en `me` → un `refresh`; si vuelve a fallar, estado limpio.
  - `429` → respeta `Retry-After` y no reintenta.
  - `logout` → `204` y estado vacío.
- **Denegación esperada:**
  1. Sin TOTP no hay sesión utilizable ni render de consola.
  2. `MONITORA`, `CONDUCTOR` y `ACUDIENTE` reciben `403` y no obtienen sesión.
  3. Tras login no hay secretos en `localStorage`, `sessionStorage`, cookies legibles ni URL.
  4. Una cookie fabricada no otorga acceso; el `401` limpia el estado en memoria.
- **Accesibilidad:** controles de 48 px y etiquetas asociadas; la verificación DOM automatizada queda
  sujeta al supuesto de dependencias.

## Rollback

- Revertir los commits de la feature deja `app/login/page.tsx` en su placeholder; no hay datos
  persistidos que migrar ni limpiar.
- Las cookies las borra el backend en `POST /auth/logout`; si la feature se retira, una sesión
  existente expira sola y el portal deja de invocarla.
- Sin migraciones ni cambios de esquema: no hay rollback de base de datos.

## Supuestos y decisiones pendientes

- `[SUPUESTO]` **Origen del portal y CORS.** El contrato declara `servers: /api/v1` (same-origin). Si
  el portal y la API quedan en orígenes distintos, el backend debe habilitar
  `Access-Control-Allow-Credentials` con el origen exacto; el portal no usa comodines. Decisión
  requerida antes de implementar.
- `[SUPUESTO]` **Dependencias de prueba DOM.** Verificar contraste, etiquetado y 48 px en componentes
  requiere `jsdom` y `@testing-library/react` (o equivalente). No se instalan en esta fase; el
  responsable decide si se añaden o si la verificación queda manual.
- `[SUPUESTO]` **CSRF.** Confirmar con backend si basta `SameSite=Strict` + validación de `Origin` o
  si se exige doble envío de token. El portal no añade un token que el backend no espere.
- `[SUPUESTO]` **Cadencia de renovación.** El contrato fija cookies de vida corta, pero no el valor
  exacto. El plan renueva de forma reactiva ante `401`; si backend exige renovación proactiva, se
  ajusta antes de implementar.
