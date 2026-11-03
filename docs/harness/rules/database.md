# Regla de base de datos

> **Documento heredado del backend: no normativo en el frontend.** Mandan `docs/constitution.md`,
> `docs/architecture.md`, `docs/adr/` y los skills de `.opencode/skills/`. Ver `docs/harness/README.md`.

## Fuente y mecanismo

- Regla canónica: `README.md`, `db/migrations/V001__*.sql`..`V010__*.sql`, `docs/backend-ref/er.md`.
- Mecanismo de cumplimiento: verificación SQL + `scripts/check-invariants.sh`.

## Reglas

1. `V001..V010` son inmutables; cualquier cambio requiere `Vxxx__*.sql` nueva.
2. Los nombres de migración siguen `Vxxx__descripcion.sql` con numeración consecutiva.
3. Las PK deben ser UUIDv7 usando `fn_uuid_generate_v7()`.
4. Los roles deben respetar: `app_owner`, `app_user`, `app_user_operations`, `app_user_billing`.
5. RLS queda activo en `estudiante`, `registro_gps` y `notificacion`.
6. `billing` queda aislado de roles operativos y logísticos.

## Requisitos SRS

- RF-15, RNF-02, RNF-08, RN-05.
