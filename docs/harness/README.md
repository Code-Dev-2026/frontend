# Harness — índice de vigencia

Este directorio conserva documentos del arnés. **No todos están vigentes.** La fuente normativa es
`AGENTS.md`, `docs/constitution.md`, `docs/architecture.md` y `docs/adr/`.

## Vigentes

| Documento                   | Uso                                                      |
| :-------------------------- | :------------------------------------------------------- |
| `orchestration.md`          | agentes, flujo SDD y compuertas                          |
| `discrepancias.md`          | divergencias abiertas y su estado según el ADR 0005      |
| `evals/golden-scenarios.md` | escenarios de aceptación que toda spec debe poder probar |
| `maintenance.md`            | cómo se mantiene el arnés                                |
| `rulesets.md`               | doble aprobación del contrato y aplicación de rulesets   |
| `failure-log.md`            | fallos recurrentes y la regla que los evita              |

## Heredados del backend (revisar antes de usar)

- `rules/database.md`, `rules/custody.md`, `rules/security-privacy.md`, `rules/telemetry.md`,
  `rules/testing.md`, `rules/architecture.md`: escritos para el backend. Si contradicen los skills
  o un ADR, **ganan los skills y el ADR**; si siguen siendo útiles, se reescriben para el frontend.
- `tasks/RF-*.md`: contratos de tarea históricos del backend. No se usan para nuevas specs.

## Obsoleto

- `frontend-bootstrap/`: copia completa del arnés anterior. Se conserva solo como histórico; no es
  fuente de verdad y no debe editarse. Ver `frontend-bootstrap/DEPRECATED.md`.

## Regla

Si un documento de este directorio contradice `AGENTS.md`, la constitución o un ADR, se corrige o se
marca como obsoleto en el mismo PR. No se dejan dos verdades.
