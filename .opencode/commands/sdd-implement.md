---
description: Implementa las tareas aprobadas de una spec, con pruebas y evidencia
agent: implementer
subagent: true
---

Spec: **$ARGUMENTS**

## Compuerta de entrada

1. Lee `spec.md`, `plan.md` y `tasks.md`.
2. Si `spec.md` no está en `aprobada` o `implementada`, **detente** y reporta que falta aprobación humana.
3. Si una tarea exige una dependencia, endpoint o estado que no existe, **detente** y repórtalo.

## Ejecución

1. Toma las tareas en orden y marca cada una al completarla.
2. Escribe la prueba antes o junto con el código.
3. Aplica los skills de dominio que correspondan.
4. Ejecuta `pnpm test`, `pnpm typecheck` y `node scripts/check-invariants.mjs` antes de reportar.
5. Guarda la salida real en `specs/NNN-*/evidence/verify-<fecha>.md`.
6. No toques `spec.md`, `plan.md`, `package.json` de la raíz, `opencode.json`, `.opencode/**`, `scripts/**` ni `docs/**`.

## Al terminar

Reporta: tareas completadas, pruebas ejecutadas, salida, riesgos y qué queda pendiente.
Si algo falla dos veces, detente y escala; no "arregles" la spec.
