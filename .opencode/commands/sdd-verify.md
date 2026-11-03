---
description: Ejecuta la verificación completa y registra la evidencia de una spec
agent: reviewer
subagent: true
---

Spec: **$ARGUMENTS**

## Ejecuta

1. `node scripts/verify.mjs --no-install`
2. `node scripts/check-invariants.mjs`
3. `node scripts/sync-backend-ref.mjs --check`

Si un comando falla, no lo ocultes: guarda la salida y marca el bloqueo.

## Registra

Crea `specs/NNN-*/evidence/verify-<fecha>.md` con:

- Fecha, commit y autor de la revisión.
- Comando ejecutado y código de salida.
- Resumen de la salida (sin datos sensibles).
- Invariantes: storage, MQTT, geolocalización, imágenes, secretos.
- Specs validadas y requisitos cubiertos.
- Deriva del espejo del SRS.

## Veredicto

`VERIFICADA` solo si todo está en verde y no hay hallazgos bloqueantes. En caso contrario:
`NO_VERIFICADA` con la lista de bloqueos y el siguiente paso.

No edites código ni la spec.
