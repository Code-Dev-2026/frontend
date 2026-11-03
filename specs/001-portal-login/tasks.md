# Tareas — 001

> Solo se ejecutan cuando `spec.md` está en estado `aprobada`. En `en-revision` este archivo es un
> plan de trabajo, no una autorización para escribir código.

- [ ] **T01** — Definir los esquemas Zod espejo del contrato (`apps/portal/src/features/auth/schemas.ts`, `RF-13`, `RNF-01`)
  - Prueba: aceptar las respuestas de ejemplo del contrato y rechazar campos faltantes, `status` desconocido y roles fuera del enum.
  - Terminado cuando: los siete esquemas (`LoginRequest`, `LoginResult`, `AuthenticatedResult`, `MfaRequiredResult`, `MfaVerifyRequest`, `MeResponse`, `ErrorResponse`) existen y `pnpm --filter portal test` pasa.

- [ ] **T02** — Centralizar rutas y campos del contrato (`apps/portal/src/features/auth/contract.ts`, `RF-13`)
  - Prueba: prueba unitaria que compara las rutas declaradas con las de `packages/contracts/openapi.json`.
  - Terminado cuando: no queda ninguna ruta `/api/v1/auth/...` literal fuera de este archivo.

- [ ] **T03** — Cliente HTTP con cookies (`apps/portal/src/features/auth/client.ts`, `RNF-01`)
  - Prueba: con `fetch` inyectado, verificar `credentials: 'include'`, ausencia de cabecera `Authorization` y validación Zod de la respuesta.
  - Terminado cuando: ninguna función del cliente devuelve datos sin pasar por un esquema.

- [ ] **T04** — Mapeo de errores del contrato (`apps/portal/src/features/auth/errors.ts`, `RF-13`, `RNF-01`)
  - Prueba: `auth_failed` produce un mensaje único; `role_not_allowed` y `rate_limited` tienen mensaje propio; nunca se refleja la entrada del usuario.
  - Terminado cuando: ningún mensaje incluye correo, contraseña ni código de estado interno.

- [ ] **T05** — Estado de sesión en memoria (`apps/portal/src/features/auth/session.tsx`, `RNF-01`, `RNF-02`)
  - Prueba: tras login, `localStorage` y `sessionStorage` están vacíos y no existe persister de React Query.
  - Terminado cuando: el estado se pierde al recargar, como exige el contrato (la sesión la sostiene la cookie).

- [ ] **T06** — Formulario de credenciales accesible (`apps/portal/app/login/login-form.tsx`, `RNF-04`, `RF-13`)
  - Prueba: validación de campos vacíos y formato antes de enviar; `assertTouchTarget` sobre cada control.
  - Terminado cuando: el formulario opera con teclado, tiene etiquetas asociadas y errores junto al campo.

- [ ] **T07** — Flujo de segundo factor (`apps/portal/app/login/mfa-form.tsx`, `RF-13`, `HU-13`)
  - Prueba: `mfa_required` muestra el paso TOTP; sin código válido no se habilita ninguna ruta protegida; código de 6 dígitos validado en cliente.
  - Terminado cuando: el estado `mfa_required` no expone identidad ni roles.

- [ ] **T08** — Guardia de rutas por rol (`apps/portal/src/features/auth/session.tsx`, `RNF-02`, `HU-13`)
  - Prueba: sin sesión redirige al acceso; rol desconocido o lista vacía deniega; solo los cinco roles del contrato habilitan la consola.
  - Terminado cuando: la denegación es el comportamiento por defecto y se cubre con prueba.

- [ ] **T09** — Renovación de sesión (`apps/portal/src/features/auth/client.ts`, `RNF-01`)
  - Prueba: un `401` dispara un único `refresh`; si falla, limpia el estado y redirige; `429` respeta `Retry-After`.
  - Terminado cuando: no existe reintento en bucle ni temporizador de renovación.

- [ ] **T10** — Cierre de sesión (`apps/portal/src/features/auth/session.tsx`, `RNF-01`)
  - Prueba: invoca `POST /auth/logout`, limpia el estado en memoria y redirige; el botón "atrás" no restaura una vista autenticada.
  - Terminado cuando: la prueba no encuentra datos de identidad tras el cierre.

- [ ] **T11** — Pruebas de no persistencia de secretos (`apps/portal/src/features/auth/*.test.ts`, `RNF-01`)
  - Prueba: tras login exitoso, revisar `localStorage`, `sessionStorage`, `document.cookie` y la URL; fallar si aparece un token.
  - Terminado cuando: la prueba cubre los cuatro vectores y no usa datos reales.

- [ ] **T12** — Evidencia y verificación (`specs/001-portal-login/evidence/`, `RNF-01`, `RNF-02`, `RNF-04`)
  - Prueba: `node scripts/verify.mjs` en verde y salida guardada en `evidence/`.
  - Terminado cuando: la evidencia incluye el resultado de pruebas, el chequeo de invariantes y la revisión del `reviewer`.

## Evidencia

- `evidence/contrato-ratificado.md` registra la ratificación del contrato (PRs, commits y hash).
- Al implementar, `evidence/` debe contener la salida de `node scripts/verify.mjs` y la revisión.
