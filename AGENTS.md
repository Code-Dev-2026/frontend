# AGENTS.md — reglas compartidas del frontend

Reglas obligatorias para todo el monorepo ([`apps/portal/AGENTS.md`](./apps/portal/AGENTS.md) añade las reglas web del portal). Si una issue contradice estas reglas sin excepción documentada, detente y pregunta.

## Arquitectura

- Monorepo `pnpm` + Turborepo (`apps/monitora`, `apps/acudiente`, `apps/portal`, `packages/*`). Dependencias solo `apps/* → packages/*` vía `@camino/*` (nunca rutas relativas, cruces entre apps ni `packages/* → apps/*`).
- `packages/contracts`: única fuente de contratos HTTP, tipos, errores y mocks (MSW). Importa por módulo; no edites `src/generated/` a mano (edita `openapi.json` o Orval y corre `pnpm contracts:generate`).
- `packages/domain`: lógica y reglas de negocio (las apps consumen, no reimplementan).
- `packages/ui`: primitivas y vistas compartidas, sin lógica de negocio ni llamadas de red.

## Seguridad, privacidad e invariantes

- Prohibido registrar PII de menores, documentos, fotos o teléfonos en consola, logs o errores; prohibido guardar tokens/PII en `localStorage` o `sessionStorage`.
- Prohibido MQTT en frontend, geolocalización continua móvil y claves privadas/AWS en código. La UI nunca reemplaza la autorización del backend.
- Valida invariantes con `pnpm invariants` (cualquier `invariants-allow` requiere justificación en el PR).

## Decisiones abiertas (no resolver por tu cuenta)

Si tu tarea depende de alguna, detente y pregunta:

- **Autenticación:** backend devuelve tokens en JSON, pero el cliente compartido usa cookies (`credentials: include`) sin guardar tokens; falta alinear login, expiración y refresh/logout.
- **Tiempo real:** `packages/contracts/src/realtime-events.ts` está vacío (`SocketEventName = never`); falta contrato Socket.IO del backend.
- **Estados del estudiante:** `packages/domain` define `EN_CASA`, `A_BORDO_VEHICULO`, `EN_COLEGIO` y `RETORNO_SEDE_POR_FALLA_ENTREGA`; el SRS (§4) describe más estados.
- **Textos oficiales:** capacidad agotada y cupos ocasionales difieren entre el catálogo actual y el SRS.

## Apps móviles (`apps/monitora` y `apps/acudiente`)

Aplica solo a móviles (no a `apps/portal`):

- **Stack y entorno:** Expo `~52`, RN `0.76.3`, React `18.3.1`, `expo-dev-client` (development build para MapLibre, cámara y notificaciones); instala nativos con `npx expo install`. Emulador Android: host en `10.0.2.2` o `adb reverse` (`8082` monitora, `8083` acudiente). UUID con el factory de `@camino/domain` + polyfill (`react-native-get-random-values` / `expo-crypto`). No vigilar `android/` ni `ios/` en `metro.config.js`.
- **Workaround Android/Kotlin:** si `expo run:android` falla por Kotlin `1.9.25`, compila con `./android/gradlew -p android app:assembleDebug -Pandroid.kotlinVersion=1.9.24` e instala con `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.
- **Reglas SRS:** sin pagos/mora ni bloqueo por deuda (RN-05, RF-15); sin botón/gesto para exceder capacidad del bus (RN-02); rutas/paradas inmutables en marcha (RN-06); restricción de custodia bloquea entrega hasta leer protocolo (RN-04); mapa del acudiente solo muestra el bus de su hijo mientras esté "a bordo" (RN-07); sin chat abierto (HU-12); alertas críticas no silenciables (HU-20); fotos de autorizados solo en visor seguro sin capturas.
- **Diseño y entrega móvil:** flujo Figma en [`docs/design/README.md`](./docs/design/README.md), validar SVGs con `pnpm --filter @camino/ui svg:check`, táctiles ≥ **48 px** (RNF-04) y vistas compartidas una sola vez en `@camino/ui`. Compara pantallas nuevas en el emulador contra Figma (o decláralo en el PR si no se corrió).

## Documentación, entrega y validación

- **Documentación:** un solo documento canónico por tema (el resto enlaza); `README.md` solo en la raíz (procesos en `docs/` o issues); no documentes lo que ya expresan código, tipos, pruebas o CI.
- **Entorno y verificación:** Node 20 y pnpm 10 (`pnpm install --frozen-lockfile`). Antes de cerrar, ejecuta `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm invariants` y `pnpm verify` (más validaciones de la app).
- **Alcance y PR:** un PR por issue con Conventional Commits (qué se hizo, qué quedó fuera, decisiones y cómo verificar). Mantén el alcance, no reviertas cambios ajenos y no inventes assets/datos/decisiones faltantes (enuméralos y marca placeholders necesarios como provisionales).
