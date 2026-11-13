# Camino Seguro — Frontend

Monorepo frontend de la plataforma Camino Seguro: una app por rol y paquetes
compartidos de dominio, contratos y UI.

## Estructura del repositorio

<!-- estructura:inicio -->

```text
frontend/
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ .husky/
│  ├─ commit-msg
│  └─ pre-commit
├─ apps/
│  ├─ acudiente/
│  │  ├─ app/
│  │  ├─ src/
│  │  ├─ app.config.ts
│  │  ├─ App.tsx
│  │  ├─ babel.config.js
│  │  ├─ declarations.d.ts
│  │  ├─ eslint.config.mjs
│  │  ├─ index.js
│  │  ├─ metro.config.js
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  ├─ monitora/
│  │  ├─ app/
│  │  ├─ src/
│  │  ├─ app.config.ts
│  │  ├─ App.tsx
│  │  ├─ babel.config.js
│  │  ├─ declarations.d.ts
│  │  ├─ eslint.config.mjs
│  │  ├─ index.js
│  │  ├─ metro.config.js
│  │  ├─ package.json
│  │  └─ tsconfig.json
│  ├─ portal/
│  │  ├─ app/
│  │  ├─ src/
│  │  ├─ AGENTS.md
│  │  ├─ eslint.config.mjs
│  │  ├─ next-env.d.ts
│  │  ├─ next.config.mjs
│  │  ├─ package.json
│  │  ├─ postcss.config.js
│  │  ├─ tailwind.config.ts
│  │  └─ tsconfig.json
│  └─ AGENTS.md
├─ docs/
│  ├─ design/
│  │  └─ README.md
│  └─ srs.md
├─ packages/
│  ├─ config/
│  │  ├─ eslint/
│  │  ├─ prettier/
│  │  ├─ typescript/
│  │  ├─ eslint.config.mjs
│  │  ├─ package.json
│  │  ├─ prettier.config.mjs
│  │  └─ tsconfig.base.json
│  ├─ contracts/
│  │  ├─ scripts/
│  │  ├─ src/
│  │  ├─ test/
│  │  ├─ eslint.config.mjs
│  │  ├─ openapi.json
│  │  ├─ orval.config.ts
│  │  ├─ package.json
│  │  ├─ README.md
│  │  └─ tsconfig.json
│  ├─ domain/
│  │  ├─ src/
│  │  ├─ eslint.config.mjs
│  │  ├─ package.json
│  │  ├─ tsconfig.json
│  │  └─ vitest.config.ts
│  └─ ui/
│     ├─ scripts/
│     ├─ src/
│     ├─ test/
│     ├─ eslint.config.mjs
│     ├─ package.json
│     ├─ svgo.config.js
│     └─ tsconfig.json
├─ scripts/
│  ├─ check-invariants.mjs
│  ├─ figma-export.mjs
│  ├─ sync-backend-ref.mjs
│  ├─ sync-readme-structure.mjs
│  └─ verify.mjs
├─ specs/
│  ├─ 003-transversal-habilitar-expo/
│  │  ├─ plan.md
│  │  ├─ spec.md
│  │  └─ tasks.md
│  ├─ 004-packages-contracts-react-native/
│  │  ├─ plan.md
│  │  ├─ spec.md
│  │  └─ tasks.md
│  └─ 006-packages-ui-pipeline-svg/
│     ├─ plan.md
│     ├─ spec.md
│     └─ tasks.md
├─ .editorconfig
├─ .env.example
├─ .gitattributes
├─ .gitignore
├─ .npmrc
├─ .nvmrc
├─ .prettierignore
├─ AGENTS.md
├─ commitlint.config.js
├─ eslint.config.mjs
├─ lint-staged.config.mjs
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ prettier.config.mjs
├─ README.md
└─ turbo.json
```

<!-- estructura:fin -->

> Este árbol se genera desde el índice de Git. No edites el bloque a mano:
> ejecuta `pnpm readme:sync` (o `pnpm readme:check` para validar).

## Apps y paquetes

- `apps/portal`: portal web (Next.js) para coordinación, rutas, matrículas y
  gestión operativa.
- `apps/acudiente`: app móvil (Expo) del acudiente para seguimiento y
  comunicación.
- `apps/monitora`: app móvil (Expo) de la monitora para abordaje, custodia y
  entregas.
- `packages/contracts`: clientes HTTP generados con Orval, modelos, `ApiError` y
  mocks MSW. Ver [`packages/contracts/README.md`](./packages/contracts/README.md).
- `packages/domain`: reglas de negocio puras, estados y validaciones.
- `packages/ui`: primitivas visuales reutilizables (React Native), sin lógica de
  negocio.
- `packages/config`: configuración compartida de TypeScript, ESLint y Prettier.

La dirección de dependencias es `apps/* → packages/*`. Nunca al revés.

## Stack base

- Node 20 (`.nvmrc`) y pnpm 10 (`.npmrc`).
- Turborepo y TypeScript estricto.
- Next.js 15 para el portal.
- Expo 52 + React Native 0.76.3 para las apps móviles; se usa **development
  build**, no Expo Go.

## Configuración inicial

```bash
pnpm install --frozen-lockfile
```

## Comandos

```bash
pnpm dev            # portal + Metro de ambas apps
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format         # escribe
pnpm format:check   # valida
pnpm invariants
pnpm verify         # pipeline completo
pnpm readme:sync    # regenera el árbol de este README
pnpm readme:check   # valida que el árbol esté sincronizado
```

## Levantar las apps

```bash
pnpm --filter portal dev       # http://localhost:3000
pnpm --filter monitora dev     # Metro en http://localhost:8082
pnpm --filter acudiente dev    # Metro en http://localhost:8083
pnpm --filter monitora android
pnpm --filter acudiente android
```

Los puertos de Metro son fijos para que ambas apps convivan sin chocar con el
`8081` por defecto de Expo. Para emulador, `adb reverse`, la URL `10.0.2.2` y la
compilación nativa, ver [`apps/AGENTS.md`](./apps/AGENTS.md) §5.

## Contratos con el backend

Los clientes se generan desde el snapshot versionado:

```bash
pnpm contracts:generate
```

Para sincronizar el snapshot desde el Swagger del backend:

```powershell
$env:BACKEND_OPENAPI_URL = "http://localhost:3000/api/v1/docs-json"
pnpm contracts:sync-openapi
Remove-Item Env:BACKEND_OPENAPI_URL
```

No edites `packages/contracts/src/generated` a mano: la CI regenera y falla si
hay diferencias. El login del backend devuelve los tokens en el cuerpo JSON,
pero el cliente compartido usa cookies y no persiste tokens; ese contrato sigue
pendiente de alinear (ver “Decisiones abiertas” en [`AGENTS.md`](./AGENTS.md)).

## Diseño (Figma)

Cada pantalla se construye desde un frame de Figma. El flujo completo —cómo leer
el enlace, exportar el frame, qué assets aporta el usuario y los criterios de
SVG— está en [`docs/design/README.md`](./docs/design/README.md). La referencia
de cada pantalla vive en `docs/design/<app>/<pantalla>/`.

## Calidad y CI

- ESLint y Prettier compartidos desde `packages/config`.
- Husky + lint-staged en `pre-commit`; Commitlint (Conventional Commits) en
  `commit-msg`.
- CI (`.github/workflows/ci.yml`): formato, árbol del README, generación de
  contratos, lint, typecheck, test, build e invariantes de arquitectura.
- `pnpm verify` ejecuta el mismo pipeline en local, más la comprobación del SRS.

## Convenciones de trabajo

- La lógica de negocio vive en `packages/domain`; no se reimplementa en las apps.
- Los contratos HTTP y los mocks salen solo de `packages/contracts` (`@camino/*`).
- La UI no depende de transporte ni infraestructura concreta.
- Mantén el repositorio pequeño y alineado con el SRS.

## Documentación

Las guías de trabajo por alcance son [`AGENTS.md`](./AGENTS.md) (raíz),
[`apps/AGENTS.md`](./apps/AGENTS.md) (móvil) y
[`apps/portal/AGENTS.md`](./apps/portal/AGENTS.md) (web). Regla: un tema tiene un
solo documento canónico y el resto enlaza; no se crean README por carpeta, app o
paquete.
