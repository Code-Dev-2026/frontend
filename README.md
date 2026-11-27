# Camino Seguro — Frontend

Monorepo frontend de la plataforma Camino Seguro: una app por rol y paquetes compartidos de dominio, contratos y UI.

## Estructura del repositorio

<!-- estructura:inicio -->

```text
frontend/
├─ .github/
│  ├─ skills/
│  └─ workflows/
├─ .husky/
│  ├─ commit-msg
│  └─ pre-commit
├─ apps/
│  ├─ acudiente/
│  ├─ monitora/
│  └─ portal/
├─ docs/
│  └─ design/
├─ packages/
│  ├─ config/
│  ├─ contracts/
│  ├─ domain/
│  └─ ui/
├─ scripts/
│  ├─ check-invariants.mjs
│  ├─ figma-export.mjs
│  ├─ sync-backend-ref.mjs
│  ├─ sync-readme-structure.mjs
│  └─ verify.mjs
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

## Apps y paquetes

- **`apps/acudiente`**: App móvil (Expo 52 + React Native 0.76) para seguimiento y notificaciones de los acudientes.
- **`apps/monitora`**: App móvil (Expo 52 + React Native 0.76) para control de abordaje, custodia y entrega de estudiantes.
- **`apps/portal`**: Portal web administrativo (Next.js 15) para coordinación, gestión de rutas y flota.
- **`packages/ui`**: Componentes visuales y tokens reutilizables (`@camino/ui`).
- **`packages/domain`**: Reglas de negocio puras, validaciones y estados (`@camino/domain`).
- **`packages/contracts`**: Clientes HTTP tipados, contratos y mocks (`@camino/contracts`).
- **`packages/config`**: Configuraciones compartidas de ESLint, Prettier y TypeScript.

> **Regla de dependencias:** `apps/* → packages/*` (las apps consumen los paquetes compartidos, nunca al revés).

## Puesta en marcha

### 1. Instalación

```bash
pnpm install --frozen-lockfile
```

### 2. Levantar en desarrollo

```bash
# Levantar el entorno completo:
pnpm dev

# O levantar aplicaciones individuales:
pnpm --filter portal dev       # Portal web (http://localhost:3000)
pnpm --filter acudiente dev    # App acudiente (Metro en :8083)
pnpm --filter monitora dev     # App monitora (Metro en :8082)

# Abrir en emulador de Android (development build):
pnpm --filter acudiente android
pnpm --filter monitora android

# Vista rápida de interfaces en Expo Go (emulador, sin módulos nativos como MapLibre/cámara; presiona "a" al iniciar):
pnpm --filter acudiente exec expo start --go --port 8083
pnpm --filter monitora exec expo start --go --port 8082
```

### 3. Comandos de calidad y verificación

```bash
pnpm verify         # Pipeline completo (lint, typecheck, tests, build, invariantes)
pnpm lint           # Validación de ESLint
pnpm typecheck      # Validación de tipos con TypeScript
pnpm test           # Pruebas unitarias
pnpm format         # Formatear código con Prettier
```

## Diseño y Figma

Cada pantalla se traduce a componentes nativos siguiendo el flujo de 4 pasos (SVGs individuales, tokens de diseño y componentes en `@camino/ui`).
Consulta la guía completa en [`docs/design/README.md`](./docs/design/README.md).

## Documentación y guías

- [`AGENTS.md`](./AGENTS.md): Reglas generales del monorepo, apps móviles, seguridad e invariantes.
- [`apps/portal/AGENTS.md`](./apps/portal/AGENTS.md): Reglas específicas para el portal web (Next.js).
- [`docs/design/README.md`](./docs/design/README.md): Guía oficial de traducción de Figma a código.
