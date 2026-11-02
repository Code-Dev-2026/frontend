# Regla de custodia

## Fuente y mecanismo

- Regla canónica: `README.md`, `docs/er.md`, `db/migrations/V006__attendance_and_custody_lifecycle.sql`.
- Mecanismo: pruebas SQL, validadores de estado y `fn_verificar_integridad_custodia`.

## Reglas

1. Estados canónicos: `EN_CASA`, `A_BORDO_VEHICULO`, `EN_COLEGIO`, `RETORNO_SEDE_POR_FALLA_ENTREGA`.
2. `DENEGADO_SOBRECUPO` bloquea el abordaje si la capacidad nominal se alcanza.
3. La entrega a receptor con alerta judicial activa queda bloqueada.
4. Se exige control de autorizados activos y un máximo de 3 adultos autorizados por estudiante.
5. El historial de custodia usa encadenamiento SHA-256 y no admite `UPDATE/DELETE/TRUNCATE`.

## Requisitos SRS

- RF-02, RF-03, RF-05, RF-06, RF-07, RF-08, RN-01 a RN-05.
