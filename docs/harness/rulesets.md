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
  "paths": ["packages/contracts/**"],
  "sides": {
    "backend": ["Muchavisoy-20", "YutamasPRO"],
    "frontend": ["jabv123", "Z-83"]
  }
}
```

En el repositorio backend, el mismo archivo declara `docs/contrato-backend-frontend.md` como ruta.

## Cómo funciona el check

1. Se dispara en PR abierto, actualizado, reabierto, listo para revisión y en cada revisión enviada o
   descartada.
2. Lee la política del **commit base**, no del head: un PR no puede relajar sus propias reglas.
3. Lista los archivos del PR. Si ninguno coincide con `paths`, termina en verde.
4. Toma la última revisión de cada persona y cuenta solo las que están en `APPROVED`.
5. Exige al menos una aprobación de cada lado. Si falta alguna, falla con el nombre del lado y de sus
   integrantes.

El check se llama `contract-review` (nombre del job), no "Contract review" (nombre del workflow).

### Prueba del script

El comportamiento se prueba contra una API simulada, sin red ni credenciales:

```bash
node .github/scripts/contract-review.test.mjs .github/scripts/contract-review.mjs packages/contracts/openapi.json
```

Cubre cinco casos: solo aprobación de backend (falla), ambos lados (pasa), PR sin cambios en el
contrato (pasa), aprobación revocada con `CHANGES_REQUESTED` (falla) y solo frontend (falla). La
prueba corre en `frontend-ci.yml` y en `harness-ci.yml` del backend.

## Prerrequisitos

1. **Acceso de revisión.** Los cuatro handles deben poder revisar en ambos repositorios. Si el
   backend no tiene acceso al frontend, el check nunca podrá pasar: hay que darles permiso de lectura
   o agregarlos a un equipo de la organización.
2. **El check debe existir antes de exigirlo.** GitHub no permite marcar como obligatorio un check que
   nunca se ha reportado. Abre un PR de prueba (puede ser este mismo) y espera a que corra
   `contract-review`.
3. **Disponibilidad de rulesets.** En repositorios públicos están en el plan gratuito; en privados
   requieren GitHub Pro, Team o Enterprise.
4. **La rama por defecto debe tener el workflow.** Los eventos de revisión usan la versión del
   workflow que está en la rama por defecto.

## Aplicar el ruleset

### Desde la interfaz

1. Settings → Rules → Rulesets → **New branch ruleset**.
2. Target: `main` (o `~DEFAULT_BRANCH`).
3. Enforcement: **Active**; bypass list vacía salvo administradores de emergencia.
4. Activar: require a pull request (1 aprobación, code owner review, dismiss stale reviews,
   resolver conversaciones), require status checks (`frontend-verify`, `contract-review`), block
   force pushes, block deletions, require linear history.
5. Guardar.

### Con la API

```bash
gh api --method POST repos/Code-Dev-2026/frontend/rulesets \
  --input .github/rulesets/main.json

gh api repos/Code-Dev-2026/frontend/rulesets
```

En backend, el mismo comando con `Code-Dev-2026/backend` y sus checks (`validate-database`,
`static-analysis`, `harness-validation`, `contract-review`).

> `gh` no está instalado en la máquina de desarrollo actual (`git push` también está bloqueado por
> `opencode.json`). Estos comandos se ejecutan desde una máquina con `gh` autenticado o desde la
> interfaz web.

## Mantenimiento

- Cambiar integrantes o rutas: editar `.github/contract-reviewers.json` en un PR normal.
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
- El workflow no comenta en el PR; el detalle queda en el resumen del job (`GITHUB_STEP_SUMMARY`) y
  en el mensaje de error.
