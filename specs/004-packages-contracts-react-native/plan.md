# Plan FE-04

1. Reutilizar `createUuidV7` y habilitarlo en React Native mediante el paquete
   de dominio y el polyfill criptográfico.
2. Inicializar el cliente HTTP y MSW desde un provider por app, con modo
   configurable mediante `EXPO_PUBLIC_API_MODE`.
3. Mantener los contratos provisionales de tiempo real y el simulador en
   `@camino/contracts`; exponer adaptadores desde ambas apps.
4. Agregar el componente común de visualización de errores y la demo técnica
   de consumo de API en Monitora.
5. Validar tests, typecheck, lint e importación mediante Metro.
6. Esperar el contrato backend de FE-05 (payload JWT, expiración, refresh y
   logout) antes de añadir `expo-secure-store` o persistencia de autenticación.
