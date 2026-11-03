---
description: Desglosa el plan en tareas ordenadas, con prueba y criterio de terminado
agent: planner
---

Spec: **$ARGUMENTS**

## Salida

Crea o actualiza `specs/NNN-*/tasks.md`:

- Tareas `T01`, `T02`… en orden de dependencia.
- Cada tarea indica: archivos, requisito del SRS, prueba y criterio de terminado.
- Una tarea no mezcla dominios distintos ni deja el repo sin compilar.
- La primera tarea es la prueba que falla; la última es la verificación.

## Reglas

- No escribas código.
- No crees tareas que no estén en el plan.
- No incluyas instalación de dependencias sin aprobación explícita.
- Si una tarea no se puede probar, divídela hasta que se pueda.
- Al terminar, indica cuántas tareas hay y cuál es la primera.
