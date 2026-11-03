# Orquestación del harness

## Agentes

| Agente        | Modo     | Edita                                               | No puede                               |
| :------------ | :------- | :-------------------------------------------------- | :------------------------------------- |
| `coordinator` | primary  | nada                                                | editar, ejecutar builds, hacer merge   |
| `planner`     | all      | `specs/**`, `docs/adr/**`                           | tocar `apps/**` o `packages/**`        |
| `implementer` | subagent | `apps/**`, `packages/**`, `tasks.md`, `evidence/**` | cambiar spec, plan, config o scripts   |
| `reviewer`    | subagent | solo `evidence/**`                                  | arreglar código, aprobar sin evidencia |

## Flujo canónico

```text
planner: spec → clarify → plan → tasks
                    ↓
reviewer: analyze          ← compuerta 1: aprobación humana de la spec
                    ↓
implementer: implement     → pruebas + evidencia
                    ↓
reviewer: verify → review  ← compuerta 2: aprobación humana y merge
```

`coordinator` conduce el flujo y se detiene en cada compuerta.

## Políticas de ejecución

- **Un solo escritor de código**: `implementer`. Los demás escriben specs o evidencia.
- El paralelismo solo aplica a módulos disjuntos y requiere worktrees separados.
- El `reviewer` trabaja en solo lectura; su única escritura permitida es `evidence/`.
- Máximo 2 iteraciones de corrección por defecto; al tercer fallo se escala al responsable.
- Todo cambio en custodia, telemetría, cartera, autenticación o contrato exige revisión del `reviewer`.
- Ningún agente instala dependencias sin aprobación humana explícita.

## Reglas de aprobación de PR

- Todo PR que toque el contrato backend↔frontend (`docs/contrato-backend-frontend.md`, OpenAPI,
  eventos Socket.IO) requiere aprobación conjunta de al menos un dueño del backend y uno del
  frontend (Andrés Botina Valencia o Ana Milena Zúñiga).
- Todo cambio de esquema, RLS o migración se aprueba en el repositorio backend, no aquí.
- Los agentes nunca hacen merge ni aprueban PRs: la última compuerta es la aprobación humana.

## Evidencia mínima

- `spec.md` aprobada y trazable al SRS.
- Pruebas con la denegación obligatoria.
- `node scripts/verify.mjs` en verde.
- `node scripts/check-invariants.mjs` en verde.
- `node scripts/sync-backend-ref.mjs --check` sin deriva.
- Revisión del `reviewer` con veredicto y riesgos residuales.
