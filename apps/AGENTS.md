# AGENTS.md: apps móviles (`apps/monitora` y `apps/acudiente`)

Estas reglas aplican únicamente a `apps/monitora` y `apps/acudiente`. No aplican a `apps/portal`, que tiene su propia guía en `apps/portal/AGENTS.md`. Complementa las reglas compartidas de `../AGENTS.md`; si una issue contradice una regla y no hay excepción documentada, **detente y pregunta**.

## 1. Stack y versiones

- Node 20 (`.nvmrc`), pnpm 10 (`packageManager: pnpm@10.17.1`).
- Expo `~52`, React Native `0.76.3`, React `18.3.1`, `expo-dev-client` (se usa
  **development build**, no Expo Go).
- TypeScript con `strict` y `noUncheckedIndexedAccess` (`packages/config/tsconfig.base.json`).
- Instala dependencias nativas de Expo con `npx expo install <paquete>` (elige la versión compatible con el SDK).

## 2. Comandos móviles

```bash
pnpm --filter monitora android     # compila y abre la app en el emulador de Android
pnpm --filter acudiente android
```

## 3. Reglas de producto móvil (del SRS)

- **Sin datos de pagos o mora en las apps móviles** y ningún bloqueo de abordaje por deuda (RN-05, RF-15).
- **Capacidad:** no existe ningún botón ni gesto para sobrepasar el tope del bus (RN-02).
- **Rutas y paradas inmutables en marcha:** monitoras y conductores no crean ni mueven paradas (RN-06).
- **Alerta legal bloqueante:** si hay restricción de custodia, la entrega queda deshabilitada hasta leer el protocolo (RN-04).
- **Mapa del acudiente:** solo el bus del propio hijo, y solo mientras esté "a bordo" (RN-07).
- **Sin chat abierto** entre acudientes y tripulación (HU-12).
- **Alertas críticas no se pueden silenciar** (HU-20).
- **Privacidad:** nunca registres (`console.log`, logs de red, reportes de error) cuerpos con datos personales de menores, documentos, fotos o teléfonos. Las fotos de autorizados solo se ven en el visor seguro de la app, con la captura de pantalla bloqueada.

## 4. Flujo de diseño: Figma → SVG → componente de React Native

> Disponible una vez completada la issue FE-06. Antes de eso, no agregues SVG ni `react-native-svg` por tu cuenta.

- Los logos e interfaces se diseñan en Figma y llegan como `.svg`. El componente resultante debe verse **idéntico** al diseño (medidas, colores, trazos, degradados).
- Los SVG viven en `packages/ui/src/svg/` con nombres en kebab-case (`logo-texto.svg`, `icon-qr-scan.svg`) y se importan como componentes. No dejes copias en las apps.
- Nunca conviertas a PNG un logo o ilustración que exista como SVG.
- Usa `currentColor` solo en elementos que deban cambiar con el tema; conserva el resto de colores originales.
- Ejecuta `pnpm --filter @camino/ui svg:check` y corrige filtros, imágenes incrustadas y texto sin convertir a contornos.
- Colores, tipografías, radios y espaciados salen de los tokens de `packages/ui`, no de valores escritos en la pantalla.
- Elementos táctiles de **48 px mínimo** y alto contraste para exteriores (RNF-04).
- Las referencias de diseño de cada pantalla están en `docs/design/<app>/<pantalla>/` (captura del frame + SVG + textos). Si no existen, aplica la sección 7.1: **detente y pide el asset; no inventes el diseño.**

## 4.1 Cuando falta un asset, un dato o una decisión

Antes de escribir código de una pantalla, verifica que existan todos los archivos listados en el bloque **"Assets listos"** de la issue (por ejemplo `docs/design/base/login/login.png`, `textos.md` y los SVG indicados).

**Falta algo que define cómo se ve o qué dice la pantalla** (un frame, un SVG de logo o icono, los textos, los tokens, un estado como error o vacío):

1. **Detente.** No escribas código de esa pantalla ni "aproximes" el diseño con colores, tamaños o textos inventados.
2. Responde con una lista de lo que falta: ruta esperada de cada archivo y para qué se necesita.
3. **Espera** a que la persona lo agregue. Si la sesión es interactiva, pregunta y quédate esperando la respuesta.
4. Si estás trabajando **sin nadie presente** (tarea en segundo plano, programada o en CI) y no puedes preguntar: no avances con esa pantalla. Entrega solo lo que no depende del asset faltante, deja en el PR (o en el último mensaje) la lista de lo pendiente y termina.

**Falta solo un detalle menor** (un espaciado intermedio, un color de un estado secundario que el diseño no especifica): usa el token más cercano ya definido, no agregues valores nuevos y anótalo en el PR bajo "Decisiones tomadas".

**Falta un dato o una decisión de backend** (ver sección 6): avisa y espera; no la resuelvas por tu cuenta.

**Nunca:**

- Pegar un placeholder (cuadro gris, logo genérico, texto "Lorem ipsum") y presentarlo como terminado. Si usas un placeholder para poder compilar, márcalo con `// PROVISIONAL: falta <archivo>` y decláralo en el PR.
- Redibujar un SVG de Figma a mano ni usar un icono de librería en su lugar sin que la issue lo permita.
- Afirmar que la pantalla "se ve igual al diseño" si no tenías el frame para compararla.

## 5. Entorno móvil (Android)

- Variables en `.env.example`: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SOCKET_URL`, `EXPO_PUBLIC_MAPLIBRE_STYLE_URL`.
- En el emulador de Android, `localhost` apunta al propio emulador. El backend en tu máquina se alcanza con **`10.0.2.2`**.
- MapLibre, la cámara y las notificaciones requieren development build (`pnpm --filter <app> android`), no Expo Go.
- React Native no trae `crypto`: para generar UUID usa el factory de `packages/domain` con un polyfill (`react-native-get-random-values` o `expo-crypto`).
- No uses `localStorage`. Evita APIs exclusivas del navegador.

## 6. Decisiones abiertas: no las resuelvas por tu cuenta

Si tu tarea depende de alguna, avisa y espera instrucciones:

- **Autenticación:** el backend devuelve los tokens en el cuerpo JSON, pero el cliente compartido usa cookies (`credentials: include`) y no guarda tokens (ver `README.md`). Falta alinear el contrato.
- **Eventos en tiempo real:** `packages/contracts/src/realtime-events.ts` está vacío (`SocketEventName = never`); el backend aún no define el contrato de Socket.IO.
- **Estados del estudiante:** `packages/domain` usa `EN_CASA`, `A_BORDO_VEHICULO`, `EN_COLEGIO`, `RETORNO_SEDE_POR_FALLA_ENTREGA`; el SRS (sección 4) describe más estados.
- **Textos oficiales** de capacidad agotada y de cupos ocasionales (el catálogo actual difiere del SRS).

## 10. Entrega específica de apps móviles

- Para toda pantalla nueva, compara el frame de Figma con el emulador y describe el resultado en el PR; no guardes capturas ni otros archivos en `specs/`.
- Si **no pudiste correr el emulador**, dilo explícitamente en el PR y marca qué quedó sin verificar visualmente. No afirmes que "se ve igual" sin haberlo comprobado.
