# Specs — especificaciones derivadas del SRS

Aquí viven las specs **por funcionalidad**. No son el SRS: lo citan y lo traducen a un plan
verificable. La fuente del QUÉ es `docs/backend-ref/srs.md`.

## Convención

```text
specs/NNN-<app>-<feature>/
├── spec.md        qué se construye y qué requisitos del SRS cubre
├── plan.md        cómo se construye (decisiones técnicas, alternativas descartadas)
├── tasks.md       tareas ordenadas, con dueño y criterio de terminado
└── evidence/      pruebas, salidas de verificación y revisión
```

- `NNN`: tres dígitos, correlativo, sin reutilizar.
- `<app>`: `portal`, `acudiente`, `monitora`, `packages` o `transversal`.
- `<feature>`: kebab-case, corto y estable (`login`, `custodia-abordaje`, `cartera-pagos`).

Ejemplo: `specs/001-portal-login/spec.md`.

## Ciclo de vida

`borrador → en-revision → aprobada → implementada → verificada → archivada`

- **borrador**: el `planner` la escribe a partir del SRS.
- **en-revision**: el `reviewer` valida trazabilidad, riesgos y criterios de aceptación.
- **aprobada**: el responsable humano da el visto bueno por escrito; recién aquí se implementa.
- **implementada**: el `implementer` terminó las tareas y hay evidencia de pruebas.
- **verificada**: `node scripts/verify.mjs` en verde y revisión de seguridad cerrada.
- **archivada**: se conserva como histórico; no se borra.

## Frontmatter mínimo de `spec.md`

```yaml
---
state: borrador
app: portal
requirements: [RF-02, RNF-06]
owner: responsable-humano
---
```

## Reglas

1. Toda spec cita al menos un `RF-`, `RNF-`, `RN-` o `HU-` que exista en el SRS.
2. Una spec no puede contradecir la constitución (`docs/constitution.md`) ni un ADR.
3. Lo que no esté en el SRS se marca `[SUPUESTO]` y requiere decisión antes de implementarse.
4. Los datos de las pruebas son ficticios; nunca se copian datos reales.
5. La spec no se reescribe para justificar el código: si el código se desvía, se corrige el código
   o se abre un ADR.

## Comandos

`/feature`, `/sdd-status`, `/sdd-spec`, `/sdd-clarify`, `/sdd-plan`, `/sdd-tasks`,
`/sdd-implement`, `/sdd-analyze`, `/sdd-verify`, `/sdd-review`.
