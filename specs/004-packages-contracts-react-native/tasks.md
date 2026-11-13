# Tareas FE-04

- [x] Configurar `idempotencyKeyFactory` con UUID v7 en ambas apps y añadir
      polyfills de crypto y URL.
- [x] Añadir provider y selector de entorno mock/API real en ambas apps.
- [x] Habilitar MSW nativo y un mock de capacidad agotada para la demo.
- [x] Definir tipos de eventos provisionales y simulador compartido.
- [x] Añadir `ApiErrorMessage` en ambas apps y demo de endpoint en Monitora.
- [x] Documentar cliente y encabezado `X-Idempotency-Key`.
- [x] Exportar los bundles Android de ambas apps con Metro.
- [ ] Guardar sesión mediante `expo-secure-store`; JWT fue elegido, pero faltan
      payload de login, expiración y contrato de refresh/logout del backend.
- [ ] Probar el comportamiento en emuladores Android; no se ejecutó en este
      entorno.
