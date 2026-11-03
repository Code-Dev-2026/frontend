# Contribución

## Fuentes de verdad

- El **SRS** (`docs/backend-ref/srs.md`, espejo de `backend/docs/srs.md`) define el **QUÉ**.
- Los **ADR** (`docs/adr/`) y `docs/architecture.md` definen el **CÓMO** ya decidido.
- El `README.md` describe lo implementado y **no es normativo**.
- La precedencia completa está en `docs/adr/0005-fuente-de-verdad-y-precedencia.md`.
- Todo cambio en `packages/contracts/**`, `packages/domain/**` o en `docs/contrato-backend-frontend.md` requiere revisión del equipo del backend.

## Convenciones

- Commits con Conventional Commits.
- Se requieren pruebas para cambios de dominio y de sincronización offline.
- No se incorporan secretos ni claves privadas al repositorio.
- Los datos de prueba son ficticios.
- Ningún cambio de comportamiento sin spec aprobada en `specs/`.

## PR checklist

- [ ] ¿Cita un `RF/RNF/RN/HU` existente en el SRS?
- [ ] ¿Hay spec aprobada si cambia comportamiento?
- [ ] ¿Cambia el contrato con backend? (requiere aprobación conjunta)
- [ ] ¿Se ejecutó `node scripts/verify.mjs` en verde?
- [ ] ¿Se documentó la decisión pendiente?
