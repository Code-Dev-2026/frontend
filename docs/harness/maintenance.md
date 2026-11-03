# Mantenimiento del harness

## Objetivo

Mantener el arnés actualizable, verificado y sin dos fuentes de verdad.

## Procedimiento

1. Un fallo recurrente del agente se registra en `failure-log.md`.
2. El problema se transforma en una regla mecánica, un permiso o un ajuste de prompt.
3. Se valida con `node scripts/verify.mjs` antes de cerrar la corrección.
4. Si cambia el SRS, se regenera el espejo con `node scripts/sync-backend-ref.mjs` en el mismo PR.
5. Si cambia un estado, contrato o dependencia, se escribe un ADR antes de tocar código.

## Buenas prácticas

- Documentar la decisión antes de adaptar permisos.
- Mantener los scripts idempotentes y sin dependencias externas.
- No ocultar violaciones de seguridad: el invariante falla y se corrige.
- Mantener la capa de gobierno separada de la lógica de negocio.
- Revisar `docs/harness/README.md` para saber qué documento sigue vigente.

## Señales de alarma

- Un documento del arnés contradice `AGENTS.md` o la constitución.
- Una spec cita un requisito que no existe en `docs/backend-ref/srs.md`.
- `node scripts/sync-backend-ref.mjs --check` reporta deriva.
- Un agente edita fuera de su ámbito permitido.
