# Discrepancias registradas

## 1) Node.js
- El README del backend define Node.js 20 LTS.
- El entorno local actual usa Node.js 22 para validación técnica, por lo que la arquitectura fija `.nvmrc` en 20 y documenta la compatibilidad declarada por el backend.

## 2) QR firmado
- El SRS anexo A menciona verificación criptográfica offline del QR.
- El backend y el README vigente no definen este mecanismo; por tanto se mantiene un puerto `QrVerifier` con implementación pendiente y sin cifrado de firma. Se debe integrar con el backend real cuando exista contrato.

## 3) Refresh token storage
- El backend define rotación y reutilización detectada por refresh token; el cliente no persiste tokens en `localStorage` y se deja el almacenamiento en memoria/cookie HttpOnly cuando el backend lo soporte.
- Si el backend no expone ese mecanismo, se declara decisión pendiente en la capa de autenticación.

## 4) Socket.IO
- El backend usa Socket.IO 4.x.
- La capa frontend declara los eventos como un tipo de contrato pendiente en `packages/contracts` hasta que el backend publique OpenAPI o los eventos reales.
