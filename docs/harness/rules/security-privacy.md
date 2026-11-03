# Regla de seguridad y privacidad

> **Documento heredado del backend: no normativo en el frontend.** Mandan `docs/constitution.md`,
> `docs/architecture.md`, `docs/adr/` y los skills de `.opencode/skills/`. Ver `docs/harness/README.md`.

## Fuente y mecanismo

- Regla canónica: `README.md`, `SECURITY.md`, `db/migrations/V001__init_extensions_and_roles.sql`.
- Mecanismo: `check-invariants.sh`, `check-no-secrets.sh` y revisiones de seguridad.

## Reglas

1. OWASP ASVS L2 y Ley 1581 de 2012.
2. Cifrado de datos sensibles con formato `key_version:iv:tag:ciphertext` usando AES-256-GCM.
3. Búsquedas exactas con blind index `HMAC-SHA256`.
4. Nunca registrar secretos, tokens o documentos sensibles en logs.
5. `.env` y `.env.*` no se leen ni se editan por agentes.
6. El `security-reviewer` es de solo lectura.

## Requisitos SRS

- RF-19, RF-20, RNF-02, RNF-08, RN-05.
