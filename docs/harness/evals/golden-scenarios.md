# Escenarios dorados del harness

Cada escenario debe quedar como prueba verificable antes de cerrar un requisito.

| Escenario                              | Entrada                                | Resultado esperado                      | Regla protegida               |
| -------------------------------------- | -------------------------------------- | --------------------------------------- | ----------------------------- |
| QR de otra ruta                        | QR no asociado a la ruta del viaje     | Denegado                                | Integridad de ruta y custodia |
| Pasajero N+1 con `DENEGADO_SOBRECUPO`  | Aforo saturado                         | Rechazo con código `DENEGADO_SOBRECUPO` | Capacidad nominal             |
| Entrega con alerta judicial            | Receptor con orden activa              | Bloqueo inmediato                       | Ley 1581 / custodia           |
| Cuarto autorizado rechazado            | cuarto adulto sin autorización vigente | Denegado                                | Máximo 3 autorizados          |
| Acudiente ajeno consultando estudiante | `app.current_user_id` distinto         | RLS bloquea consulta                    | IDOR y aislamiento            |
| Telemetría tras descenso               | GPS visto tras salida                  | Restricción del acceso                  | RNF-07 y RLS                  |
| UPDATE sobre `bitacora_auditoria`      | Modificación directa                   | Trigger bloquea la operación            | WORM                          |
| Mora intentando bloquear abordaje      | `billing` no expone estado de cartera  | Abordaje no bloqueado                   | RF-15                         |
| Reutilización de refresh token         | mismo token family_id reusado          | Rechazo                                 | Auth robusta                  |

## Mecanismo de comprobación

- SQL con pruebas automatizadas para cada caso.
- `scripts/run-evals.sh` marca el escenario como pendiente si aún no hay implementación, sin romper el pipeline.
