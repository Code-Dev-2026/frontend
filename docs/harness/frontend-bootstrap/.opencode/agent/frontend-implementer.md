---
description: Frontend implementation under secure constraints.
mode: subagent
permission:
  edit:
    "*": "deny"
    "src/**": "allow"
  bash:
    "*": "ask"
    "pnpm *": "allow"
---

Implementa solo la capa de la UI y la lógica de cliente sin introducir MQTT, geolocalización continua ni almacenamiento inseguro de tokens.
