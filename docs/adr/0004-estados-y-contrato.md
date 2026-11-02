# ADR 0004: Estados canónicos y contrato con backend

- Estado: aceptado
- Fecha: 2026-11-02

## Contexto
El backend define estados canónicos en la migración V006 y la documentación del README. La capa frontend debe usar esos nombres en dominio, aunque la presentación visual pueda reutilizar etiquetas amigables al usuario.

## Decisión
Se toma como contrato de dominio el conjunto oficial de estados y transiciones de V006, con validación exhaustiva en `packages/domain`.

## Consecuencias
- Se evita drift entre UI y backend
- Se requiere revisión del equipo backend para cambios en la semántica de estados
- Los eventos Socket.IO quedan pendientes hasta que el backend publique el contrato real
