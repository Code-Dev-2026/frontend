---
name: Offline y sincronización
description: Cola FIFO persistente, operación sin señal por más de 12 horas, idempotencia, reintentos y reconciliación sin perder eventos de custodia (RNF-06).
---

# Offline y sincronización

## Requisito

RNF-06: operar sin señal celular **más de 12 horas** con una **cola transaccional FIFO protegida**.
RNF-08: los eventos de desembarque y alertas legales no se pierden ni se mutan.

## Diseño

```text
acción → validación → evento con idempotencyKey → outbox (FIFO persistente)
                                                   ↓
                                    envío → éxito: marcar enviado
                                          → error de red: reintentar con backoff
                                          → 4xx: cuarentena + aviso, nunca borrar
```

- Persistencia local cifrada; nunca en `localStorage`/`sessionStorage`.
- Cada evento guarda `occurred_at`, `idempotencyKey`, tipo y payload validado.
- La cola sobrevive al cierre de la app y al reinicio del dispositivo.
- Un evento de custodia **nunca** se descarta automáticamente; si el servidor lo rechaza, va a
  cuarentena visible para la monitora y se escala.

## Reintentos

- Backoff exponencial con jitter; límite configurable.
- Sin reintentos infinitos en primer plano: se reprograma y se sigue operando.
- Al recuperar red se envía en orden FIFO; si un evento depende de otro, se respeta la secuencia.
- Un `409` de conflicto no se resuelve sobrescribiendo: se compara `occurred_at` y se escala.

## Reglas de negocio offline

- El QR se valida contra la lista nominal descargada y vigente; si la lista está vencida, se bloquea
  el abordaje y se pide sincronización.
- El cero sobrecupo (RN-02) se valida localmente contra la capacidad y la lista.
- No se permite crear paradas ni alterar la ruta offline (RN-06).
- No se hace geolocalización continua del móvil (RNF-07); la telemetría viene del vehículo.

## Pruebas obligatorias

- [ ] Evento creado sin red y enviado 6 horas después: `occurred_at` intacto.
- [ ] Reintento con la misma `idempotencyKey`: no duplica.
- [ ] Cierre y reapertura de la app: la cola persiste.
- [ ] Evento rechazado: queda en cuarentena y se avisa; no se borra.
- [ ] Dos eventos en orden: se envían en FIFO.
