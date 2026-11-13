# AGENTS.md — reglas compartidas del frontend

Lee esta guía antes de trabajar en el monorepo. Las instrucciones específicas
complementan estas reglas: `apps/AGENTS.md` para las apps móviles y
`apps/portal/AGENTS.md` para el portal. Si una issue contradice estas reglas y
no hay una excepción documentada, detente y pregunta.

## Repositorio y arquitectura

- Este es un monorepo `pnpm` + Turborepo. Las apps son `apps/monitora`,
  `apps/acudiente` y `apps/portal`; los paquetes compartidos viven en
  `packages/`.
- La dirección de dependencias es `apps/* → packages/*`. Nunca importes una app
  desde otra ni hagas que un paquete compartido dependa de una app.
- Importa los paquetes compartidos con `@camino/*`, no mediante rutas relativas.
- Los contratos HTTP, tipos, errores y mocks salen solo de
  `packages/contracts`. Importa por módulo, no definas contratos propios en una
  app y no edites a mano `packages/contracts/src/generated/`; cambia
  `openapi.json` o la configuración de Orval y ejecuta
  `pnpm contracts:generate`.
- La lógica de negocio vive en `packages/domain`; las apps consumen sus reglas,
  no las reimplementan.
- `packages/ui` contiene primitivas visuales reutilizables, sin lógica de
  negocio ni llamadas de red. Los mocks HTTP compartidos usan MSW.

## Seguridad, privacidad e invariantes

- No registres datos personales de menores, documentos, fotos o teléfonos en
  consola, logs ni reportes de error.
- No guardes tokens ni datos personales en `localStorage` o `sessionStorage`.
- No uses MQTT en clientes frontend ni geolocalización continua en móviles.
  No incluyas claves privadas o claves de AWS en el código.
- Los invariantes se verifican con `pnpm invariants`. Una línea con
  `invariants-allow` omite una regla y requiere justificación en el PR.
- Respeta las reglas de producto del SRS y los límites de autorización del
  backend. La interfaz no reemplaza la autorización del servidor.

## Flujo de specs

Cada spec de funcionalidad se ubica en `specs/NNN-<app>-<feature>/`. Dentro de
esa carpeta solo se permiten estos archivos:

```
spec.md
plan.md
tasks.md
```

`spec.md` es obligatorio y lleva frontmatter con `state`, `app` y al menos un
ID de requisito del SRS. `plan.md` y `tasks.md` son obligatorios cuando el
estado no es `borrador`; en `tasks.md`, marca las tareas completadas con
`- [x]`. Los IDs deben existir en `docs/backend-ref/srs.md` y el número de la
carpeta debe corresponder al de la issue (por ejemplo, `FE-09` →
`009-monitora-ruta-activa`).

No generes ningún otro archivo, subcarpeta, captura, salida de comando ni
carpeta `evidence/` dentro de una spec. Registra las verificaciones en
`tasks.md` o en la descripción del PR. El CI valida tanto los nombres permitidos
como el contenido de las specs.

## Entrega y validación

- Node 20 y pnpm 10 son las versiones del repositorio. Usa `pnpm install
--frozen-lockfile` para instalar dependencias.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm invariants` y
  `pnpm verify` son los comandos generales del monorepo.
- Un PR por issue, con commits Conventional Commits y una descripción de qué se
  hizo, qué quedó fuera, decisiones tomadas y cómo verificarlo.
- Ejecuta `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm verify` antes de
  cerrar la tarea, siguiendo cualquier validación más específica de la app.
- Mantén los cambios dentro del alcance solicitado. No reviertas cambios
  preexistentes que no formen parte de la tarea.
- Si faltan assets, datos o decisiones necesarios para cumplir la issue, no los
  inventes: enumera lo que falta y espera indicaciones. Los placeholders
  necesarios para compilar deben quedar identificados como provisionales.
