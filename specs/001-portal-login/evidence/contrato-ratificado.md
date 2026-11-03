# Evidencia — ratificación del contrato de autenticación

- Fecha: 2026-11-03
- Spec: `specs/001-portal-login/spec.md` (pasó de `borrador` a `en-revision`)
- Decisión de mecanismo: `docs/adr/0007-sesion-y-superficie-por-rol.md`
- Propuesta de origen: `docs/propuestas/contrato-auth.md` (publicada; ya no es fuente vigente)

## Qué se ratificó

Las cinco capacidades de autenticación del portal, con sus rutas, cookies, códigos y roles, en dos
artefactos que deben coincidir:

| Artefacto                     | Repositorio              | Ubicación                                                      |
| :---------------------------- | :----------------------- | :------------------------------------------------------------- |
| Contrato canónico (legible)   | `Code-Dev-2026/backend`  | `docs/contrato-backend-frontend.md` § Autenticación del portal |
| Contrato ejecutable (máquina) | `Code-Dev-2026/frontend` | `packages/contracts/openapi.json`                              |
| Espejo de solo lectura        | `Code-Dev-2026/frontend` | `docs/backend-ref/contrato-backend-frontend.md`                |

## Trazabilidad de los cambios

| Repo     | PR  | Commit                            | Qué aportó                                                  |
| :------- | :-- | :-------------------------------- | :---------------------------------------------------------- |
| backend  | #39 | `25804df` (en `main` = `f224b94`) | Sección de autenticación en el contrato canónico.           |
| frontend | #17 | `c02167d` (en `main` = `df90d55`) | Gobernanza del contrato: la política se protege a sí misma. |
| frontend | #18 | `90716bd` (en `main` = `df90d55`) | OpenAPI de auth + espejo sincronizado.                      |

## Verificación de la sincronía

```text
$ node scripts/sync-backend-ref.mjs --check
OK: 5 espejo(s) al día.
```

- SHA-256 del canónico: `a38ba3b5fc3387db18b70d8ca2e0f3edd3acc6cc7b9d987f28f7282e39863bd7`
- SHA-256 del cuerpo del espejo: el mismo valor, comparado byte a byte.
- Banner del espejo: `@ 25804df`, ancestro de `f224b94`.
- `packages/contracts/openapi.json`: `openapi: 3.0.3`, `info.version: 0.2.0`, `servers: /api/v1`.

## Contrato vigente (resumen)

- **Endpoints:** `POST /auth/login`, `POST /auth/mfa/verify`, `GET /auth/me`,
  `POST /auth/refresh`, `POST /auth/logout`.
- **Cookies:** `__Host-cs_session` (`Path=/`), `__Host-cs_refresh` y `__Host-cs_mfa`
  (`Path=/api/v1/auth`), todas `HttpOnly; Secure; SameSite=Strict`.
- **Códigos:** `200` (`authenticated` / `mfa_required`), `204`, `401 auth_failed`,
  `403 role_not_allowed`, `429 rate_limited` con `Retry-After`.
- **Roles del portal:** `COORDINADORA_CONVIVENCIA` (MFA), `RECTORIA`, `GERENCIA_TRANSPORTE`,
  `JEFE_OPERACIONES`, `ADMINISTRADOR_CARTERA`. `MONITORA`, `CONDUCTOR` y `ACUDIENTE` reciben `403`.

## Límites de esta evidencia

- No prueba que el backend haya implementado los endpoints: el repositorio backend todavía no tiene
  código de API. Prueba que el contrato está ratificado y publicado, que es la precondición de la
  spec.
- No sustituye la revisión del `reviewer` ni la aprobación humana de la spec.
- Cualquier cambio posterior del contrato obliga a regenerar el espejo y `packages/contracts` antes de
  tocar el portal.
