# Orquestación del harness

## Flujo canónico

`spec-analyst → test-writer → backend-implementer/db-architect → verify → security-reviewer → traceability-auditor → orchestrator`

## Politicas de ejecución

- Un solo escritor por módulo.
- El paralelismo solo aplica a módulos disjuntos y requiere worktrees separados.
- `security-reviewer` trabaja solo en lectura y recibe el diff, el contrato y las reglas inviolables.
- Máximo 3 iteraciones de corrección por defecto; al cuarto fallo se escapa a revisión humana.
- Todo cambio en custodia, telemetría, auditoría, `billing` o RLS exige revisión del `security-reviewer`.

## Reglas de aprobación de PR

El harness refleja estas reglas operativas:

- Todo PR que toque `db/migrations/**`, RLS, `bitacora_auditoria`, `historial_estado_custodia` o `billing` requiere aprobación de ambos dueños del backend: Jhonatan Mauricio Muchavisoy Jajoy y Aura Camila Arteaga Castillo.
- Todo cambio al contrato backend↔frontend (`docs/contrato-backend-frontend.md`, OpenAPI, eventos Socket.IO) requiere aprobación conjunta de al menos un dueño del backend y uno del frontend (Andrés Botina Valencia o Ana Milena Zúñiga).
- Los agentes nunca hacen merge ni aprueban PRs: la última compuerta es la aprobación humana.

## Evidencia mínima

- Contrato de tarea.
- Pruebas con denegaciones obligatorias.
- Evidencia de verificación (`verify.sh`).
- Revisión de seguridad en lectura.
- Trazabilidad RF/RNF/HU con estado y evidencia.
