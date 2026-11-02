# Discrepancias registradas del harness

Este documento registra discrepancias entre el prompt del harness, el SRS y la implementación efectiva en `README.md`, que es la fuente de verdad. El README siempre gana.

## Discrepancias con el Anexo A / SRS

| Tema                                   | Anexo A / SRS                             | README vigente                                | Decisión del harness                                                                                 |
| -------------------------------------- | ----------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Node                                   | 22 LTS                                    | 20 LTS                                        | Se usa Node 20 LTS en scripts y CI.                                                                  |
| Partición GPS                          | Por día                                   | Mensual                                       | Se asume partición mensual; no se instala ninguna herramienta adicional.                             |
| Redis / BullMQ / ElastiCache / Traccar | Propuestos                                | No aparecen en el stack oficial               | Solo se proponen como ADR si una tarea lo exige; no se asumen ni se instalan.                        |
| Estados del estudiante                 | 6 estados con nombres en lenguaje natural | Nombres en `SNAKE_CASE` del esquema V006 y ER | La lista canónica sale de `db/migrations/V006__attendance_and_custody_lifecycle.sql` y `docs/er.md`. |
| QR firmado Ed25519 verificable offline | Propuesto                                 | No aparece                                    | Queda como decisión pendiente; se documenta como propuesta y no se implementa en el harness.         |

## Otras discrepancias o decisiones pendientes

- El prompt original menciona `bitacora_auditoria` e `historial_estado_custodia` con candado `pg_advisory_xact_lock(9876543210)`. Las migraciones actuales usan `9876543211` en `historial_estado_custodia`; el README define la regla general y la práctica debe ajustarse a la migración de referencia, documentando la variación como parte del control de integridad. El harness no altera esa migración.
- El prompt de ingeniería del harness menciona `docs/harness/` y `AGENTS.md` pero el repo no los tenía al inicio; se crean como capa de gobierno y no como funcionalidad de negocio.
- El estado actual del repo es solo base de datos (`db/**` + docs + CI), por lo que `scripts/verify.sh` debe ejecutarse en modo SQL y omitir validaciones Node/TS si no existe `package.json`.

## Referencias canónicas

- [README.md](../README.md)
- [docs/er.md](../er.md)
- [db/migrations/V006__attendance_and_custody_lifecycle.sql](../../db/migrations/V006__attendance_and_custody_lifecycle.sql)
- [db/migrations/V010__security_rls_and_permissions.sql](../../db/migrations/V010__security_rls_and_permissions.sql)
