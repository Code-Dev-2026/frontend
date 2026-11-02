# Frontend Harness

## Fuente de verdad

La fuente de verdad es el README del backend del repositorio `Code-Dev-2026/backend`. Este paquete es un arranque seguro para que el repositorio frontend implemente su capa sin romper los principios del proyecto.

## Reglas inviolables

- RNF-04, RNF-07 y RNF-09: no se pueden guardar tokens en `localStorage`.
- No se usa MQTT en clientes frontend.
- No se hace geolocalización continua en móviles.
- El contrato backend↔frontend se valida con `docs/contrato-backend-frontend.md` del repositorio backend.
- El flujo de trabajo exige prueba, verificación y revisión antes de cerrar.

## Reglas de seguridad

- No se procesa ni se guarda información sensible en el navegador.
- Se exige validación de entradas y manejo de errores.
- Los datos de prueba deben ser ficticios.

## Comandos

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `bash scripts/verify.sh`
