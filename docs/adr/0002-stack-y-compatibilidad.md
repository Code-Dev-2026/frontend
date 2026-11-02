# ADR 0002: Stack y compatibilidad

- Estado: aceptado
- Fecha: 2026-11-02

## Decisión
Se usa pnpm workspaces, Turborepo, TypeScript estricto, Next.js App Router para portal y Expo development build para apps móviles.

## Compatibilidad
- Node 20 LTS
- React Native / Expo con SDK compatible bajo Node 20
- Socket.IO 4.x
- SQLite para sincronización local y UUIDv7 para idempotencia

## Consecuencias
- Esquema modular y separable por capa
- Validación centralizada con Turbo
- Requiere mantener compatibilidad con versiones nativas de Expo y librerías
