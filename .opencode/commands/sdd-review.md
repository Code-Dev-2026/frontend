---
description: Revisión final de una spec implementada y emisión de veredicto
agent: reviewer
subagent: true
---

Spec: **$ARGUMENTS**

## Revisión final

1. Lee `spec.md`, `plan.md`, `tasks.md`, el diff y la evidencia.
2. Aplica el checklist del agente `reviewer` y los skills de dominio.
3. Comprueba que no haya cambios fuera del alcance de la spec.
4. Comprueba que la evidencia sea real y reproducible.
5. Comprueba que no se hayan tocado migraciones, contrato o dependencias sin ADR.

## Salida

Guarda `specs/NNN-*/evidence/review-<fecha>.md` con:

- Veredicto: `APPROVED` o `CHANGES_REQUESTED`.
- Hallazgos por severidad con `archivo:línea`.
- Riesgos residuales.
- Qué debe decidir el responsable humano antes del merge.

## Prohibido

- Editar código, spec o configuración.
- Aprobar con un hallazgo bloqueante abierto.
- Hacer merge o push.
