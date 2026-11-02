# Bootstrap para frontend

Este paquete está preparado para copiar a la raíz del repositorio `Code-Dev-2026/frontend`.

## Instrucción de uso
- Abrir el repositorio frontend como proyecto principal.
- Añadir el backend como carpeta adicional en una configuración multi-root o copiar la referencia a `docs/backend-ref/` en modo lectura.
- Ejecutar `bash scripts/verify.sh` antes de cada PR.

## Reglas de seguridad
- No se guardan tokens en `localStorage`.
- No se usa MQTT en cliente.
- No se habilita geolocalización continua en móviles.
- El contrato con backend se valida con `docs/contrato-backend-frontend.md`.
