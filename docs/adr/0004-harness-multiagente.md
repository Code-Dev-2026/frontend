# ADR 0004: Harness multiagente para Camino Seguro

- Status: Accepted
- Date: 2026-11-02

## Contexto

El repositorio backend aún está en la capa de base de datos y documentación. Se requiere un entorno seguro para que agentes implementen funcionalidades futuras sin romper integridad, seguridad ni trazabilidad.

## Decisión

Se adopta un harness de gobernanza con permisos restrictivos, scripts de verificación, reglas de seguridad y orquestación mínima por agentes especializados.

## Alternativas descartadas

1. Hacer que cada agente trabaje sin restricciones: se descartó por riesgo de corrupción de migraciones y fuga de datos sensibles.
2. Forzar una sola IA para todo: se descartó por falta de especialización y revisión adversarial.
3. Usar un único y amplio bash sin permisos: se descartó por imposibilidad de mantener integridad.

## Consecuencias

- Mejora la trazabilidad del trabajo.
- Reduce riesgos de IDOR, RLS bypass y fuga de datos.
- Exige disciplina en verificación y revisión.
- No sustituye la aprobación humana de dueños del backend.
