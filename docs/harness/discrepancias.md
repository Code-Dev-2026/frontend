# Discrepancias registradas del harness

Este documento registra discrepancias entre el SRS, los ADR y la implementación efectiva descrita en `README.md`.

**Precedencia vigente ([ADR 0005](../adr/0005-fuente-de-verdad-y-precedencia.md)):**

1. Instrucción explícita del responsable, por escrito.
2. SRS (`backend/docs/srs.md`) para el **QUÉ**.
3. ADR y `docs/architecture.md` para el **CÓMO** decidido.
4. `README.md`: estado implementado, **descriptivo y no normativo**.
5. `[SUPUESTO]` explícito.

Ninguna divergencia se cierra eligiendo una fuente: se documenta en un ADR con la alternativa descartada y se refleja en el SRS en el mismo PR.

## Discrepancias con el Anexo A / SRS

| Tema                                   | SRS / Anexo A                          | Implementado                             | Estado según ADR 0005                                                                                   |
| -------------------------------------- | -------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Node                                   | 22 LTS                                 | 20 LTS (`engines`, `.nvmrc`, CI)         | Divergencia abierta, **sin impacto**: 20 está dentro de `>=20 <23`.                                     |
| Partición GPS                          | Por día                                | Mensual (`V005`)                         | Divergencia abierta, sin impacto en frontend.                                                           |
| Redis / BullMQ / ElastiCache / Traccar | Propuestos                             | No aparecen                              | No se asumen ni se instalan sin ADR previo.                                                             |
| Estados del estudiante                 | §4: 6 estados en lenguaje natural      | 4 en `SNAKE_CASE` (`V006`, ER, `domain`) | Resuelta por [ADR 0006](../adr/0006-estados-canonicos-custodia.md): 4 canónicos; 2 del SRS son eventos. |
| QR firmado Ed25519 verificable offline | A.3: propuesto para la app de monitora | No implementado                          | Propuesta: ADR + SRS antes de instalar dependencias.                                                    |

## Otras discrepancias o decisiones pendientes

- El prompt original menciona `bitacora_auditoria` e `historial_estado_custodia` con candado `pg_advisory_xact_lock(9876543210)`. Las migraciones actuales usan `9876543211` en `historial_estado_custodia`; el README define la regla general y la práctica debe ajustarse a la migración de referencia, documentando la variación como parte del control de integridad. El harness no altera esa migración.
- El prompt de ingeniería del harness menciona `docs/harness/` y `AGENTS.md` pero el repo no los tenía al inicio; se crean como capa de gobierno y no como funcionalidad de negocio.
- El estado actual del repo **sí** tiene `package.json`, 3 apps y 3 paquetes; este documento se heredó del backend y debe reescribirse en la Fase 0 del arnés frontend.
- `scripts/verify.sh` y `scripts/check-invariants.sh` requieren `bash`, que no está instalado en la máquina Windows de desarrollo. Resuelto: la verificación local corre en Node (`scripts/verify.mjs`, `scripts/check-invariants.mjs`) y los `.sh` quedan como envoltorios para CI.

## Referencias canónicas

- [README.md](../README.md)
- [docs/backend-ref/er.md](../backend-ref/er.md)
- [db/migrations/V006__attendance_and_custody_lifecycle.sql](../../db/migrations/V006__attendance_and_custody_lifecycle.sql)
- [db/migrations/V010__security_rls_and_permissions.sql](../../db/migrations/V010__security_rls_and_permissions.sql)
