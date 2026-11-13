# Tareas — FE-03 Habilitar las apps Expo en el monorepo

- [x] Crear `specs/003-transversal-habilitar-expo/spec.md`.
- [x] Crear `.npmrc` en la raíz y regenerar `pnpm-lock.yaml`.
- [x] Crear `metro.config.js` en cada app (`watchFolders`, `nodeModulesPaths`, `exports`, `blockList`).
- [x] Crear `babel.config.js` e `index.js` con `registerRootComponent`; actualizar `main` en `package.json`.
- [x] Añadir script `dev` en ambas apps y actualizar `.env.example`.
- [x] Documentar en `README.md` los pasos para levantar cada app.
- [x] Correr `pnpm install --frozen-lockfile`, `expo-doctor` y la verificación base.
- [x] Abrir ambas apps en el emulador (`pnpm --filter monitora android`, `pnpm --filter acudiente android`).
