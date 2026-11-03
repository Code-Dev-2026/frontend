---
description: Resuelve ambigüedades de una spec y registra los supuestos pendientes
agent: planner
---

Spec: **$ARGUMENTS**

## Procedimiento

1. Lee `spec.md`, el SRS y el contrato.
2. Detecta ambigüedades que impidan implementar: reglas no definidas, estados, permisos, errores, datos.
3. Formula como máximo 5 preguntas concretas al responsable, cada una con opciones y una recomendación.
4. Si el responsable responde, actualiza `spec.md` con la decisión.
5. Si no hay respuesta, marca `[SUPUESTO]` con la opción elegida y el impacto de equivocarse.

## Reglas

- No inventes una respuesta para "avanzar".
- No cambies el alcance sin señalarlo explícitamente.
- No toques código.
- Si la ambigüedad afecta seguridad, privacidad o estados canónicos, es bloqueante: no la marques como supuesto resuelto.
