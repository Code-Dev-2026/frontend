## Resumen

## ¿Cambia el contrato con backend?

- [ ] Sí (requiere aprobación de un dueño del backend y uno del frontend)
- [ ] No

## ¿Requiere spec?

- [ ] No (sin cambio de comportamiento)
- [ ] Sí, spec aprobada en `specs/NNN-<app>-<feature>/spec.md`

## Verificación

- [ ] `node scripts/verify.mjs` en verde
- [ ] `node scripts/check-invariants.mjs` en verde
- [ ] `node scripts/sync-backend-ref.mjs --check` sin deriva
- [ ] Revisión del agente `reviewer` adjunta en `evidence/`

## Trazabilidad

- Requisitos del SRS: `RF-__`, `RNF-__`, `RN-__`, `HU-__`

## Riesgos y datos

- [ ] Sin datos personales reales en pruebas, capturas o logs
- [ ] Sin secretos ni tokens en el diff
