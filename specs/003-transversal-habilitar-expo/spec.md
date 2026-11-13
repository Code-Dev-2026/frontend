---
state: implementada
app: transversal
requirements: [RNF-03, RNF-04]
---

# FE-03 — Habilitar las apps Expo en el monorepo

## Contexto

`apps/monitora` y `apps/acudiente` existen como esqueleto (Expo `~52`, React Native
`0.76.3`) pero no están configuradas para el monorepo: faltan `.npmrc`,
`metro.config.js`, `babel.config.js` e `index.js`. Metro no resuelve
`@camino/contracts` por subrutas y el punto de entrada no arranca con
`registerRootComponent`.

Esta issue es de tooling: no agrega pantallas ni lógica de negocio. Habilita el
build móvil, prerequisito de RNF-03 (la operación depende de que la app abra) y
RNF-04 (usabilidad móvil: no se puede validar una interfaz que no compila).

## Objetivo

Dejar ambas apps móviles ejecutables en el emulador Android dentro del monorepo
pnpm + Turborepo, con Metro resolviendo los paquetes `@camino/*` y con la URL del
backend apuntando al host del emulador (`10.0.2.2`).

## Alcance

### Incluye

- `.npmrc` en la raíz con linker de pnpm explícito (`isolated`; ver
  "Decisiones y desviaciones").
- `metro.config.js` por app: `watchFolders`, `nodeModulesPaths` y
  `unstable_enablePackageExports` para resolver las subrutas de `@camino/contracts`.
  También excluye `android/` e `ios/` del watcher para no interferir con Gradle.
- `babel.config.js` e `index.js` con `registerRootComponent`; `main` actualizado.
- Script `dev` en ambas apps para que `turbo run dev` las incluya.
- URL por defecto del backend para el emulador Android (`10.0.2.2`).
- Documentación en `README.md` para levantar cada app.
- Regeneración de `pnpm-lock.yaml`.

### No incluye

- Actualizar Expo ni React Native.
- Tocar `apps/portal`.
- Endpoints nuevos, FCM/SMS reales, cálculo de rutas o ETA, cartera, reportes
  PDF/Excel ni Portal Web.
- Pantallas, navegación o assets de diseño (guía móvil en `apps/AGENTS.md`).

## Criterios de aceptación

- [x] `.npmrc` con linker explícito (`isolated`, ver desviación documentada).
- [x] Metro con `watchFolders`, `nodeModulesPaths` y `exports` de `package.json`
      activado.
- [x] Punto de entrada con `registerRootComponent` que funciona en monorepo.
- [x] Un solo React para las apps móviles (`18.3.1`); el portal (`19.0.0`) no
      interfiere.
- [x] Script `dev` en ambas apps.
- [x] URL por defecto del backend con `10.0.2.2` en Android.
- [x] Ambas apps abren en el emulador y muestran `App.tsx`; importan
      `@camino/contracts` sin errores de Metro.

## Decisiones y desviaciones

### Linker de pnpm: `isolated` en lugar de `hoisted`

La issue pide `node-linker=hoisted` (guía de Expo SDK 52). Se probó y **rompe
`apps/portal`**: el portal usa React `19.0.0` y las apps móviles `18.3.1`. Con
`hoisted`, pnpm deja una copia de React dentro de `apps/portal/node_modules`
mientras `react-dom` resuelve otra copia del store; `next build` falla con
`Cannot read properties of null (reading 'useContext')` al prerenderizar `/404`.
Se probaron también `public-hoist-pattern[]=!react` y fijar React 19 en la raíz:
el primero rompe los enlaces de `next` y el segundo vuelve a duplicar React.

Con `node-linker=isolated` (valor por defecto de pnpm) cada versión tiene una
sola copia física enlazada por junction: el portal compila y el bundle de Metro
de la app móvil contiene una única copia de React `18.3.1`. Se documenta en
`.npmrc` y requiere aprobación por apartarse de un criterio literal de la issue.

### Identificadores nativos

`expo prebuild` no puede escribir en un `app.config.ts` dinámico, así que se
declaran `android.package` e `ios.bundleIdentifier`
(`com.caminoseguro.monitora` y `com.caminoseguro.acudiente`, este último ya lo
usaba el proyecto nativo de acudiente).

### `babel-preset-expo`

Se declara como `devDependency` de cada app para que Babel lo resuelva sin
depender del hoisting de pnpm.

## Riesgos y supuestos

- **Linker aislado:** se aparta del `hoisted` que pide la issue porque el
  hoisted duplica React y rompe el build del portal. Requiere aprobación.
- **React duplicado:** el portal usa React `19.0.0` y las apps móviles `18.3.1`.
  Con el linker aislado cada versión conserva una sola copia física y Metro solo
  ve la de la app.
- **Sin emulador disponible:** si el entorno no permite levantar Android, la
  verificación visual queda pendiente y se declara en el PR (guía móvil en
  `apps/AGENTS.md`).

## Referencias

- Issue FE-03.
- `apps/AGENTS.md`, secciones 2, 4, 5 y 6.
- `docs/srs.md`, sección A.3 (stack de frontend) y RNF-03/RNF-04.
