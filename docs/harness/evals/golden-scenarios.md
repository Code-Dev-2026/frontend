# Escenarios dorados del harness

Cada escenario debe quedar como prueba verificable antes de cerrar una spec. Los datos de prueba
son ficticios.

| Escenario                         | Entrada                        | Resultado esperado                      | Regla protegida               |
| :-------------------------------- | :----------------------------- | :-------------------------------------- | :---------------------------- |
| QR de otra ruta                   | QR no asociado al viaje        | Denegado                                | Integridad de ruta y custodia |
| Pasajero N+1                      | Aforo saturado                 | Rechazo con `DENEGADO_SOBRECUPO`        | RN-02                         |
| Entrega con alerta judicial       | Receptor con orden activa      | Bloqueo inmediato                       | RN-04 / Ley 1581              |
| Cuarto autorizado                 | Cuarto adulto sin autorización | Denegado                                | Máximo 3 autorizados          |
| Acudiente ajeno                   | Consulta de un menor no propio | `403` sin revelar existencia            | RNF-02 / IDOR                 |
| Telemetría tras descenso          | Mapa pedido en `EN_COLEGIO`    | Acceso restringido                      | RN-07 / RNF-07                |
| Mora intentando bloquear abordaje | Saldo pendiente                | Abordaje no bloqueado                   | RF-15 / RN-05                 |
| Reutilización de refresh token    | Mismo `family_id` reusado      | Rechazo y revocación                    | Auth robusta                  |
| Evento offline de custodia        | 6 h sin red y reintento        | Se envía una vez, `occurred_at` intacto | RNF-06 / RNF-08               |
| Push diferido                     | Notificación enviada tarde     | Muestra la hora del evento              | SRS A.7.2                     |
| Captura de pantalla iOS           | Intento de captura             | Mitigado y detectado, no "imposible"    | RNF-09 / A.7.5                |

## Mecanismo de comprobación

- Vitest en `packages/domain` y `apps/portal` para la lógica pura y las denegaciones.
- Pruebas de integración contra un backend simulado o contrato validado con Zod.
- `node scripts/check-invariants.mjs` para las reglas estáticas (storage, MQTT, geolocalización).
- Un escenario sin implementación se marca como pendiente en `tasks.md`; no se inventa la prueba.
