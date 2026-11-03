---
name: Telemetría y mapa
description: Consumo de GPS del vehículo, Socket.IO, mapa visible solo a bordo, throttling, retención y privacidad (RN-07, RNF-05, RNF-08).
---

# Telemetría y mapa

## Datos

- El GPS nace del **hardware fijo del vehículo** (RNF-07); el móvil no trackea al conductor.
- Frecuencia de referencia: un punto cada 5 s por vehículo (SRS A.1).
- Cien vehículos ≈ 20 puntos/s: el cliente no puede re-renderizar por punto sin throttling.
- Partición mensual en la base (divergencia abierta con el SRS, sin impacto en frontend).

## Tiempo real

- Canal único: Socket.IO. **MQTT prohibido**.
- Evento `ruta:actualizada`; la sala la autoriza el servidor por rol y por estudiante.
- `alerta:judicial` tiene prioridad visual y no se silencia.
- `notificacion:push` puede llegar antes o después del evento: se reconcilia por `occurred_at`.

## Mapa

1. Solo se muestra con `A_BORDO_VEHICULO` (RN-07, `shouldShowCustodyMap`).
2. Al cambiar a `EN_COLEGIO`, `RETORNO_SEDE_POR_FALLA_ENTREGA` o `EN_CASA`, se apaga.
3. El acudiente ve solo a su hijo; coordinación ve la flota agregada.
4. No se guarda el historial completo en el cliente; se pide al backend si hace falta.
5. Se dibuja con throttling (máximo ~1 actualización por segundo) y se descartan puntos fuera de orden.

## Privacidad

- No se expone la posición del vehículo cuando el menor no está a bordo.
- No se comparte la ubicación con terceros ni se escribe en logs.
- Las capturas de pantalla del mapa para evidencia usan datos ficticios.
- No se usa geolocalización del dispositivo del acudiente para inferir nada.

## Rendimiento (RNF-05)

- Push de abordaje/entrega con latencia objetivo < 2.5 s en 4G/5G.
- Si el socket cae, se muestra "sin conexión" y se reintenta con backoff; no se finge tiempo real.
- El mapa no bloquea la UI: carga diferida y esqueleto mientras llega el primer punto.

## Checklist

- [ ] ¿El mapa está condicionado al estado canónico?
- [ ] ¿La sala la define el servidor?
- [ ] ¿Hay throttling y descarte de puntos viejos?
- [ ] ¿La alerta judicial no se silencia?
- [ ] ¿Se usa Socket.IO y no MQTT?
- [ ] ¿La telemetría viene del vehículo y no del móvil?
