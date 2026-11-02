# Regla de arquitectura

## Fuente y mecanismo

- Regla canónica: `README.md` y el diseño hexagonal del backend.
- Mecanismo: límites de capas, `check-invariants.sh` y verificación de imports.

## Reglas

1. El núcleo de dominio y aplicación no conoce `typeorm`, `pg`, `firebase-admin`, `socket.io` ni `mqtt`.
2. Los puertos de entrada: `IAuthUseCase`, `ICustodyLifecycleUseCase`, `ITelemetryIngestUseCase`, `INotificationDispatchUseCase`.
3. Los puertos de salida: `ICustodyRepositoryPort`, `IGpsRepositoryPort`, `IChainAuditPort`, `IKeyVaultCryptoPort`, `IPushNotificationPort`.
4. La capa `domain` y `application` se mantiene desacoplada del framework.
5. Adoptar SOLID y DDD ligero.

## Requisitos SRS

- RF-01 a RF-20, RNF-01 a RNF-09, vario soporte del stack.
