# Camino Seguro — Frontend

Base del monorepo frontend para la plataforma Camino Seguro. El repositorio se organiza por roles de usuario y por paquetes compartidos de dominio y contratos.

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
│  ├─ figma-svg.md
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

> Este árbol se genera automáticamente desde el índice de Git. No edites el
> bloque a mano: ejecuta `pnpm readme:sync` (o `pnpm readme:check` para validar).

## Qué contiene cada nivel

### `apps/portal`

Aplicación web para administración operativa: rutas, matrículas, expedientes, reportes y coordinación.

### `apps/acudiente`

Aplicación móvil para acudientes: seguimiento del recorrido, notificaciones y estado del menor.

### `apps/monitora`

Aplicación móvil para monitoras: asistencia, QR, custodia, entregas, alertas y trabajo offline.

### `packages/contracts`

Contratos con el backend: clientes HTTP generados con Orval desde el snapshot
real de Swagger en `packages/contracts/openapi.json`, modelos compartidos,
errores de dominio y mocks MSW separados por módulo. Para generarlos desde el
snapshot versionado:

```bash
pnpm contracts:generate
```

Para sincronizar el snapshot desde Swagger de NestJS y regenerar clientes,
inicia el backend y ejecuta:

```powershell
$env:BACKEND_OPENAPI_URL = "http://localhost:3000/api/v1/docs-json"
pnpm contracts:sync-openapi
Remove-Item Env:BACKEND_OPENAPI_URL
```

La CI regenera solo desde el snapshot para que el build sea determinista. El
Swagger actual expone 23 operaciones, pero omite esquemas de varios cuerpos y
respuestas; esos valores no se inventan en el cliente y deben documentarse en
el backend para obtener tipos más precisos.

El login del backend devuelve los tokens en el cuerpo JSON, mientras que el
cliente compartido envía cookies con `credentials: include` y no persiste
tokens. Alinear el contrato de autenticación con el backend antes de conectar
el flujo de inicio de sesión; el cliente no almacena ni registra credenciales.

No edites `packages/contracts/src/generated` a mano. CI regenera los clientes y
falla si el resultado no coincide con lo versionado; además ejecuta el
typecheck de las tres apps.

El portal, la app de acudientes y la de monitoras importan solo sus módulos
desde `@camino/contracts/<modulo>`. La página `/health` del portal consulta el
endpoint institucional real como ejemplo de consumo generado.

### `packages/domain`

Lógica de negocio: estados, validaciones, reglas de capacidad, restricciones y denegaciones.

### `packages/ui`

Primitivas visuales reutilizables para todas las apps.

### `packages/config`

Configuración base de TypeScript, linting y tooling compartido.

## Stack base

- Node 20 LTS
- pnpm 10
- Turborepo
- TypeScript
- Next.js para la app web
- Expo + React Native para apps móviles

## Configuración inicial

```bash
cd frontend
pnpm install --frozen-lockfile
```

## Levantar las apps móviles

`apps/monitora` y `apps/acudiente` usan Expo con **development build** (no Expo
Go): la cámara, MapLibre y las notificaciones requieren módulos nativos.

```bash
# 1. Dependencias del monorepo (linker aislado de pnpm, ver .npmrc)
pnpm install --frozen-lockfile

# 2. Portal web en http://localhost:3000
pnpm --filter portal dev

# 3. Metro de cada app en modo development build
pnpm --filter monitora dev    # http://localhost:8082
pnpm --filter acudiente dev   # http://localhost:8083

# 4. Compilar, instalar y abrir en el emulador Android
pnpm --filter monitora android
pnpm --filter acudiente android
```

`pnpm dev` (tarea `dev` de Turbo) levanta el portal y el Metro de las dos apps a
la vez. Los scripts fijan el puerto `8082` para monitora y `8083` para acudiente
para que ambos Metro convivan sin chocar entre sí ni con el `8081` que usa otro
proyecto Expo por defecto; el portal usa `3000`. Para diagnosticar el entorno de
una app: `pnpm --filter monitora doctor`.

### Abrir las apps en el emulador

Con el emulador encendido y los Metro corriendo, presiona `a` en la terminal de
cada Metro o abre la URL del development build. Si el emulador no alcanza
`10.0.2.2` (por ejemplo, por el firewall de Windows), redirige los puertos con
`adb reverse` y usa `localhost`:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb reverse tcp:8082 tcp:8082
& $adb reverse tcp:8083 tcp:8083
& $adb shell am start -a android.intent.action.VIEW -d "monitora://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8082" -p com.caminoseguro.monitora
& $adb shell am start -a android.intent.action.VIEW -d "acudiente://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8083" -p com.caminoseguro.acudiente
```

Si cambias de puerto, actualiza también los `adb reverse` y las URLs del dev
client.

### URL del backend en el emulador

El emulador Android ve la máquina anfitriona en `10.0.2.2`, no en `localhost`.
Por defecto ambas apps usan `http://10.0.2.2:3000/api/v1` y
`http://10.0.2.2:3001`; sobrescribe con `EXPO_PUBLIC_API_URL` y
`EXPO_PUBLIC_SOCKET_URL` (ver `.env.example`) para el simulador de iOS, un
dispositivo físico o un backend desplegado.

### Metro y el monorepo

Cada app tiene su `metro.config.js`, que vigila la raíz del monorepo, resuelve
`node_modules` desde la app y desde la raíz, y activa los `exports` de
`package.json` para que `@camino/contracts/<modulo>` se importe por subrutas. No
dupliques esa configuración ni importes paquetes por ruta relativa.

Metro no vigila `android/` ni `ios/`: son carpetas nativas que genera
`expo prebuild` y sus archivos intermedios cambian mientras Gradle compila. En
Windows, vigilarlas bloquea el renombrado de workspaces de Gradle
(`AccessDeniedException`).

### Nota de compilación nativa (Android)

React Native `0.76.3` (la versión que fija esta entrega; no se actualiza) hace
que Gradle resuelva Kotlin `1.9.24`, mientras el template de Expo SDK 52 pide
`1.9.25` para el compilador de Compose. Si `expo run:android` falla con
`Compose Compiler requires Kotlin version 1.9.25`, compila indicando la versión
que sí está en el classpath:

```bash
cd apps/monitora   # o apps/acudiente
./android/gradlew -p android app:assembleDebug -Pandroid.kotlinVersion=1.9.24
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Actualizar React Native a `0.76.9` (lo que sugiere `expo-doctor`) queda fuera
del alcance de FE-03.

## Referencias de diseño (Figma)

Cada pantalla se construye a partir de un frame de Figma. La referencia de cada
pantalla vive en `docs/design/<app>/<pantalla>/` (frame, SVG, textos y tokens);
la guía completa está en [`docs/design/README.md`](docs/design/README.md).

Para exportar un frame con un token personal de Figma (solo lectura):

```powershell
# Opción 1: archivo local ignorado por Git
Set-Content -NoNewline .figma-token "figd_..."
pnpm figma:export "<url-de-figma-con-node-id>" <app>/<pantalla>
Remove-Item .figma-token

# Opción 2: variable de entorno
$env:FIGMA_TOKEN = "figd_..."
pnpm figma:export "<url-de-figma-con-node-id>" <app>/<pantalla>
Remove-Item Env:FIGMA_TOKEN
```

El token nunca se escribe en el repositorio.

## Comandos básicos

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm format
pnpm format:check
pnpm readme:sync
pnpm readme:check
pnpm verify
```

## Calidad, hooks y CI/CD

- **ESLint**: configuración plana compartida en `packages/config/eslint.config.mjs`.
  Cada workspace la extiende con su propio `eslint.config.mjs`; el portal añade las
  reglas de Next.js.
- **Prettier**: configuración compartida en `packages/config/prettier.config.mjs`.
  `pnpm format` normaliza el repositorio y `pnpm format:check` valida sin escribir.
- **TypeScript**: `strict: true` y `noUncheckedIndexedAccess` en
  `packages/config/tsconfig.base.json`.
- **Husky + lint-staged**: `.husky/pre-commit` ejecuta ESLint y Prettier sobre los
  archivos en stage. `.husky/commit-msg` valida Conventional Commits con
  Commitlint.
- **Estructura del README**: `scripts/sync-readme-structure.mjs` reconstruye el
  árbol del repositorio entre los marcadores `<!-- estructura:inicio -->` y
  `<!-- estructura:fin -->`. `pnpm readme:sync` lo actualiza y
  `pnpm readme:check` (en CI y en el hook `pre-commit`) falla si quedó
  desactualizado.
- **GitHub Actions**: `.github/workflows/ci.yml` instala con
  `pnpm install --frozen-lockfile`, ejecuta formato, lint, typecheck, pruebas y
  build, y restaura la caché de Turborepo (`.turbo`) entre ejecuciones.
- **Verificación local completa**: `pnpm verify` ejecuta el mismo pipeline más los
  invariantes de arquitectura y la comprobación del espejo del backend.

## Convención de arquitectura

- Cada app está orientada a un rol o usuario concreto.
- Los paquetes compartidos resuelven dominio, contratos y UI.
- La lógica de negocio vive en `packages/domain` y no en la capa visual.
- La UI no debe depender de transporte ni infraestructura concreta.

## Cómo contribuir

1. Crear o trabajar dentro de la app correcta según el rol.
2. Mantener la lógica de negocio en `packages/domain`.
3. Usar `packages/contracts` para cualquier cambio de API o evento.
4. Reutilizar `packages/ui` en lugar de duplicar componentes.
5. Ejecutar lint, typecheck y tests antes de cerrar cambios.

## Estado actual

Este README representa la base técnica del repositorio y no un producto final cerrado. La intención es mantener una estructura clara y escalable para el frontend de Camino Seguro.

- `apps/portal`: portal web para coordinación, rutas, matrículas y gestión operativa.
- `apps/acudiente`: app móvil del acudiente para seguimiento y comunicación.
- `apps/monitora`: app móvil de la monitora para abordaje, custodia y entregas.
- `packages/contracts`: tipos, DTOs y eventos compartidos entre apps y backend.
- `packages/domain`: reglas de negocio, estados, transiciones y validaciones puras.
- `packages/ui`: componentes reutilizables sin lógica de negocio.
- `packages/config`: configuración centralizada de lint, TypeScript y tooling del monorepo.

La dirección de dependencias es: `apps/* -> packages/*`. Nunca al revés.

## Requisitos

- Node 20
- pnpm 10

## Convenciones de trabajo

- El frontend consume la API del backend; no la implementa.
- La lógica de negocio se centraliza en `packages/domain`.
- Los contratos se comparten desde `packages/contracts`.
- La UI no debe depender directamente de transporte ni infraestructura concreta.
- La base del proyecto debe mantenerse pequeña, clara y alineada con el SRS.
