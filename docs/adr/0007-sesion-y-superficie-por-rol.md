# ADR 0007: Sesión del portal y superficie por rol

- Status: Proposed (aceptado por el responsable del frontend el 2026-11-03; pendiente de ratificación del equipo backend)
- Date: 2026-11-03
- Relacionado: `docs/adr/0005-fuente-de-verdad-y-precedencia.md`, `specs/001-portal-login/spec.md`,
  `docs/backend-ref/contrato-backend-frontend.md`, `docs/propuestas/contrato-auth.md`

## Contexto

El SRS exige MFA para la Coordinadora de Convivencia (RF-13, HU-13) y mínimo privilegio con
aislamiento por rol (RNF-01, RNF-02). La constitución prohíbe guardar tokens o datos personales en
`localStorage`/`sessionStorage`.

Sin embargo, **no existe contrato de autenticación**: `packages/contracts/openapi.json` solo declara
`/health`, `docs/backend-ref/contrato-backend-frontend.md` no menciona auth y el repositorio backend todavía no
tiene código de API. Tampoco está escrito qué roles usan el portal web frente a las apps móviles:
el SRS describe el portal para coordinación (RF-13), rutas (RF-17) y cartera (RF-15), pero no
enumera la matriz.

La alternativa de dejar el token en JavaScript cumple el requisito de "no guardar" pero expone la
credencial a cualquier XSS: no satisface RNF-01 en la práctica.

## Decisión

### 1. La sesión la emite el backend en una cookie `HttpOnly`

El backend fija la credencial de sesión con `HttpOnly`, `Secure` y `SameSite=Strict`; el portal
**nunca** lee ni escribe el token. La renovación es rotativa y la revocación se hace en el servidor
por familia de tokens, tal como describe el SRS A.2 (JWT de vida corta + refresh rotativo).

Consecuencias obligatorias para el backend: `Set-Cookie` en las respuestas de login y renovación,
CORS con credenciales desde el origen del portal, verificación de `Origin` y protección CSRF en
métodos que cambian estado.

### 2. Solo cinco roles entran por el portal

| Rol                        | Portal      | App móvil                                       |
| :------------------------- | :---------- | :---------------------------------------------- |
| `COORDINADORA_CONVIVENCIA` | Sí, con MFA | —                                               |
| `RECTORIA`                 | Sí          | —                                               |
| `GERENCIA_TRANSPORTE`      | Sí          | —                                               |
| `JEFE_OPERACIONES`         | Sí          | —                                               |
| `ADMINISTRADOR_CARTERA`    | Sí          | —                                               |
| `MONITORA`                 | No          | `apps/monitora`                                 |
| `CONDUCTOR`                | No          | — (sin software en terminal particular, RNF-07) |
| `ACUDIENTE`                | No          | `apps/acudiente`                                |

La denegación es explícita: un rol fuera de la lista no obtiene sesión de portal, aunque sus
credenciales sean válidas. Es la prueba de denegación de escalamiento de HU-13.

### 3. El segundo factor lo declara el backend, no el frontend

El portal no mantiene una lista de "roles con MFA". Pide credenciales y obedece la respuesta del
backend (`mfa_required`). Hoy el SRS solo exige TOTP para `COORDINADORA_CONVIVENCIA`; extenderlo es
una decisión de backend/seguridad, no una invención del cliente.

### 4. El contrato va primero

Las cinco capacidades (autenticar, verificar segundo factor, renovar, cerrar, obtener identidad y
roles) deben existir en `packages/contracts/openapi.json` y en
`docs/backend-ref/contrato-backend-frontend.md` antes de implementar el portal. La propuesta concreta está en
`docs/propuestas/contrato-auth.md` y **no es contrato vigente**.

## Alternativas descartadas

1. **Token de acceso en memoria + credencial de renovación en cookie `HttpOnly`.** Tolera un backend
   que devuelva tokens en el cuerpo, pero el access token sigue pasando por JavaScript y queda
   expuesto a XSS. Se acepta solo si el backend se niega a emitir la cookie de sesión, mediante un
   ADR que reemplace este.
2. **Token en `localStorage`/`sessionStorage`.** Viola RNF-01, RNF-02 y la constitución. Rechazada
   sin necesidad de más análisis.
3. **Permitir los ocho roles en el portal.** Amplía la superficie de ataque y debilita el
   aislamiento por rol sin que el SRS lo pida.

## Consecuencias

- El portal depende de que el backend emita, rote y revoque cookies; si no lo hace, este ADR se
  reemplaza y la implementación se detiene.
- Las pruebas del portal deben inspeccionar `localStorage`, `sessionStorage`, `document.cookie` y la
  URL para demostrar que no hay secretos (criterio ya escrito en la spec).
- CSRF pasa a ser responsabilidad compartida: `SameSite=Strict` más verificación de `Origin` en el
  backend; el portal envía las peticiones con `credentials: 'include'`.
- Cualquier rol nuevo en el catálogo `V002` requiere actualizar esta matriz y la prueba de denegación.
- El mecanismo de sesión de las apps móviles queda fuera de este ADR.
