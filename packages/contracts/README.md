# @camino/contracts

Este paquete contiene el cliente HTTP generado, el catálogo `ApiError` y los
mocks MSW. Las apps móviles deben importar operaciones y tipos generados desde
`@camino/contracts/<módulo>` y no declarar contratos HTTP propios.

## Cliente móvil

Las apps configuran el cliente con `EXPO_PUBLIC_API_URL` y el factory
`createUuidV7` de `@camino/domain`. Para cada mutación no relacionada con
autenticación, el cliente agrega `X-Idempotency-Key` y conserva el mismo valor
durante los reintentos. El encabezado lo genera el cliente: no se incluye en el
cuerpo ni debe registrarse junto con datos personales.

Se eligió autenticación JWT para FE-05, pero el OpenAPI actual no define el
cuerpo exitoso del login ni un endpoint de refresh. No persistas tokens hasta
que el backend documente esos campos, su expiración y el ciclo de renovación.

## Eventos en tiempo real

`realtime-events.ts` y `realtime-simulator.ts` contienen contratos y eventos
**PROVISIONALES** de demostración. Deben reemplazarse o alinearse cuando el
backend publique el contrato Socket.IO.
