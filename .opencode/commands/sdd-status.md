---
description: Muestra el estado de las specs, artefactos faltantes y bloqueos
agent: planner
---

Revisa `specs/` y reporta el estado real. **No edites nada.**

Para cada carpeta `specs/NNN-*` (ignora `_template`):

| Spec | App | Estado | spec | plan | tasks | evidence | Requisitos | Bloqueo |
| :--- | :-- | :----- | :--- | :--- | :---- | :------- | :--------- | :------ |

Reglas:

- Valida que `spec.md` tenga `state`, `app` y al menos un `RF/RNF/RN/HU` que exista en `docs/backend-ref/srs.md`.
- Marca como bloqueante: estado `borrador` con código ya escrito, requisito inexistente, o evidencia ausente en `verificada`.
- Al final, indica cuál es la siguiente acción concreta y qué decisión humana falta.

Argumentos opcionales (filtro por app o texto): $ARGUMENTS
