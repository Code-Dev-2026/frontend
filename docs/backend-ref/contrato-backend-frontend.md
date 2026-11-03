> ESPEJO DE SOLO LECTURA — no editar aquí.
> Fuente: `Code-Dev-2026/backend` → `docs/contrato-backend-frontend.md` @ `25804df`
> SHA-256 del canónico: `a38ba3b5fc3387db18b70d8ca2e0f3edd3acc6cc7b9d987f28f7282e39863bd7`
> Se actualiza en el mismo PR que cambie el documento canónico.

---

# Contrato backend ↔ frontend

## Propósito

Este contrato define el intercambio mínimo de información entre el backend y el frontend para que ambos proyectos puedan evolucionar sin romper la experiencia del usuario.

## Endpoints y eventos

- `GET /api/v1/estudiantes/:id` — datos autorizados por el usuario autenticado.
- `GET /api/v1/telemetria/:viajeId` — telemetría GPS solo cuando el estudiante está `A_BORDO_VEHICULO`.
- `POST /api/v1/custodia/abordaje` — registro de abordaje con validaciones de aforo y estados.
- `POST /api/v1/custodia/descenso` — entrega segura y validaciones judiciales.
- Socket.IO: `ruta:actualizada`, `alerta:judicial`, `notificacion:push`.

## Autenticación del portal

Base `/api/v1`. La sesión viaja en cookies `HttpOnly`; el portal nunca lee ni escribe el token
(ADR 0007). El SRS A.2 exige JWT de vida corta con rotación y revocación por familia.

### Cookies

| Cookie              | Atributos                                              | Contenido                    | Vigencia              |
| :------------------ | :----------------------------------------------------- | :--------------------------- | :-------------------- |
| `__Host-cs_session` | `HttpOnly; Secure; SameSite=Strict; Path=/`            | JWT de acceso                | corta (p. ej. 15 min) |
| `__Host-cs_refresh` | `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` | token de renovación rotativo | sesión de trabajo     |
| `__Host-cs_mfa`     | `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` | desafío de segundo factor    | 5 min                 |

El prefijo `__Host-` obliga a `Secure`, `Path=/` y ausencia de `Domain`; la cookie de renovación
declara `Path=/api/v1/auth` y por eso no se envía al resto de la API en cada petición.

### Endpoints

| Método y ruta                 | Cuerpo                        | Respuestas                                                                                   |
| :---------------------------- | :---------------------------- | :------------------------------------------------------------------------------------------- |
| `POST /api/v1/auth/login`     | `{ email, password }`         | `200 { status: "authenticated" }` con sesión + renovación, `200 { status: "mfa_required" }` con desafío, `401 auth_failed`, `403 role_not_allowed`, `429 rate_limited` |
| `POST /api/v1/auth/mfa/verify`| `{ code }` (6 dígitos)        | `200 { status: "authenticated" }` con sesión + renovación y sin desafío, `401 auth_failed`, `429 rate_limited` |
| `GET /api/v1/auth/me`         | —                             | `200 { id, display_name, roles[] }`, `401 auth_failed`                                       |
| `POST /api/v1/auth/refresh`   | —                             | `204` rota ambas cookies, `401 auth_failed` revoca la familia y borra las cookies             |
| `POST /api/v1/auth/logout`    | —                             | `204` idempotente: también responde `204` si la sesión ya no existía                          |

`display_name` es el mínimo para la cabecera: no incluye documento, teléfono ni correo. `roles` solo
admite valores del catálogo `V002`; un rol desconocido se ignora y no concede acceso. Los permisos
finos (CASL) no forman parte de esta versión.

### Reglas

- **Denegación por rol:** solo los cinco roles del ADR 0007 obtienen sesión de portal
  (`COORDINADORA_CONVIVENCIA` con MFA, `RECTORIA`, `GERENCIA_TRANSPORTE`, `JEFE_OPERACIONES`,
  `ADMINISTRADOR_CARTERA`). Un rol fuera de la lista recibe `403 role_not_allowed` aunque sus
  credenciales sean válidas.
- **Indistinguibilidad:** el `401` es idéntico para cuenta inexistente, contraseña incorrecta y
  usuario inactivo; no revela cuál falló.
- **CSRF:** `SameSite=Strict` más verificación de `Origin` en todo método que cambia estado. Si el
  backend no puede validar `Origin`, se añade doble envío de token CSRF antes de implementar.
- **CORS:** origen del portal explícito, `Access-Control-Allow-Credentials: true`, sin comodines.
- **Errores:** forma única `{ code, message }`; nunca se devuelven trazas, correos ni identificadores
  internos.
- **Fuera de alcance:** registro público, recuperación y cambio de contraseña, enrolamiento o
  reinicio del segundo factor, sesiones de las apps móviles y permisos finos por recurso.

## Estados canónicos

Se toman los estados definidos en `db/migrations/V006__attendance_and_custody_lifecycle.sql`:

- `EN_CASA`
- `A_BORDO_VEHICULO`
- `EN_COLEGIO`
- `RETORNO_SEDE_POR_FALLA_ENTREGA`

## Reglas de revisión

- Los cambios de contrato requieren revisión de un dueño del backend y un dueño del frontend.
- Todo cambio del modelo o de eventos debe pasar por el agente `reviewer` y por trazabilidad al SRS.

## Riesgos

- Exponer telemetría a un acudiente sin el estudiante a bordo.
- Fuga de datos de identidad o documentos.
- Generar eventos con estados no canónicos.
