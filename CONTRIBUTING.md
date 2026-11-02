# Contribución

## Fuentes de verdad
- El backend en `Code-Dev-2026/backend` es la fuente de verdad para estados, roles y contrato.
- Los cambios en `packages/contracts/**` o en `packages/domain/**` deben revisarse con el equipo del backend si impactan el contrato.

## Convenciones
- Commits con Conventional Commits.
- Se requieren pruebas para cambios de dominio y de sincronización offline.
- No se incorporan secretos ni claves privadas al repositorio.

## PR checklist
- [ ] ¿Cambia el contrato con backend?
- [ ] ¿Se validó con `pnpm lint`, `pnpm typecheck` y `pnpm test`?
- [ ] ¿Se documentó la decisión pendiente?
