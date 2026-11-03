> ESPEJO DE SOLO LECTURA — no editar aquí.
> Fuente: `Code-Dev-2026/backend` → `docs/contrato-backend-frontend.md` @ `9367a6d`
> SHA-256 del canónico: `cb24a1340b779119bbc1d8969658144dcea30d879981dc747c3a68284666bbe2`
> Se actualiza en el mismo PR que cambie el documento canónico.

---

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
- Todo cambio del modelo o de eventos debe pasar por el agente `reviewer` y por trazabilidad al SRS.

## Riesgos

- Exponer telemetría a un acudiente sin el estudiante a bordo.
- Fuga de datos de identidad o documentos.
- Generar eventos con estados no canónicos.
