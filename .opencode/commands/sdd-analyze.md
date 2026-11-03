---
description: Analiza consistencia entre spec, plan, tareas y requisitos del SRS
agent: reviewer
subagent: true
---

Spec: **$ARGUMENTS**

## Análisis (solo lectura)

1. **Trazabilidad**: cada tarea y archivo se conecta a un requisito del SRS. Detecta requisitos sin tarea y tareas sin requisito.
2. **Consistencia**: `spec.md`, `plan.md` y `tasks.md` no se contradicen.
3. **Cobertura**: hay prueba para cada criterio de aceptación, incluida una denegación.
4. **Constitución**: se cumplen los 6 principios.
5. **Arquitectura**: `apps/* → packages/*`; `packages/domain` sin React/Expo/Next/fetch.
6. **Riesgos**: seguridad, privacidad, offline, fechas, dinero y estados canónicos.
7. **Dependencias**: ninguna nueva sin aprobación.
8. **Espejo**: `node scripts/sync-backend-ref.mjs --check`.

## Salida

Guarda `specs/NNN-*/evidence/analysis-<fecha>.md` con:

- Hallazgos por severidad (`bloqueante`, `mayor`, `menor`) y `archivo:línea`.
- Requisitos sin cobertura.
- Recomendación: `LISTA_PARA_APROBAR` o `REQUIERE_CAMBIOS`.

No edites spec, plan, tareas ni código.
