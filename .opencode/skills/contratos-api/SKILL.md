---
name: Contratos API y tiempo real
description: Consumo del contrato backend-frontend, validación con Zod, Socket.IO, errores, idempotencia y prohibición de inventar endpoints.
---

# Contratos API y tiempo real

## Fuente

- `docs/contrato-backend-frontend.md` (canónico del backend, espejo de trabajo).
- `packages/contracts/openapi.json` y `packages/contracts/src/realtime-events.ts`.
- Si un endpoint o evento no está ahí, **no existe**: se pregunta, no se inventa.

## Endpoints vigentes

| Método | Ruta                          | Uso                                           |
| :----- | :---------------------------- | :-------------------------------------------- |
| `GET`  | `/api/v1/estudiantes/:id`     | datos autorizados por rol                     |
| `GET`  | `/api/v1/telemetria/:viajeId` | solo si el estudiante está `A_BORDO_VEHICULO` |
| `POST` | `/api/v1/custodia/abordaje`   | abordaje con aforo y estado                   |
| `POST` | `/api/v1/custodia/descenso`   | entrega con validaciones judiciales           |

## Eventos Socket.IO

`ruta:actualizada`, `alerta:judicial`, `notificacion:push`. **No se usa MQTT.**

- La suscripción se hace por sala autorizada, nunca por un `join` que elija el cliente.
- Al reconectar se vuelve a pedir el estado; no se asume que no se perdió nada.
- Un evento no reemplaza la verdad del servidor: se reconcilia por `occurred_at`.

## Validación

1. La respuesta se valida con Zod en el borde (`lib/`), no en el componente.
2. Si el contrato cambia, falla la validación y se muestra un error genérico; no se renderiza a medias.
3. Los tipos de `packages/contracts` se regeneran; no se editan a mano.

## Errores

- Se distingue red, autenticación, autorización, validación y servidor.
- Un `403` no revela si el recurso existe.
- No se reintenta un `4xx` salvo `429` con `Retry-After`.
- Los mensajes al usuario no incluyen `stack`, SQL ni identificadores internos.

## Idempotencia

- Cada mutación lleva una clave idempotente estable (UUID v7 generado en el cliente).
- Un reintento con la misma clave no duplica el evento.
- La clave se conserva en la cola offline.

## Checklist

- [ ] ¿El endpoint/evento está en el contrato?
- [ ] ¿La respuesta se valida antes de usarse?
- [ ] ¿El error no filtra datos?
- [ ] ¿La mutación es idempotente?
- [ ] ¿Se usa Socket.IO y no MQTT?
