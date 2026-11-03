# Propuesta de contrato de autenticación

> **No es contrato vigente y no se implementa todavía.** Este documento propone las cinco
> capacidades que el portal necesita para `specs/001-portal-login/spec.md`. Solo se convierte en
> contrato cuando el equipo backend lo ratifique, se publique en `packages/contracts/openapi.json`
> y se refleje en `docs/backend-ref/contrato-backend-frontend.md` (ver "Ratificación" al final).

- Fecha: 2026-11-03
- Decisiones de soporte: `docs/adr/0007-sesion-y-superficie-por-rol.md`
- Base propuesta: `/api/v1` (misma que los endpoints ya descritos en el contrato actual)

## Flujo

```text
1. POST /auth/login            credenciales
   ├─ sin MFA  → 200 + cookies de sesión
   └─ con MFA  → 200 { status: "mfa_required" } + cookie de desafío (5 min)
2. POST /auth/mfa/verify       código TOTP + cookie de desafío
   └─ 200 + cookies de sesión
3. GET  /auth/me               identidad y roles (la usa el guardia de rutas)
4. POST /auth/refresh          rota la sesión antes de que expire
5. POST /auth/logout           revoca la familia y borra cookies
```

## Cookies

| Cookie              | Atributos                                              | Contenido                    | Vigencia              |
| :------------------ | :----------------------------------------------------- | :--------------------------- | :-------------------- |
| `__Host-cs_session` | `HttpOnly; Secure; SameSite=Strict; Path=/`            | JWT de acceso                | corta (p. ej. 15 min) |
| `__Host-cs_refresh` | `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` | token de renovación rotativo | sesión de trabajo     |
| `__Host-cs_mfa`     | `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` | desafío de segundo factor    | 5 min                 |

- El portal nunca lee estas cookies (`HttpOnly`); las envía con `credentials: 'include'`.
- El prefijo `__Host-` obliga a `Secure`, `Path=/` y ausencia de `Domain`.
- La rotación y revocación por familia las ejecuta el backend (SRS A.2).

## Endpoints propuestos

### `POST /api/v1/auth/login`

```json
{ "email": "usuario@ejemplo.test", "password": "…" }
```

| Código | Cuerpo                                                                                             | Cookies             |
| :----- | :------------------------------------------------------------------------------------------------- | :------------------ |
| `200`  | `{ "status": "authenticated" }`                                                                    | sesión + renovación |
| `200`  | `{ "status": "mfa_required" }`                                                                     | desafío             |
| `401`  | `{ "code": "auth_failed", "message": "No fue posible iniciar sesión." }`                           | —                   |
| `403`  | `{ "code": "role_not_allowed", "message": "Este rol no usa el portal." }`                          | —                   |
| `429`  | `{ "code": "rate_limited", "message": "Demasiados intentos. Intenta más tarde." }` + `Retry-After` | —                   |

El `401` es idéntico para cuenta inexistente, contraseña incorrecta y usuario inactivo.
El `403` solo se responde **después** de verificar credenciales correctas.

### `POST /api/v1/auth/mfa/verify`

```json
{ "code": "123456" }
```

| Código | Cuerpo                          | Cookies                               |
| :----- | :------------------------------ | :------------------------------------ |
| `200`  | `{ "status": "authenticated" }` | sesión + renovación; borra el desafío |
| `401`  | `{ "code": "auth_failed" }`     | conserva el desafío                   |
| `429`  | `{ "code": "rate_limited" }`    | —                                     |

### `GET /api/v1/auth/me`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "display_name": "Usuario Ficticio",
  "roles": ["COORDINADORA_CONVIVENCIA"]
}
```

- `200` con sesión válida; `401` con `{ "code": "auth_failed" }` si no hay sesión.
- `display_name` es el mínimo necesario para la cabecera; no incluye documento, teléfono ni correo.
- `roles` solo admite valores del catálogo de `V002`; un rol desconocido se ignora y no concede acceso.
- Los permisos finos (CASL) no se envían en esta versión: el guardia de rutas usa `roles`.

### `POST /api/v1/auth/refresh`

Sin cuerpo. Usa `__Host-cs_refresh`.

| Código | Efecto                            |
| :----- | :-------------------------------- |
| `204`  | rota ambas cookies                |
| `401`  | revoca la familia y borra cookies |

### `POST /api/v1/auth/logout`

Sin cuerpo. Revoca la familia de tokens y borra las cookies.

| Código | Efecto                                                         |
| :----- | :------------------------------------------------------------- |
| `204`  | idempotente: también responde `204` si la sesión ya no existía |

## Reglas transversales

- **CSRF:** `SameSite=Strict` más verificación de `Origin` en el backend para todo método que cambia
  estado. Si el backend no puede validar `Origin`, se añade doble envío de token CSRF antes de
  implementar.
- **CORS:** origen del portal explícito, `Access-Control-Allow-Credentials: true`, sin comodines.
- **Errores:** forma única `{ code, message }`; nunca se devuelven trazas, correos ni IDs internos.
- **Validación en el cliente:** las respuestas se validan con Zod antes de renderizar.
- **Roles:** solo los cinco del ADR 0007 obtienen sesión de portal.
- **Datos de prueba:** los ejemplos usan correo `.test` y UUID ficticios.

## Fuera de alcance de esta propuesta

- Registro público, recuperación y cambio de contraseña.
- Enrolamiento o reinicio del segundo factor.
- Sesiones de las apps móviles.
- Permisos finos por recurso (CASL) y matriz de autorización del portal.

## Ratificación

Para que esta propuesta pase a contrato:

1. Un dueño del backend y uno del frontend la revisan (regla del contrato actual).
2. Se publica en `packages/contracts/openapi.json` con esquemas y códigos.
3. Se actualiza `docs/backend-ref/contrato-backend-frontend.md`.
4. La spec `001-portal-login` pasa a `en-revision` y el `reviewer` valida trazabilidad.
5. Solo entonces el responsable aprueba la implementación.

Si el backend no puede emitir cookies `HttpOnly`, este documento se reemplaza por la alternativa 1
del ADR 0007 antes de escribir código.
