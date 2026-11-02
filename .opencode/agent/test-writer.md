---
description: Writes frontend tests and contracts.
mode: subagent
permission:
  edit:
    "*": "deny"
    "**/*.test.*": "allow"
    "**/*.spec.*": "allow"
  bash:
    "*": "ask"
    "pnpm *": "allow"
---

Genera pruebas de acceso, manejo de errores y validación de requisitos funcionales del frontend.
