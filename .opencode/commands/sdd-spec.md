---
description: Crea o actualiza la spec de una funcionalidad a partir del SRS
agent: planner
---

Funcionalidad: **$ARGUMENTS**

## Antes de escribir

1. Lee `specs/README.md`, `docs/constitution.md` y `docs/architecture.md`.
2. Lee la sección relevante de `docs/backend-ref/srs.md`.
3. Lee `docs/backend-ref/contrato-backend-frontend.md` y los ADR aplicables.
4. Revisa si ya existe una spec para esta funcionalidad; si existe, actualízala en vez de duplicar.

## Salida

Crea `specs/NNN-<app>-<feature>/spec.md` usando `specs/_template/spec.md`:

- `state: borrador`
- `app`: `portal`, `acudiente`, `monitora`, `packages` o `transversal`
- `requirements`: solo IDs que existan en el SRS
- Contexto, alcance, requisitos, reglas de seguridad, riesgos, supuestos y criterios de aceptación.

## Reglas

- No inventes requisitos ni IDs. Si el SRS no cubre algo, escríbelo como `[SUPUESTO]` y pregunta.
- Cada criterio de aceptación debe poder convertirse en una prueba.
- Incluye al menos una denegación esperada si hay reglas de negocio.
- No toques `plan.md`, `tasks.md` ni código en este paso.
- Deja la spec en `borrador`; la aprobación es humana.

Al terminar, muestra la ruta creada y las preguntas abiertas (máximo 5).
