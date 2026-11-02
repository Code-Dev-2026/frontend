# ADR 0003: Offline-first y outbox

- Estado: aceptado
- Fecha: 2026-11-02

## Contexto
La app monitora opera en condiciones con baja conectividad y requiere sincronización idempotente segura.

## Decisión
Se implementa un patrón outbox local con tabla `outbox`, UUIDv7 como identificador de idempotencia y estados `pendiente`/`enviado`.

## Consecuencias
- Se evitan duplicados en reintentos
- Se reduce riesgo de pérdida de eventos cuando hay conexión intermitente
- Se requiere protocolo de confirmación HTTP 200/201 para limpieza de registros
