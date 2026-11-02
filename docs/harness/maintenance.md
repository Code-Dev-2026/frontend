# Mantenimiento del harness

## Objetivo

Mantener el harness actualizable, verificado y alineado con las reglas del repositorio.

## Procedimiento

1. Cualquier fallo recurrente del agente se registra en `failure-log.md`.
2. El problema se transforma en una regla mecánica o en un ajuste de prompt.
3. Se valida con `scripts/verify.sh` antes de cerrar la corrección.

## Buenas prácticas

- Documentar decisión antes de adaptar permisos.
- Mantener scripts idempotentes.
- No ocultar violaciones de seguridad.
- Mantener la capa de gobierno separada de la lógica de negocio.
