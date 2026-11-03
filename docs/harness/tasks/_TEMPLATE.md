# Contrato de tarea

> **Plantilla obsoleta (backend).** Las tareas nuevas se escriben en `specs/NNN-<app>-<feature>/tasks.md`
> y citan el SRS. Ver `specs/README.md` y `docs/harness/README.md`.

## ID

RF-XX / RNF-XX / HU-XX

## Objetivo

Describir el requisito, intención del cambio y su impacto operativo.

## Alcance

- Incluye:
- Excluye:

## Criterios de aceptación

- [ ] Criterio 1
- [ ] Criterio 2

## Denegaciones obligatorias (casos de prueba)

- [ ] Caso 1: condición de bloqueo
- [ ] Caso 2: condición de seguridad

## Archivos permitidos

- `db/**`
- `src/**`
- `docs/**`
- `scripts/**`

## Riesgos de seguridad

- IDOR
- RLS bypass
- fuga de datos sensibles
- sobrecupo / capacidad

## Definición de terminado

- Documento con pruebas y evidencia.
- `scripts/verify.sh` pasa.
- `security-reviewer` no reporta hallazgos críticos.
