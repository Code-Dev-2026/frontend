---
description: Escribe el plan técnico de una spec aprobada o en revisión
agent: planner
---

Spec: **$ARGUMENTS**

## Antes de escribir

1. Lee `spec.md`, `docs/architecture.md`, los ADR y los skills de dominio aplicables.
2. Confirma que la spec cita requisitos reales del SRS.

## Salida

Crea o actualiza `specs/NNN-*/plan.md`:

- Enfoque y límites.
- Archivos afectados (solo `apps/**` y `packages/**`).
- Decisiones técnicas con alternativa descartada y motivo.
- Contratos y eventos usados (solo los del contrato).
- Estados canónicos implicados.
- Pruebas: unitaria, integración y denegación esperada.
- Rollback sin dejar datos inconsistentes.

## Reglas

- No escribas código.
- No propongas dependencias nuevas sin justificarlas con un requisito y marcarlas para aprobación.
- No propongas cambios de esquema, migraciones ni contrato sin ADR.
- Si el plan contradice la constitución, detente y repórtalo.
