# AGENTS.md: apps móviles (`apps/monitora` y `apps/acudiente`)

Estas reglas aplican únicamente a `apps/monitora` y `apps/acudiente`. No aplican
a `apps/portal`, que tiene su propia guía en
[`apps/portal/AGENTS.md`](./portal/AGENTS.md). Complementa las reglas compartidas
de [`AGENTS.md`](../AGENTS.md); si una issue contradice una regla y no hay
excepción documentada, **detente y pregunta**.

## 1. Stack y versiones

- Node 20 (`.nvmrc`), pnpm 10 (`packageManager: pnpm@10.17.1`).
- Expo `~52`, React Native `0.76.3`, React `18.3.1`, `expo-dev-client` (se usa
  **development build**, no Expo Go).
- TypeScript con `strict` y `noUncheckedIndexedAccess`
  (`packages/config/tsconfig.base.json`).
- Instala dependencias nativas de Expo con `npx expo install <paquete>` (elige la
  versión compatible con el SDK).

## 2. Comandos móviles

```bash
pnpm --filter monitora dev         # Metro en http://localhost:8082
pnpm --filter acudiente dev        # Metro en http://localhost:8083
pnpm --filter monitora android     # compila y abre en el emulador de Android
pnpm --filter acudiente android
```

## 3. Reglas de producto móvil (del SRS)

- **Sin datos de pagos o mora en las apps móviles** y ningún bloqueo de abordaje
  por deuda (RN-05, RF-15).
- **Capacidad:** no existe ningún botón ni gesto para sobrepasar el tope del bus
  (RN-02).
- **Rutas y paradas inmutables en marcha:** monitoras y conductores no crean ni
  mueven paradas (RN-06).
- **Alerta legal bloqueante:** si hay restricción de custodia, la entrega queda
  deshabilitada hasta leer el protocolo (RN-04).
- **Mapa del acudiente:** solo el bus del propio hijo, y solo mientras esté "a
  bordo" (RN-07).
- **Sin chat abierto** entre acudientes y tripulación (HU-12).
- **Alertas críticas no se pueden silenciar** (HU-20).
- **Privacidad:** nunca registres (`console.log`, logs de red, reportes de error)
  cuerpos con datos personales de menores, documentos, fotos o teléfonos. Las
  fotos de autorizados solo se ven en el visor seguro de la app, con la captura
  de pantalla bloqueada.

## 4. Diseño: Figma → SVG → React Native

- Antes de tocar una pantalla, lee [`docs/design/README.md`](../docs/design/README.md):
  explica cómo interpretar el enlace de Figma, cómo exportar el frame y qué hacer
  si falta un asset. No interpretes un enlace sin los archivos exportados.
- Los logos e interfaces se diseñan en Figma y llegan como `.svg`. El componente
  resultante debe verse **idéntico** al diseño (medidas, colores, trazos,
  degradados).
- Los SVG viven en `packages/ui/src/svg/` con nombres en kebab-case
  (`logo-texto.svg`, `icon-qr-scan.svg`) y se importan como componentes. No dejes
  copias en las apps ni rasterices un logo o ilustración que exista como SVG.
- Usa `currentColor` solo en elementos que deban cambiar con el tema; conserva
  el resto de colores originales.
- Ejecuta `pnpm --filter @camino/ui svg:check` y corrige filtros, imágenes
  incrustadas y texto sin convertir a contornos.
- Colores, tipografías, radios y espaciados salen de los tokens de `packages/ui`,
  no de valores escritos en la pantalla.
- Si una interfaz se construye para ambas apps, impleméntala una sola vez en
  `@camino/ui`; las apps solo conectan sus datos, navegación y acciones. No
  dupliques componentes visuales entre `apps/acudiente` y `apps/monitora`.
- Elementos táctiles de **48 px mínimo** y alto contraste para exteriores
  (RNF-04).
- Si falta un asset, un dato o una decisión: aplica
  [`docs/design/README.md`](../docs/design/README.md) §8. **No inventes ni
  aproximes el diseño.** Un placeholder para compilar se marca con
  `// PROVISIONAL: falta <archivo>` y se declara en el PR.

## 5. Entorno móvil (Android)

- Variables en `.env.example`: `EXPO_PUBLIC_API_URL`,
  `EXPO_PUBLIC_SOCKET_URL`, `EXPO_PUBLIC_MAPLIBRE_STYLE_URL`.
- En el emulador de Android, `localhost` apunta al propio emulador. El backend en
  tu máquina se alcanza con **`10.0.2.2`**.
- MapLibre, la cámara y las notificaciones requieren development build
  (`pnpm --filter <app> android`), no Expo Go.
- React Native no trae `crypto`: para generar UUID usa el factory de
  `packages/domain` con un polyfill (`react-native-get-random-values` o
  `expo-crypto`).
- No uses `localStorage`. Evita APIs exclusivas del navegador.

### Abrir la app en el emulador

Con el emulador encendido y Metro corriendo, presiona `a` en la terminal de
Metro. Si el emulador no alcanza `10.0.2.2` (por ejemplo, por el firewall de
Windows), redirige los puertos con `adb reverse` y usa `localhost`:

```powershell
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
& $adb reverse tcp:8082 tcp:8082
& $adb reverse tcp:8083 tcp:8083
& $adb shell am start -a android.intent.action.VIEW -d "monitora://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8082" -p com.caminoseguro.monitora
& $adb shell am start -a android.intent.action.VIEW -d "acudiente://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8083" -p com.caminoseguro.acudiente
```

Si cambias de puerto, actualiza también los `adb reverse` y las URLs del dev
client.

### Metro y el monorepo

Cada app tiene su `metro.config.js`, que vigila la raíz del monorepo, resuelve
`node_modules` desde la app y desde la raíz, y activa los `exports` de
`package.json` para importar `@camino/contracts/<modulo>` por subrutas. No
dupliques esa configuración ni importes paquetes por ruta relativa.

Metro no vigila `android/` ni `ios/`: son carpetas nativas que genera
`expo prebuild` y sus archivos intermedios cambian mientras Gradle compila. En
Windows, vigilarlas bloquea el renombrado de workspaces de Gradle
(`AccessDeniedException`).

### Nota de compilación nativa

React Native `0.76.3` hace que Gradle resuelva Kotlin `1.9.24`, mientras el
template de Expo SDK 52 pide `1.9.25` para el compilador de Compose. Si
`expo run:android` falla con `Compose Compiler requires Kotlin version 1.9.25`,
compila indicando la versión que sí está en el classpath:

```bash
cd apps/monitora   # o apps/acudiente
./android/gradlew -p android app:assembleDebug -Pandroid.kotlinVersion=1.9.24
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Actualizar React Native queda fuera del alcance hasta que una issue lo pida.

## 6. Entrega específica de apps móviles

- Para toda pantalla nueva, compara el frame de Figma con el emulador y describe
  el resultado en el PR; no guardes capturas ni otros archivos en `specs/`.
- Si **no pudiste correr el emulador**, dilo explícitamente en el PR y marca qué
  quedó sin verificar visualmente. No afirmes que "se ve igual" sin haberlo
  comprobado.
