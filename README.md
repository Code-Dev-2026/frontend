# Camino Seguro — Frontend

Monorepo pnpm + Turborepo con tres aplicaciones y tres paquetes compartidos.

## Aplicaciones y paquetes

| Ruta                 | Qué es                                                                 |
| :------------------- | :--------------------------------------------------------------------- |
| `apps/portal`        | Portal web (Next.js 15.1, React 19, Tailwind).                         |
| `apps/acudiente`     | App móvil del acudiente (Expo 52, RN 0.76).                            |
| `apps/monitora`      | App móvil de la monitora (Expo 52, RN 0.76).                           |
| `packages/domain`    | Lógica pura: estados, transiciones y topes. Sin React/Expo/Next/fetch. |
| `packages/contracts` | Tipos, OpenAPI y eventos Socket.IO.                                    |
| `packages/ui`        | Primitivas visuales compartidas.                                       |

Dirección de dependencias: `apps/* → packages/*`. Nunca al revés.

## Requisitos

- Node 20 LTS (`.nvmrc` y CI); `engines` acepta `>=20 <23`.
- pnpm 10.17.1 (`packageManager`).

## Comandos

```bash
pnpm install --frozen-lockfile
pnpm lint · pnpm typecheck · pnpm test · pnpm build
node scripts/verify.mjs          # puerta única (lint, typecheck, test, build, invariantes, espejo)
node scripts/check-invariants.mjs
node scripts/sync-backend-ref.mjs --check
```

## Antes de cada PR

1. `node scripts/verify.mjs` en verde.
2. Spec aprobada en `specs/` si el cambio toca comportamiento.
3. Revisión del agente `reviewer` (la aprobación final es humana).

## Documentación

- **Qué** se construye: `docs/backend-ref/srs.md` (espejo de solo lectura de `backend/docs/srs.md`).
- **Cómo** se construye: `docs/adr/` y `docs/architecture.md`.
- **Reglas**: `AGENTS.md` y `docs/constitution.md`.
- **Precedencia**: `docs/adr/0005-fuente-de-verdad-y-precedencia.md`.
- **Specs**: `specs/README.md`.

Este README describe el estado del repositorio; no es normativo.

## Seguridad

- Sin tokens, credenciales ni datos personales en `localStorage`/`sessionStorage` (RNF-01, RNF-02).
- Sin MQTT en clientes: el tiempo real es Socket.IO.
- Sin geolocalización continua en móviles (RNF-07); la telemetría nace del vehículo.
- Sin descarga, captura ni compartición de imágenes de menores (RNF-09).
- Los eventos de custodia y las alertas legales no se mutan ni se borran (RNF-08).
- Datos de prueba siempre ficticios.
