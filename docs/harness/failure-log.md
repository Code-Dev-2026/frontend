# failure-log

## Registro de fallos recurrentes

### 2026-11-02

- Agente: `backend-implementer`
- Fallo: intento de editar migraciones existentes.
- Acción: regla mecánica reforzada en `AGENTS.md`, `opencode.json` y `check-invariants.sh`.

### 2026-11-02

- Agente: `security-reviewer`
- Fallo: permisos demasiado amplios en la etapa de revisión.
- Acción: se elimina acceso a bash y edición; la regla queda en `security-reviewer.md`.

### 2026-11-02

- Agente: `db-architect`
- Fallo: aproximación sin respectar la cadena de custodia.
- Acción: la tarea queda bajo `docs/harness/rules/custody.md` y validación SQL en `verify.sh`.
