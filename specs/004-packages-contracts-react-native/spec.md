---
state: en-revision
app: packages
requirements: [RNF-01, RF-10]
---

# FE-04 — Habilitar `packages/contracts` en React Native

## Contexto y objetivo

El cliente HTTP generado funciona en Node, pero las apps móviles necesitan
configurar polyfills, UUID v7 para idempotencia, mocks nativos y un punto único
de inicialización. La integración debe mantener los contratos y errores en
`@camino/contracts`, sin duplicarlos en las apps.

## Alcance

- Configurar el cliente móvil en ambas apps con URL configurable y
  `createUuidV7` de `@camino/domain`.
- Preparar polyfills para URL y generación aleatoria segura.
- Inicializar MSW nativo con un selector de entorno mock/API real.
- Definir tipos y un simulador de eventos Socket.IO marcados como
  **PROVISIONAL**.
- Añadir `ApiErrorMessage` y una pantalla de ejemplo que consuma el endpoint de
  abordaje y muestre `CAPACIDAD_AGOTADA` simulado.
- Documentar el encabezado `X-Idempotency-Key` y el uso móvil del paquete.

## Fuera de alcance

- Modificar `src/generated/`, añadir endpoints o definir contratos definitivos
  de Socket.IO.
- Persistir o renovar sesión: se eligió JWT para FE-05, pero el backend aún no
  documenta el payload del login, expiración ni refresh/logout.
- Incorporar el diseño de pantallas de producto, FCM/SMS reales, cálculo de
  rutas/ETA o funcionalidades del Portal Web.

## Criterios de aceptación

- Ambas apps pasan UUID v7 a `idempotencyKeyFactory`.
- Ambas apps pueden iniciar MSW nativo en modo `mock` y dejar pasar peticiones
  a la API cuando usan modo `real`.
- Los tipos de posición del bus y cambio de estado, y el simulador, están
  identificados como provisionales.
- `ApiErrorMessage` muestra el mensaje del catálogo sin exponer cuerpos de
  respuesta.
- La demo de Monitora consume el endpoint generado y representa el error
  `CAPACIDAD_AGOTADA` al usar mocks.
- La persistencia segura de sesión queda pendiente del contrato backend de
  JWT, expiración, refresh y logout.
