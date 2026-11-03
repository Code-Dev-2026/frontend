# Progreso del harness

El estado vivo de las specs se obtiene con `/sdd-status` o con:

```bash
node scripts/check-invariants.mjs --specs-only
```

Este archivo ya no se mantiene a mano: la tabla de specs, sus estados y la evidencia están en
`specs/NNN-*/`. Duplicarlos aquí creaba una segunda fuente de verdad.

## Histórico (backend, antes del 2026-11-03)

| RF    | Estado    | Agente (V1)       | Evidencia                     |
| :---- | :-------- | :---------------- | :---------------------------- |
| RF-02 | Propuesto | db-architect      | `docs/harness/tasks/RF-02.md` |
| RF-03 | Propuesto | db-architect      | `docs/harness/tasks/RF-03.md` |
| RF-06 | Propuesto | db-architect      | `docs/harness/tasks/RF-06.md` |
| RF-07 | Propuesto | security-reviewer | `docs/harness/tasks/RF-07.md` |
| RF-15 | Propuesto | db-architect      | `docs/harness/tasks/RF-15.md` |
| RF-19 | Propuesto | security-reviewer | `docs/harness/tasks/RF-19.md` |

Estas tareas eran del backend y no se ejecutan en este repositorio. Se conservan como referencia.
