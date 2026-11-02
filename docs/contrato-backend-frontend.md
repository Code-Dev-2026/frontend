# Contrato backend ↔ frontend

## Propósito

Este contrato define el intercambio mínimo de información entre el backend y el frontend para que ambos proyectos puedan evolucionar sin romper la experiencia del usuario.

## Endpoints y eventos

- `GET /api/v1/estudiantes/:id` — datos autorizados por el usuario autenticado.
- `GET /api/v1/telemetria/:viajeId` — telemetría GPS solo cuando el estudiante está `A_BORDO_VEHICULO`.
- `POST /api/v1/custodia/abordaje` — registro de abordaje con validaciones de aforo y estados.
- `POST /api/v1/custodia/descenso` — entrega segura y validaciones judiciales.
- Socket.IO: `ruta:actualizada`, `alerta:judicial`, `notificacion:push`.

## Estados canónicos

Se toman los estados definidos en `db/migrations/V006__attendance_and_custody_lifecycle.sql`:

- `EN_CASA`
- `A_BORDO_VEHICULO`
- `EN_COLEGIO`
- `RETORNO_SEDE_POR_FALLA_ENTREGA`

## Reglas de revisión

- Los cambios de contrato requieren revisión de un dueño del backend y un dueño del frontend.
- Todo cambio del modelo o de eventos debe pasar por `security-reviewer` y trazabilidad.

## Riesgos

- Exponer telemetría a un acudiente sin el estudiante a bordo.
- Fuga de datos de identidad o documentos.
- Generar eventos con estados no canónicos.
