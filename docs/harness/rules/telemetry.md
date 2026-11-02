# Regla de telemetría

## Fuente y mecanismo

- Regla canónica: `README.md`, `db/migrations/V005__trips_and_gps_partitions.sql`, `V007__notifications_and_offline_sync.sql`.
- Mecanismo: SQL de particiones, RLS y validación del flujo offline.

## Reglas

1. La telemetría GPS usa MQTT/TLS y se almacena con partición mensual.
2. El acceso del acudiente a GPS solo se permite cuando el estudiante está `A_BORDO_VEHICULO`.
3. Sin geolocalización continua en teléfonos de conductor/monitora; solo la infraestructura central recibe telemetría.
4. La sincronización offline usa UUIDv7 e idempotencia.
5. Los eventos de tiempo real se gestionan con Socket.IO 4.x.

## Requisitos SRS

- RF-09, RF-10, RF-18, RNF-05, RNF-07, RNF-09.
