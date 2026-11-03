# MEMORY — contexto operativo del frontend

Última actualización: 2026-11-03. No es normativo: registra hechos y decisiones para no repetir trabajo.

## Entorno

- Windows + PowerShell. **No hay `bash`**: los scripts locales son Node (`scripts/*.mjs`).
- Node 22.23.4 local; `engines` admite `>=20 <23`; `.nvmrc` y CI fijan 20.
- pnpm 10.17.1 + Turborepo 2.11.x. En CI, `pnpm install --frozen-lockfile` es obligatorio.
- `Get-FileHash` no está disponible; usar `[Security.Cryptography.SHA256]::Create()`.

## Decisiones vigentes

- SRS canónico: `backend/docs/srs.md`. Espejos de solo lectura: `docs/backend-ref/` (srs, er, trazabilidad, supuestos; hash en la cabecera).
- Precedencia: responsable > SRS (QUÉ) > ADR/architecture (CÓMO) > README (descriptivo) > `[SUPUESTO]` (ADR 0005).
- Estados canónicos: los 4 de la BD (`EN_CASA`, `A_BORDO_VEHICULO`, `EN_COLEGIO`, `RETORNO_SEDE_POR_FALLA_ENTREGA`). §4 del SRS se traduce (ADR 0006).
- 4 agentes: `coordinator`, `planner`, `implementer`, `reviewer`. Solo `implementer` edita código.
- Specs: `specs/NNN-<app>-<feature>/` con `spec.md`, `plan.md`, `tasks.md`, `evidence/`.
- Tiempo real: Socket.IO. MQTT prohibido en clientes frontend.
- Vitest solo en `packages/domain` y `apps/portal`. RN no tiene runner todavía.

## Superficie del monorepo

- `apps/portal`: Next 15.1, React 19, Tailwind.
- `apps/acudiente` y `apps/monitora`: Expo 52, RN 0.76.3, React 18.
- `packages/domain`: estados, transiciones y topes; sin React/Expo/Next/fetch.
- `packages/contracts`: OpenAPI y eventos; `packages/ui`: primitivas compartidas.
- Dirección permitida: `apps/* → packages/*`. Nunca al revés.

## Trampas conocidas

- El espejo `docs/backend-ref/` no se edita a mano: se regenera con `node scripts/sync-backend-ref.mjs`.
- `docs/backend-ref/` está en `.prettierignore` y fuera de `lint-staged`: si Prettier lo reformatea, `--check` reporta deriva falsa.
- El contrato backend↔frontend es canónico en `backend/docs/contrato-backend-frontend.md` y se consume como espejo en `docs/backend-ref/` (ADR 0008).
- `docs/harness/frontend-bootstrap/` es una copia obsoleta del arnés; no es fuente de verdad.
- Los docs restaurados del backend (`backend/docs/`) siguen sin commit: revisar `git status` antes de añadir.
- `.turbo` puede conservar caché de la ruta antigua; usar `pnpm exec turbo run <task> --force`.
- El SRS pide dependencias que aún no están instaladas (VisionCamera, op-sqlite, screen-capture, etc.): no se asumen; requieren spec y aprobación.
- RNF-09 solo es mitigable en iOS (A.7.5): el lenguaje debe ser "mitigar", no "bloquear al 100 %".
- El push diferido lleva `occurred_at` del evento, nunca `sent_at` (A.7.2).
- No hay `docs/srs.md` canónico en el frontend: la ruta es siempre `docs/backend-ref/srs.md`.
