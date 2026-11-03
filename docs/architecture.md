# Arquitectura del frontend

> El **CÓMO** decidido. El **QUÉ** está en `docs/backend-ref/srs.md`; la precedencia, en
> `docs/adr/0005-fuente-de-verdad-y-precedencia.md`.

## Forma del repositorio

Monorepo pnpm + Turborepo con dirección de dependencias **unidireccional**:

```text
apps/portal      apps/acudiente      apps/monitora
      \               |                  /
       +--------------+-----------------+
                      |
              packages/contracts  packages/domain  packages/ui
```

- `apps/*` consume `packages/*`; ningún paquete importa de una app.
- `packages/domain` es lógica pura: sin React, Expo, Next, `fetch`, `window` ni almacenamiento.
- `packages/contracts` contiene tipos y eventos; no contiene cliente HTTP con estado.
- `packages/ui` contiene primitivas visuales compartidas, sin reglas de negocio.

## Capas dentro de una app

```text
app/ o src/
├── app/          rutas y composición (Next) o pantallas (Expo)
├── features/     casos de uso por dominio (custodia, telemetría, cartera…)
├── lib/          adaptadores: HTTP, Socket.IO, almacenamiento seguro, reloj
└── components/   presentación sin acceso a datos
```

Regla: la UI no llama a la red directamente. Pasa por un caso de uso en `features/`, que usa un
adaptador en `lib/`. Así se puede probar sin red y cambiar el transporte sin tocar pantallas.

## Flujo de datos

1. La UI dispara una acción (`features/*`).
2. El caso de uso valida la entrada con Zod y aplica reglas de dominio (`packages/domain`).
3. El adaptador habla con el backend por HTTP o Socket.IO (`docs/contrato-backend-frontend.md`).
4. El estado del servidor se cachea con TanStack Query; el estado local de UI no se duplica.
5. Si no hay red, la operación entra a una cola FIFO persistente y se reintenta con backoff.

## Seguridad y privacidad

- Tokens en memoria o en almacenamiento seguro del dispositivo; **nunca** en `localStorage`,
  `sessionStorage` ni en el estado serializado de la URL.
- Toda respuesta se valida contra el contrato antes de renderizar; un error no muestra datos crudos.
- El mapa solo se muestra con el estudiante `A_BORDO_VEHICULO` (`shouldShowCustodyMap`).
- No se usa MQTT ni geolocalización continua del móvil (RNF-07).
- Imágenes de menores: sin descarga, captura ni compartición; en iOS se mitiga, no se garantiza (A.7.5).

## Offline y tiempo real

- Cola FIFO (`outbox`) con clave idempotente por evento; nunca se descarta un evento de custodia.
- Socket.IO es el único canal de tiempo real: `ruta:actualizada`, `alerta:judicial`,
  `notificacion:push`. El backend es la autoridad; el cliente reconciliación por `occurred_at`.
- La telemetría se renderiza con throttling; no se guarda historial completo en el cliente.

## Pruebas y verificación

- `packages/domain`: Vitest, pruebas puras de estados, topes y transiciones.
- `apps/portal`: Vitest para casos de uso y adaptadores; componentes solo si aportan una denegación.
- `apps/acudiente` y `apps/monitora`: sin runner hasta que una spec lo justifique.
- Puerta única local: `node scripts/verify.mjs`. Invariantes: `node scripts/check-invariants.mjs`.

## Decisiones relacionadas

- `docs/adr/0004-harness-multiagente.md`: gobernanza y permisos.
- `docs/adr/0005-fuente-de-verdad-y-precedencia.md`: qué documento manda.
- `docs/adr/0006-estados-canonicos-custodia.md`: 4 estados canónicos y su traducción desde el SRS.
