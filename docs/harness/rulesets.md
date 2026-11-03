# Rulesets y doble aprobación del contrato

## El problema

`CODEOWNERS` solicita revisión a los dueños, pero **una línea con varios dueños exige la aprobación
de solo uno de ellos**. Por eso la regla "un dueño de backend y uno de frontend" no se puede cumplir
solo con `CODEOWNERS`: si aprueba un frontend, el PR queda habilitado aunque el backend nunca lo haya
visto.

## Las tres capas

| Capa                  | Archivo                                                                         | Qué hace                                                                                     |
| :-------------------- | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------- |
| Solicitud de revisión | `CODEOWNERS`                                                                    | Pide revisión a los cuatro dueños cuando cambia una ruta protegida.                          |
| Verificación por lado | `.github/workflows/contract-review.yml` + `.github/scripts/contract-review.mjs` | Falla si el PR toca el contrato y falta una aprobación vigente de cada lado.                 |
| Bloqueo de merge      | `.github/rulesets/main.json`                                                    | Hace obligatorios el check `contract-review`, la revisión de code owners y los checks de CI. |

La política de lados y rutas vive en `.github/contract-reviewers.json`:

```json
{
  "paths": [
    "packages/contracts/**",
    "docs/backend-ref/contrato-backend-frontend.md",
    ".github/contract-reviewers.json",
    ".github/scripts/contract-review.mjs",
    ".github/workflows/contract-review.yml"
  ],
  "sides": {
    "backend": ["Muchavisoy-20", "YutamasPRO"],
    "frontend": ["jabv123", "Z-83"]
  }
}
```

En el repositorio backend, el mismo archivo declara `docs/contrato-backend-frontend.md` y los tres
archivos del check.

La política se incluye a sí misma en `paths`: un PR que intente quitar un lado, relajar las rutas o
debilitar el script se evalúa con la política **anterior** y exige las dos firmas. Sin eso, bastaría
una aprobación de frontend para desactivar la doble aprobación.

## Cómo funciona el check

1. Se dispara en PR abierto, actualizado, reabierto, listo para revisión y en cada revisión enviada o
   descartada.
2. Lee la política del **commit base**, no del head: un PR no puede relajar sus propias reglas.
3. Lista los archivos del PR. Si ninguno coincide con `paths`, termina en verde.
4. Toma la última revisión de cada persona (comparando el login sin distinguir mayúsculas) y cuenta
   solo las que están en `APPROVED`.
5. Exige al menos una aprobación de cada lado. Si falta alguna, falla con el nombre del lado y de sus
   integrantes.

El check se llama `contract-review` (nombre del job), no "Contract review" (nombre del workflow).

### Prueba del script

El comportamiento se prueba contra una API simulada, sin red ni credenciales:

```bash
node .github/scripts/contract-review.test.mjs .github/scripts/contract-review.mjs packages/contracts/openapi.json
```

Cubre seis casos: solo aprobación de backend (falla), ambos lados (pasa), PR sin cambios en el
contrato (pasa), aprobación revocada con `CHANGES_REQUESTED` (falla), solo frontend (falla) y login
con mayúsculas (pasa). La prueba corre en `frontend-ci.yml` y en `harness-ci.yml` del backend.

## Prerrequisitos

1. **Acceso de revisión.** Los cuatro handles deben poder revisar en ambos repositorios. Si el
   backend no tiene acceso al frontend, el check nunca podrá pasar: hay que darles permiso de lectura
   o agregarlos a un equipo de la organización.
2. **El check debe existir antes de exigirlo.** GitHub no permite marcar como obligatorio un check que
   nunca se ha reportado. El PR que introduce el workflow no se autovalida (`pull_request_target`
   ejecuta la versión de la rama por defecto): mergea primero y espera a que el siguiente PR reporte
   `contract-review`.
3. **Disponibilidad de rulesets.** La función debe estar habilitada en el repositorio; en repositorios
   privados puede depender del plan. Compruébalo en Settings → Rules antes de aplicarlo.
4. **La rama por defecto debe tener el workflow.** Los eventos de revisión usan la versión del
   workflow que está en la rama por defecto.

## Aplicar el ruleset

### Desde la interfaz

1. Settings → Rules → Rulesets → **New branch ruleset**.
2. Target: `main` (o `~DEFAULT_BRANCH`).
3. Enforcement: **Active**; bypass list vacía salvo administradores de emergencia.
4. Activar: require a pull request (1 aprobación en frontend, 2 en backend; code owner review,
   dismiss stale reviews, resolver conversaciones), require status checks (`frontend-verify` y
   `contract-review` en frontend; los cuatro del backend), block force pushes, block deletions,
   require linear history. Con historia lineal, los métodos permitidos son `squash` y `rebase`: un
   merge commit la rompe.
5. Guardar.

### Con la API

```bash
gh api --method POST repos/Code-Dev-2026/frontend/rulesets \
  --input .github/rulesets/main.json

gh api repos/Code-Dev-2026/frontend/rulesets
```

En backend, el mismo comando con `Code-Dev-2026/backend` y los contextos visibles de sus jobs:
`Validate PostgreSQL 16 + PostGIS DDL Migrations`, `Static Code & Secret Analysis`,
`harness-validation` y `contract-review`. Los dos primeros son el `name:` del job, no su id.

> `gh` no está instalado en la máquina de desarrollo actual (`git push` también está bloqueado por
> `opencode.json`). Estos comandos se ejecutan desde una máquina con `gh` autenticado o desde la
> interfaz web.

## Mantenimiento

- Cambiar integrantes o rutas: editar `.github/contract-reviewers.json` en un PR normal. Ese PR exige
  las dos firmas, porque el propio archivo está en `paths`.
- El cambio de política se evalúa con la política anterior en ese mismo PR; es intencional.
- Si se agrega un rol o un artefacto de contrato nuevo, se añade la ruta a `paths`.
- El ruleset no reemplaza la aprobación humana del responsable: la complementa.

## Limitaciones conocidas

- Los administradores del repositorio pueden saltarse el ruleset si se configuran como bypass; se
  recomienda dejar la lista vacía.
- El check cuenta aprobaciones de personas, no de equipos: si cambia el equipo, hay que actualizar el
  JSON.
- Una aprobación con el estado `CHANGES_REQUESTED` posterior invalida la anterior; es el
  comportamiento esperado.
- El check asume `dismiss_stale_reviews_on_push: true` en el ruleset: sin esa opción, una aprobación
  anterior sigue contando después de un push.
- La verificación del espejo (`sync-backend-ref --check`) es local: en CI no se clona el repositorio
  backend. El check `contract-review` solo exige firmas cuando el PR toca el espejo.
- El workflow no comenta en el PR; el detalle queda en el resumen del job (`GITHUB_STEP_SUMMARY`) y
  en el mensaje de error.
