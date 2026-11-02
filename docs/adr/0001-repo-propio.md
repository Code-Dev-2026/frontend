# ADR 0001: Repositorio propio para frontend

- Estado: aceptado
- Fecha: 2026-11-02

## Contexto
El backend define una fuente de verdad y un contrato que el frontend consume. La arquitectura del proyecto separa repositorios y evita acoplar UI con lógica de negocio del backend.

## Decisión
Se crea un repo independiente `frontend` con monorepo interno pnpm + workspaces, con apps y packages aislados.

## Consecuencias
- Reducción de acoplamiento entre negocio y experiencia
- Revisión explícita de cambios que impactan el contrato
- Requiere coordinación con backend para cambios en `packages/contracts` y `packages/domain`
