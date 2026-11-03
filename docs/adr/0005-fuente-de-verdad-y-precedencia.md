# ADR 0005: Fuente de verdad y precedencia documental

- Status: Accepted
- Date: 2026-11-03
- Sustituye: la regla "el README siempre gana" de `docs/harness/discrepancias.md`

## Contexto

Con la llegada del SRS v2.0 (`backend/docs/srs.md`) existen tres relatos del sistema: el SRS
(el QUÉ), el `README.md` (lo que está implementado) y los ADR (el CÓMO decidido). El harness
anterior declaraba que el `README` era la fuente de verdad y siempre ganaba, lo que permitía
que una divergencia de implementación reescribiera de facto un requisito. Con esa regla, el
agente puede justificar cualquier cosa eligiendo la fuente que le conviene.

## Decisión

Se adopta esta jerarquía, de mayor a menor autoridad:

1. **Instrucción explícita del responsable**, registrada por escrito (PR, issue o sesión).
2. **SRS** (`backend/docs/srs.md`): define el **QUÉ** y el **POR QUÉ**.
3. **ADR** (`docs/adr/`) y `docs/architecture.md`: definen el **CÓMO** ya decidido.
4. **`README.md`**: describe el estado implementado. Es **descriptivo, no normativo**.
5. **`[SUPUESTO]`** explícito, cuando no hay fuente anterior.

## Reglas de aplicación

1. Una divergencia entre SRS e implementación **no se resuelve eligiendo una fuente**: se
   documenta en un ADR con la alternativa descartada y se refleja en el SRS en el mismo PR.
2. El `README.md` nunca prevalece sobre el SRS ni sobre un ADR. Si difiere, es deuda documental.
3. Un requisito que no está en el SRS no se implementa; si falta, primero se añade al SRS.
4. Toda spec (`specs/NNN-*/spec.md`) cita los IDs del SRS (`RF-xx`, `RNF-xx`, `RN-xx`, `HU-xx`).
5. Los agentes declaran de qué fuente sale cada afirmación normativa.

## Divergencias abiertas (cada una requiere su ADR)

| Tema                    | SRS                               | Implementado                                       | Estado                |
| :---------------------- | :-------------------------------- | :------------------------------------------------- | :-------------------- |
| Estados del estudiante  | §4: 6 estados en lenguaje natural | `V006` / ER / `packages/domain`: 4 en `SNAKE_CASE` | **abierta**           |
| Versión de Node         | A.2: Node 22 LTS                  | `engines >=20 <23`, `.nvmrc` y CI con 20           | abierta (sin impacto) |
| Partición de telemetría | A.2: por día                      | `V005`: mensual                                    | abierta (sin impacto) |
| Bloqueo de capturas iOS | RNF-09: "bloquear"                | A.7.5 admite que iOS solo oculta/detecta           | abierta (redacción)   |

## Alternativas descartadas

1. **"El README siempre gana"** (regla anterior): convierte la implementación en requisito y
   elimina la capacidad de detectar desviaciones.
2. **"El SRS gana siempre, incluido el CÓMO"**: obliga a reescribir el SRS por cada detalle de
   implementación y lo vuelve inmantenible.
3. **Una verdad por repositorio**: produce exactamente el problema que este ADR elimina.

## Consecuencias

- Cada agente sabe qué documento manda en cada pregunta.
- Aumenta el costo de documentación: toda divergencia exige un ADR corto.
- El SRS se mantiene vivo; el `README` deja de ser un contrato.
