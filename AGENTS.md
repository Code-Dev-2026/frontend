# Frontend Harness — Camino Seguro

## Fuente de verdad

El **SRS** (`docs/backend-ref/srs.md`) define el **QUÉ**; los **ADR** (`docs/adr/`) y `docs/architecture.md` definen el **CÓMO** ya decidido; el `README.md` describe lo implementado y **no es normativo**. Ninguna divergencia se cierra eligiendo una fuente: ver `docs/adr/0005-fuente-de-verdad-y-precedencia.md`.

## Principios

Los 6 principios innegociables están en `docs/constitution.md`. Si hay conflicto, manda la constitución.

## Reglas inviolables

- RNF-01 y RNF-02: no se guardan tokens, credenciales ni datos personales en `localStorage`/`sessionStorage`.
- RNF-07: no se instala rastreo ni geolocalización continua en móviles; la telemetría nace del vehículo.
- RNF-09: no se permite descargar, capturar ni compartir imágenes de menores.
- RNF-08: los eventos de custodia y las alertas legales no se mutan ni se borran.
- No se usa MQTT en clientes frontend; el tiempo real es Socket.IO.
- El contrato backend↔frontend se valida con `docs/contrato-backend-frontend.md`.
- No se implementa nada que no esté trazado a `RF/RNF/RN/HU` del SRS.

## Flujo SDD

`specs/NNN-<app>-<feature>/` con `spec.md` → `plan.md` → `tasks.md` → `evidence/`.
Ningún cambio de código sin spec aprobada. Usa `/feature` o los comandos `/sdd-*`.
La IA ejecuta; el responsable aprueba cada fase. La IA nunca hace merge.

## Agentes

`coordinator` orquesta; `planner` escribe specs/planes; `implementer` es el único que edita código; `reviewer` revisa en solo lectura.

## Comandos

- `pnpm install --frozen-lockfile`
- `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build`
- `node scripts/verify.mjs` (verificación completa)
- `node scripts/check-invariants.mjs` (invariantes y specs)
- `node scripts/sync-backend-ref.mjs --check` (espejo del SRS)

## Contexto operativo

`MEMORY.md` guarda decisiones, entorno y trampas conocidas. `docs/harness/README.md` indica qué documentos del arnés están vigentes.
