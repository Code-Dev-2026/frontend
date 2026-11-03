# failure-log

## Registro de fallos recurrentes

### 2026-11-03 — verificación imposible en Windows

- Agente: cualquiera que ejecutara `scripts/verify.sh`.
- Fallo: `bash` no está instalado (`WSL … execvpe(/bin/bash) failed`); la puerta de verificación
  local estaba rota aunque el repo estuviera bien.
- Acción: la verificación se movió a Node (`scripts/verify.mjs`, `scripts/check-invariants.mjs`).
  Los `.sh` quedan como envoltorios para CI.

### 2026-11-03 — dos verdades documentales

- Agente: cualquiera que leyera `docs/harness/discrepancias.md`.
- Fallo: decía "el README siempre gana", lo que permitía justificar desviaciones del SRS.
- Acción: ADR 0005 establece la precedencia y `AGENTS.md` la cita. La copia
  `docs/harness/frontend-bootstrap/` quedó marcada como obsoleta.

### 2026-11-03 — migración V1 → V2 de OpenCode

- Agente: los tres agentes V1 (`frontend-implementer`, `security-reviewer`, `test-writer`).
- Fallo: usaban `permission` y `bash`, y el implementer solo podía editar `src/**`, que no existe.
- Acción: se reemplazaron por `coordinator`, `planner`, `implementer` y `reviewer` en
  `.opencode/agents/` con `permissions` ordenadas y rutas reales (`apps/**`, `packages/**`).

## Histórico (backend)

### 2026-11-02

- Agente: `backend-implementer` (V1).
- Fallo: intento de editar migraciones existentes.
- Acción: regla mecánica reforzada en `AGENTS.md`, `opencode.json` y `check-invariants`.

### 2026-11-02

- Agente: `security-reviewer` (V1).
- Fallo: permisos demasiado amplios en la etapa de revisión.
- Acción: se elimina acceso a shell y edición; la regla queda en el agente `reviewer`.

### 2026-11-02

- Agente: `db-architect` (V1).
- Fallo: aproximación sin respetar la cadena de custodia.
- Acción: la tarea queda bajo `docs/harness/rules/custody.md` y validación SQL (`verify.sh`).
