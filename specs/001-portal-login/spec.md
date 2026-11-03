---
state: borrador
app: portal
requirements: [RF-13, RNF-01, RNF-02, RNF-04, HU-13]
adr: [0007]
owner: responsable-humano
---

# 001 — Acceso autenticado al portal institucional (login con MFA)

## Contexto

El portal web institucional (`apps/portal`) es la superficie donde la Coordinadora de Convivencia
ejerce la intervención superior de RF-13 y donde otros roles institucionales consultan flota,
rutas, cartera y auditoría. Hoy `apps/portal/app/login/page.tsx` es un placeholder sin lógica: no
hay forma de acreditar identidad, y por tanto ninguna pantalla del portal puede considerarse
protegida.

Esta spec cubre **solo la puerta de entrada**: acreditar credenciales, exigir el segundo factor
cuando el rol lo requiera y establecer una sesión que el backend pueda reconocer. No cubre las
pantallas posteriores.

La precondición del caso de uso RF-13 es explícita: "Autenticación multifactor (MFA) exitosa en el
portal web institucional" (`docs/backend-ref/srs.md` §5, Caso de Uso RF-13). Es decir, el login no
es un adorno: es lo que hace verificable la denegación de escalamiento de HU-13.

Roles semilla existentes en el backend (`backend/db/migrations/V002__identity_and_access.sql`):

- `COORDINADORA_CONVIVENCIA` — superadministrador institucional, **MFA obligatorio**.
- `RECTORIA`
- `GERENCIA_TRANSPORTE`
- `JEFE_OPERACIONES`
- `ADMINISTRADOR_CARTERA`
- `MONITORA`
- `CONDUCTOR`
- `ACUDIENTE`

Fuentes normativas: SRS §2.4 (RF-13), §3 (RNF-01, RNF-02, RNF-04), §5 (caso de uso RF-13), §6.4
(HU-13), A.2 (autenticación: JWT de vida corta con refresh rotativo, argon2id, TOTP, CASL), A.6;
`docs/constitution.md`; `docs/architecture.md`; `docs/adr/0005-fuente-de-verdad-y-precedencia.md`.

## Alcance

- Incluye:
  - Pantalla de acceso del portal: captura de credenciales con validación de entrada.
  - Flujo de segundo factor (TOTP) cuando el rol lo exige — hoy, `COORDINADORA_CONVIVENCIA`.
  - Establecimiento, renovación y cierre de sesión, delegando la autoridad al backend.
  - Obtención de la identidad y los roles del usuario autenticado desde el backend, y guardia de
    acceso a rutas del portal basada en esos roles.
  - Mensajes de error genéricos que no filtran datos ni permiten enumerar cuentas.
  - Accesibilidad y usabilidad del formulario según RNF-04 (objetivos táctiles ≥ 48 px, alto
    contraste).
- No incluye:
  - Registro público de usuarios o auto-matriculación de cuentas.
  - Recuperación o cambio de contraseña, y enrolamiento inicial del segundo factor.
  - Login biométrico, RFID, QR de carné o cualquier autenticación de operación de ruta.
  - Las apps móviles (`apps/acudiente`, `apps/monitora`) y sus sesiones.
  - La consola de coordinación, el mapa global, la matriz de intervención y cualquier pantalla
    posterior al login (tendrán su propia spec).
  - Autorización fina por recurso dentro de las pantallas del portal (CASL en backend, RF-13).

## Requisitos del SRS

| ID     | Requisito                                                                                                                         | Criterio verificable                                                                                                                                                                                                                          |
| :----- | :-------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-13  | Matriz de Roles e Intervención Superior: privilegios de superadministrador para la Coordinadora de Convivencia.                   | Solo una sesión autenticada cuyo rol emitido por el backend sea `COORDINADORA_CONVIVENCIA` (o el rol facultado que el backend declare) alcanza las rutas de consola; cualquier otra sesión recibe denegación explícita (ver criterios).       |
| RF-13  | La precondición del caso de uso exige "MFA exitosa en el portal web institucional" (§5).                                          | Una autenticación con credenciales válidas de `COORDINADORA_CONVIVENCIA` no otorga acceso a ninguna ruta protegida hasta completar el segundo factor; sin segundo factor no hay sesión utilizable.                                            |
| RNF-01 | Seguridad y protección de datos: TLS 1.3, mínimo privilegio de acceso, Ley 1581 de 2012.                                          | El cliente no persiste tokens, credenciales ni datos personales en el navegador (prueba automatizada sobre `localStorage`, `sessionStorage`, cookies legibles por JS y URL); el usuario solo recibe los datos de identidad indispensables.    |
| RNF-02 | Privacidad diferencial por rol: aislamiento en capas; flota global reservada a coordinación y gerencia (ver también §6.3, HU-19). | La UI deriva permisos exclusivamente de los roles entregados por el backend; un usuario con rol `ACUDIENTE`, `MONITORA` o `CONDUCTOR` no ve ni alcanza navegación de consola/flota global, y ningún rol se infiere de la entrada del usuario. |
| RNF-04 | Usabilidad y accesibilidad: alto contraste, botones mínimos de 48 px, operación con una mano.                                     | Todo control interactivo del flujo de acceso mide ≥ 48×48 px CSS y el texto/controles cumplen contraste ≥ 4.5:1 (texto normal) medido con verificación automatizada de accesibilidad.                                                         |
| HU-13  | Como coordinadora de convivencia, quiero supervisar rutas y autorizar transbordos en emergencias.                                 | Tras login con MFA, la sesión permite acceder a la consola (pantalla posterior, fuera de alcance); la denegación de escalamiento no autorizado debe ser observable desde el guardia de acceso.                                                |

## Reglas de negocio y seguridad aplicables

- **Sin secretos en el navegador.** Prohibido `localStorage`, `sessionStorage`, `document.cookie`
  legible por JS y cualquier parámetro de URL que transporte tokens o credenciales
  (RNF-01, RNF-02, `docs/constitution.md` §3, `docs/architecture.md` "Seguridad y privacidad").
- **Mínimo privilegio.** La sesión transporta la identidad y los roles; la UI no amplía permisos,
  no cachea roles en almacenamiento persistente y no decide autorización por su cuenta. La
  autoridad final es el backend (RF-13, RNF-01).
- **Aislamiento por rol.** El guardia de rutas del portal se evalúa contra los roles emitidos por
  el backend; la ausencia de rol es denegación, no acceso por defecto (RNF-02, HU-13, HU-19).
- **MFA donde el SRS lo exige.** Segundo factor obligatorio para `COORDINADORA_CONVIVENCIA`
  (SRS §5 RF-13, A.2, A.6). Extenderlo a otros roles no es requisito del SRS.
- **Errores que no filtran.** Un fallo de autenticación devuelve un mensaje único, sin distinguir
  entre cuenta inexistente, contraseña incorrecta o rol inexistente; no se refleja la entrada del
  usuario ni datos personales en el DOM, en logs del cliente ni en la URL
  (`docs/constitution.md` §3).
- **Sesión revocable.** El cierre de sesión se completa en el servidor; el cliente solo descarta su
  estado en memoria y redirige al acceso (RNF-01).
- **Accesibilidad.** Formulario operables por teclado, etiquetas asociadas, foco visible y
  objetivos táctiles de 48 px en un portal de uso institucional en exteriores (RNF-04).
- **Datos de prueba ficticios.** Ningún ejemplo, semilla o prueba usa datos personales reales.

## Contrato requerido del backend

> `[SUPUESTO] BLOQUEANTE` — Hoy **no existe ningún endpoint de autenticación**: `packages/contracts/openapi.json`
> solo declara `/health`, `docs/contrato-backend-frontend.md` no menciona autenticación y el repo
> backend no tiene código de API (`backend/src` no existe). Por tanto esta spec describe
> **capacidades**, no rutas.
>
> El mecanismo de sesión y la matriz de roles ya están decididos en el **ADR 0007** (cookie
> `HttpOnly` emitida por el backend y cinco roles institucionales). La propuesta concreta de rutas,
> verbos y esquemas está en `docs/propuestas/contrato-auth.md`.
>
> Lo que sigue bloqueado: el backend debe **ratificar** la propuesta y publicarla en
> `packages/contracts/openapi.json` y en `docs/contrato-backend-frontend.md`. Hasta entonces está
> prohibido implementar rutas o esquemas inventados en el código.

| Capacidad requerida             | Qué necesita el portal                                                                                                                                                    | Qué NO puede asumir el cliente                                               | Estado                  |
| :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------- | :---------------------- |
| Autenticar credenciales         | Verificar identificador + contraseña; responder si la autenticación se completó, si requiere segundo factor o si falló, con un resultado indistinguible entre causas.     | Rutas, verbo, nombres de campo, códigos de estado ni forma del error.        | `[SUPUESTO] BLOQUEANTE` |
| Verificar segundo factor (TOTP) | Recibir el código de 6 dígitos, confirmarlo y habilitar la sesión; informar código inválido o expirado y el bloqueo por intentos.                                         | Longitud, ventana de validez, política de reintentos ni formato del desafío. | `[SUPUESTO] BLOQUEANTE` |
| Renovar sesión                  | Obtener una sesión vigente sin volver a pedir credenciales mientras el usuario trabaja; fallar de forma limpia al expirar.                                                | Duración, rotación, transporte ni si la renovación es silenciosa.            | `[SUPUESTO] BLOQUEANTE` |
| Cerrar sesión                   | Invalidar la sesión en el servidor y permitir al portal confirmar que ya no es válida.                                                                                    | Si es idempotente ni qué responde ante una sesión ya cerrada.                | `[SUPUESTO] BLOQUEANTE` |
| Obtener identidad y roles       | Entregar un identificador opaco de usuario, su nombre para mostrar y la lista de roles del catálogo (`V002`) con los permisos efectivos mínimos para el guardia de rutas. | Forma del payload, si los permisos vienen resueltos (CASL) o crudos.         | `[SUPUESTO] BLOQUEANTE` |

Notas de contrato:

- El **mecanismo de sesión** está decidido en el ADR 0007: el backend emite una cookie `HttpOnly` +
  `Secure` + `SameSite=Strict` y el portal nunca ve el token. Esto **exige que el backend la fije,
  rote y revoque**; el frontend no puede fabricar ni firmar esa cookie. Si el backend no puede
  emitirla, se aplica la alternativa 1 del ADR antes de escribir código.
- Toda respuesta debe validarse contra el contrato (Zod) antes de renderizar; un error no muestra
  datos crudos (`docs/architecture.md`).
- Los roles citados son solo los ocho del catálogo semilla; el portal solo admite los cinco del
  ADR 0007 y no debe inventar roles ni aceptar cadenas arbitrarias provenientes del cliente.

## Riesgos y supuestos

- `[SUPUESTO]` **El contrato de autenticación aún no está ratificado.** Hay propuesta
  (`docs/propuestas/contrato-auth.md`) y decisión de mecanismo (ADR 0007), pero el backend todavía
  no la publicó en `packages/contracts/openapi.json` ni en `docs/contrato-backend-frontend.md`.
  Riesgo: implementar una ruta inventada que el backend nunca exponga. Decisión requerida: que los
  dueños de backend y frontend ratifiquen la propuesta y la publiquen en el contrato.
  **Bloqueante para implementar.**
- `[DECIDIDO — ADR 0007]` **Transporte de sesión: cookie `HttpOnly`/`Secure`/`SameSite=Strict`
  emitida por el backend.** Riesgo residual: si el backend se niega a emitirla, el portal no tiene
  forma segura de sostener sesión sin violar RNF-01 y se aplica la alternativa 1 del ADR.
- `[DECIDIDO — ADR 0007]` **Roles del portal:** solo `COORDINADORA_CONVIVENCIA`, `RECTORIA`,
  `GERENCIA_TRANSPORTE`, `JEFE_OPERACIONES` y `ADMINISTRADOR_CARTERA`. `MONITORA`, `CONDUCTOR` y
  `ACUDIENTE` usan apps móviles y reciben denegación explícita en el portal.
- `[SUPUESTO]` **MFA solo para `COORDINADORA_CONVIVENCIA`.** El SRS exige TOTP para la coordinadora
  y no para el resto. El portal no mantiene una lista propia: obedece el `mfa_required` que declare
  el backend. Decisión requerida: confirmar con backend/seguridad que hoy el segundo factor aplica
  únicamente a ese rol.
- `[SUPUESTO]` **Mensaje genérico único ante fallo (anti-enumeración).** El SRS exige mínimo
  privilegio y no filtrado de datos; no menciona enumeración de usuarios. Se adopta como
  interpretación de RNF-01 y de `docs/constitution.md` §3. Decisión requerida: confirmar el texto y
  la política de bloqueo por intentos, que probablemente define el backend.
- `[SUPUESTO]` **RNF-04 aplicado al portal web.** El SRS enmarca RNF-04 como usabilidad móvil; se
  aplica al portal por coherencia. Riesgo: sobrecosto de diseño. Decisión requerida: aceptar o
  acotar los 48 px al portal.
- `[SUPUESTO]` **Duración y renovación de sesión.** Sin valores en el SRS más allá de "JWT de vida
  corta con refresh rotativo" (A.2). Riesgo: sesiones eternas o cierres abruptos en mitad de una
  emergencia. Decisión requerida: valores y comportamiento de expiración acordados con backend.
- `[SUPUESTO]` **Bloqueo por intentos fallidos y desbloqueo.** No está en el SRS. Riesgo: bloqueo
  total de la coordinadora durante una emergencia. Decisión requerida: política de bloqueo y
  procedimiento de recuperación (fuera del alcance de esta spec).
- `[SUPUESTO]` **Idioma y tono de los mensajes.** Se asume español institucional; requiere visto
  bueno del responsable.

## Criterios de aceptación

- [ ] El formulario de acceso valida la entrada antes de enviar (campos vacíos, formato de
      identificador) y muestra el error junto al campo, sin enviar la petición.
- [ ] Con credenciales válidas de un rol sin segundo factor, el portal obtiene identidad y roles del
      backend y deja la sesión en estado autenticado sin exponer el token a JavaScript.
- [ ] Con credenciales válidas de `COORDINADORA_CONVIVENCIA`, el portal exige el código TOTP antes
      de permitir cualquier ruta protegida.
- [ ] **Denegación esperada — sin segundo factor:** con credenciales válidas de
      `COORDINADORA_CONVIVENCIA` y sin completar el TOTP, no se emite sesión utilizable y cualquier
      intento de navegar a una ruta protegida redirige al acceso; la prueba falla si se renderiza
      contenido de la consola.
- [ ] **Denegación esperada — escalamiento no autorizado:** una sesión con rol `MONITORA`,
      `CONDUCTOR` o `ACUDIENTE` que intente abrir la ruta de consola/administración recibe
      denegación (página de acceso denegado o redirección) y no se renderiza navegación de flota
      global (HU-13, HU-19).
- [ ] **Denegación esperada — persistencia de credenciales:** tras un login exitoso, `localStorage`
      y `sessionStorage` no contienen tokens ni datos personales, `document.cookie` no expone la
      credencial de sesión y la URL no transporta tokens; la prueba inspecciona ambos storages, las
      cookies legibles y la URL, y falla si aparece cualquier secreto.
- [ ] **Denegación esperada — cookie fabricada:** una cookie o credencial de sesión fabricada por el
      cliente no otorga acceso; ante la respuesta de no autorizado el portal descarta el estado en
      memoria y vuelve al acceso sin mostrar datos.
- [ ] Un fallo de autenticación muestra un mensaje único e idéntico para credenciales inválidas y
      para cuentas inexistentes, no refleja la entrada del usuario y no registra la contraseña en la
      consola ni en logs del cliente.
- [ ] Al cerrar sesión, el portal invoca el cierre en el servidor, descarta el estado en memoria y
      redirige al acceso; el botón "atrás" no restaura una vista autenticada.
- [ ] Al expirar o fallar la renovación de sesión, el portal redirige al acceso y no deja datos de
      identidad visibles.
- [ ] La identidad y los roles usados por el guardia de rutas provienen exclusivamente de la
      respuesta del backend validada contra el contrato; un rol desconocido en esa respuesta se
      trata como sin permiso.
- [ ] Todos los controles interactivos del flujo miden ≥ 48×48 px CSS y la verificación automática
      de accesibilidad no reporta violaciones de contraste ni de etiquetado en el formulario.
- [ ] Las pruebas usan exclusivamente datos ficticios (sin nombres, correos ni documentos reales).
