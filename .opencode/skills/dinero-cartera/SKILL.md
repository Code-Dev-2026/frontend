---
name: Dinero y cartera
description: Montos en COP sin flotantes, cortes en America/Bogota, inmunidad operativa por mora, roles y auditoría (RF-15, RN-05).
---

# Dinero y cartera

## Regla de oro (RF-15, RN-05)

**Ningún estudiante es rechazado, bajado ni abandonado por mora.** La cartera vive en oficinas
administrativas; el estado de pago **nunca** bloquea el abordaje ni cambia el estado de custodia.

## Montos

- Moneda: COP. Se representa como **entero** en pesos (COP no usa decimales en la práctica).
- Prohibido `number` con decimales para dinero; prohibido `parseFloat` para sumar.
- Si se necesita precisión futura, se usa una librería decimal, nunca aritmética binaria.
- Formato de presentación: `$ 1.234.567` (separador de miles, sin decimales), en `es-CO`.
- Los montos que llegan del backend se validan como enteros no negativos.

## Cortes y fechas

- El corte se calcula en `America/Bogota` (ver skill `fechas-husos`).
- Un pago de las 23:30 del día 30 aplica al día 30, no al 31.
- Se guarda `occurred_at` del pago y `sent_at` de la confirmación.

## Roles

- `ADMINISTRADOR_CARTERA`: único rol que ve y edita cartera.
- `ACUDIENTE`: ve solo los pagos de sus hijos.
- Coordinación, monitora y conductor: **no** ven cartera.

## Operaciones

- Registrar pago: idempotente por clave; un reintento no duplica el abono.
- Anular pago: no se borra; se registra un movimiento de reversa con motivo y auditoría.
- Ajustes y condonaciones: requieren rol administrativo y quedan auditados.
- Nunca se almacenan datos de tarjeta; el cobro con tarjeta ocurre fuera del alcance (PCI).

## UI

- No se muestra saldo ni mora en la pantalla de custodia o abordaje.
- Un saldo pendiente no cambia el color ni el flujo del viaje.
- Los mensajes de cobro son informativos y no bloquean acciones operativas.

## Checklist

- [ ] ¿El monto es entero en COP?
- [ ] ¿El corte usa `America/Bogota`?
- [ ] ¿El pago es idempotente?
- [ ] ¿La mora no bloquea el abordaje?
- [ ] ¿Solo cartera y el acudiente ven el dinero?
- [ ] ¿La reversa es un movimiento nuevo, no un borrado?
