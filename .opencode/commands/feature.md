---
description: Inicia el ciclo SDD completo para una funcionalidad, con compuertas de aprobación humana
agent: coordinator
---

Vas a conducir el ciclo SDD completo para: **$ARGUMENTS**

## Secuencia

1. **Estado**: lee `specs/README.md` y `specs/` para ver si la funcionalidad ya existe.
2. **Especificar**: delega en `planner` la creación de `specs/NNN-<app>-<feature>/spec.md` con IDs reales del SRS.
3. **Aclarar**: pide al `planner` que resuelva ambigüedades con el responsable; lo no resuelto se marca `[SUPUESTO]`.
4. **Planificar y desglosar**: delega `plan.md` y `tasks.md`.
5. **Compuerta 1**: muestra la spec al responsable y pide aprobación explícita. No continúes sin un "aprobado".
6. **Implementar**: solo con la spec en `aprobada`, delega en `implementer`.
7. **Analizar y verificar**: delega en `reviewer` (`/sdd-analyze`, `/sdd-verify`).
8. **Compuerta 2**: presenta hallazgos y evidencia; pide aprobación humana para cerrar.

## Reglas

- No edites archivos: tu trabajo es orquestar y verificar que existan las compuertas.
- No inventes requisitos, endpoints, estados ni dependencias.
- Si una fase falla dos veces, detente y escala al responsable.
- Recuerda que la IA no hace merge ni aprueba PRs.

## Salida

Al final de cada fase, reporta: **Estado**, **Hecho**, **Evidencia**, **Riesgos**, **Decisión requerida**.
