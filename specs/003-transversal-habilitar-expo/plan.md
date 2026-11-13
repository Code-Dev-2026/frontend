# Plan — FE-03 Habilitar las apps Expo en el monorepo

## Enfoque

1. **Instalación.** Crear `.npmrc` en la raíz. La issue pide
   `node-linker=hoisted` (guía de Expo SDK 52), pero con este monorepo rompe el
   build del portal: conviven React `18.3.1` (móvil) y `19.0.0` (portal), y el
   linker hoisted deja dos instancias de React para `next build`. Se usa
   `node-linker=isolated` (valor por defecto de pnpm) y se documenta la
   desviación en `spec.md` y en el PR.
2. **Metro.** Un `metro.config.js` por app que parte de `getDefaultConfig` y:
   - añade la raíz del monorepo a `watchFolders` sin descartar los defaults de
     Expo (los paquetes del workspace),
   - añade `apps/<app>/node_modules` y `<raíz>/node_modules` a
     `nodeModulesPaths`,
   - activa `resolver.unstable_enablePackageExports = true`, porque Metro 0.81
     (el que trae Expo SDK 52) lo deja apagado por defecto y `@camino/contracts`
     expone sus módulos por subrutas en `exports`.
3. **Babel.** `babel.config.js` con `babel-preset-expo`. Se declara
   `babel-preset-expo` como `devDependency` de cada app para no depender del
   hoisting de pnpm.
4. **Entrada.** `index.js` importa `App.tsx` y llama a `registerRootComponent`.
   `package.json` apunta `main` a `index.js`.
5. **Config nativa.** `app.config.ts` declara `android.package` e
   `ios.bundleIdentifier`; `expo prebuild` no puede escribir sobre un config
   dinámico y `expo run:android` los necesita.
6. **Scripts.** `dev` con `expo start --dev-client` en ambas apps para que
   `turbo run dev` las levante junto al portal.
7. **URL del backend.** Por defecto `http://10.0.2.2:3000/api/v1` y
   `http://10.0.2.2:3001` (host del emulador Android), sobrescribible con
   `EXPO_PUBLIC_*`. Se actualizan `app.config.ts`, `src/lib/api/index.ts` y
   `.env.example`.
8. **Documentación.** Sección en `README.md` con los pasos para levantar cada app
   y la nota de `10.0.2.2`.

## Archivos

| Acción    | Archivo                                                           |
| --------- | ----------------------------------------------------------------- |
| Crear     | `.npmrc`                                                          |
| Crear     | `apps/monitora/metro.config.js`, `apps/acudiente/metro.config.js` |
| Crear     | `apps/monitora/babel.config.js`, `apps/acudiente/babel.config.js` |
| Crear     | `apps/monitora/index.js`, `apps/acudiente/index.js`               |
| Crear     | `specs/003-transversal-habilitar-expo/{spec,plan,tasks}.md`       |
| Modificar | `apps/*/package.json` (`main`, `dev`, `babel-preset-expo`)        |
| Modificar | `apps/*/app.config.ts`, `apps/*/src/lib/api/index.ts`             |
| Modificar | `.env.example`, `README.md`, `pnpm-lock.yaml`                     |

## Decisiones tomadas

- **`node-linker=isolated` en `.npmrc`** en lugar de `hoisted`: el hoisted
  duplica React y rompe `next build` del portal. Ver `spec.md`.
- **`unstable_enablePackageExports = true` explícito** aunque el resto del
  monorepo no lo necesite: sin él Metro no resuelve `@camino/contracts/http`.
- **`watchFolders`/`nodeModulesPaths` se amplían, no se reemplazan**, porque
  Expo SDK 52 ya configura el monorepo y `expo-doctor` valida esos defaults.
- **`resolver.blockList` excluye `android/` e `ios/` del watcher**: en Windows
  Metro retenía handles sobre `android/.gradle` y Gradle fallaba al renombrar
  sus workspaces (`AccessDeniedException`). Excluirlos también acelera el
  bundler.
- **`babel-preset-expo` declarado por app** para que la resolución de Babel no
  dependa del hoisting.
- **`android.package` e `ios.bundleIdentifier`** para que `expo prebuild`
  funcione con un `app.config.ts` dinámico.
- **`10.0.2.2` como valor por defecto** en Android; para iOS/web se sobrescribe
  con `EXPO_PUBLIC_API_URL`/`EXPO_PUBLIC_SOCKET_URL`.

## Verificación

1. `pnpm install --frozen-lockfile`
2. `pnpm lint && pnpm typecheck && pnpm test`
3. `pnpm verify`
4. `npx expo-doctor` en cada app
5. Bundle de Metro que incluya `src/lib/api` (importa `@camino/contracts/*`) para
   comprobar la resolución de `exports`.
6. `pnpm --filter monitora android` y `pnpm --filter acudiente android` en el
   emulador; registrar el resultado en `tasks.md` sin generar archivos adicionales.

## Fuera de alcance

Navegación, pantallas, assets de Figma, autenticación y Socket.IO (decisiones
abiertas de la sección 6 de `apps/AGENTS.md`).
