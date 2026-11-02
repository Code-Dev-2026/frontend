# Regla de pruebas

## Fuente y mecanismo

- Regla canónica: `README.md`, `db/tests/test_suite_camino_seguro.sql`, `PULL_REQUEST_TEMPLATE.md`.
- Mecanismo: `scripts/verify.sh`, suite SQL y evaluaciones reproducibles.

## Reglas

1. Cada requerimiento funcional o no funcional debe tener prueba ejecutable.
2. Las denegaciones obligatorias forman escenarios dorados para la evaluación.
3. Las pruebas de seguridad deben comprobar RLS, `billing`, WORM, sobrecupo y validación de receptor.
4. El pipeline de verificación falla en el primer paso que falle.
5. No se aceptan pruebas con datos reales ni `localStorage` de tokens.

## Requisitos SRS

- RF-02, RF-03, RF-06, RF-07, RF-15, RF-19 y RNF-02 / RNF-05 / RNF-07.
