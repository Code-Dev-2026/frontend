---
name: SDD — Spec Driven Development
description: Convierte requisitos del SRS en spec, plan, tareas, implementación, verificación y revisión con compuertas de aprobación humana.
---

# SDD en Camino Seguro

## Cuándo usarlo

Al iniciar cualquier funcionalidad, cambio de contrato o corrección que toque comportamiento.
No se usa para typos ni para cambios puramente cosméticos sin efecto funcional.

## Fases y compuertas

| Fase         | Comando          | Agente        | Salida                         | Compuerta                     |
| :----------- | :--------------- | :------------ | :----------------------------- | :---------------------------- |
| Especificar  | `/sdd-spec`      | `planner`     | `spec.md` en `borrador`        | —                             |
| Aclarar      | `/sdd-clarify`   | `planner`     | supuestos resueltos o marcados | humana si cambia el alcance   |
| Planificar   | `/sdd-plan`      | `planner`     | `plan.md`                      | —                             |
| Desglosar    | `/sdd-tasks`     | `planner`     | `tasks.md`                     | —                             |
| Revisar spec | `/sdd-analyze`   | `reviewer`    | hallazgos                      | **aprobación humana**         |
| Implementar  | `/sdd-implement` | `implementer` | código + pruebas               | —                             |
| Verificar    | `/sdd-verify`    | `reviewer`    | `evidence/verify-*.md`         | —                             |
| Cerrar       | `/sdd-review`    | `reviewer`    | veredicto                      | **aprobación humana + merge** |

## Reglas

1. **Sin trazabilidad no hay código.** Cada tarea cita `RF/RNF/RN/HU` existente en el SRS.
2. **No se inventa nada.** Si falta un requisito, endpoint, estado o dependencia, se pregunta.
3. **La spec no se adapta al código.** Si el código se desvía, se corrige el código o se abre un ADR.
4. **Una tarea, una prueba.** La prueba incluye al menos una denegación esperada cuando hay reglas de negocio.
5. **Datos ficticios.** Nunca datos reales de menores, acudientes o vehículos.
6. **La IA no aprueba.** El veredicto del `reviewer` es insumo; la aprobación es humana.

## Definición de terminado

- [ ] `spec.md` en estado `verificada`, con IDs del SRS.
- [ ] `plan.md` y `tasks.md` completos y sin tareas abiertas.
- [ ] `node scripts/verify.mjs` en verde.
- [ ] `node scripts/check-invariants.mjs` en verde.
- [ ] `node scripts/sync-backend-ref.mjs --check` sin deriva.
- [ ] `evidence/` con salida real y revisión del `reviewer`.
- [ ] RNF-04 revisado si hay UI: objetivo táctil ≥ 48 px y alto contraste.
- [ ] Aprobación humana registrada por escrito.

## Anti-patrones

- Escribir código y luego una spec que lo justifique.
- Marcar una tarea como hecha sin prueba ejecutada.
- "Arreglar" el SRS para que coincida con la implementación.
- Añadir una dependencia sin spec ni aprobación.
- Cerrar con un hallazgo bloqueante pendiente.
