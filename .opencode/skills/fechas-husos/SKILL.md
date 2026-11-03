---
name: Fechas, husos y eventos
description: Manejo de fechas en America/Bogota, UTC, ocurrencia vs envío, cortes de cartera y pruebas con reloj fijo.
---

# Fechas, husos y eventos

## Regla base

- Se **almacena y transporta** en UTC ISO 8601 (`2026-11-03T12:05:00.000Z`).
- Se **muestra** en `America/Bogota` (UTC-5, sin horario de verano).
- Las fechas de calendario (día escolar, corte de cartera) son `YYYY-MM-DD`, no instantes.
- La zona se fija explícitamente; nunca se depende de la zona del dispositivo.

## Hora del evento vs hora de envío (SRS A.7.2)

Todo evento lleva dos marcas:

| Campo         | Qué significa                | Uso                                        |
| :------------ | :--------------------------- | :----------------------------------------- |
| `occurred_at` | cuándo ocurrió el hecho      | auditoría, push diferido, orden de eventos |
| `sent_at`     | cuándo salió del dispositivo | diagnóstico de red, métricas               |

Una notificación enviada tarde muestra la **hora del evento**, nunca la de envío.
La cola offline conserva `occurred_at` y no lo reescribe al reintentar.

## Cartera (RF-15, RN-05)

- Los cortes se calculan en `America/Bogota`, no en UTC.
- Un pago registrado a las 23:30 del 30 vence el 30, aunque en UTC sea el 31.
- No se bloquea el abordaje por mora (RN-05); la fecha nunca cambia el estado de custodia.

## Pruebas

- Inyectar un reloj (`now: () => Date`) en lugar de llamar `Date.now()` dentro de la lógica.
- Probar el cruce de medianoche en Bogotá y el cambio de día UTC.
- Probar un evento encolado que se envía 6 horas después: `occurred_at` no cambia.

## Errores frecuentes

- Usar `new Date('2026-11-03')` y esperar medianoche local (interpreta UTC).
- Formatear con la zona del dispositivo.
- Guardar `sent_at` en el campo que la UI muestra como hora del evento.
- Comparar fechas como texto sin normalizar.
