# ADR 0006: Estados canónicos del estudiante y custodia

- Status: Accepted
- Date: 2026-11-03
- Relacionado: `docs/adr/0005-fuente-de-verdad-y-precedencia.md`

## Contexto

El SRS §4 describe **6 estados** del estudiante en lenguaje natural:

1. En Casa / En Espera
2. A Bordo del Vehículo
3. Ausente Confirmado
4. Entregado a Adulto Autorizado
5. Retorno Seguro a Sede
6. En Custodia Institucional

La base de datos validada (`db/migrations/V006__attendance_and_custody_lifecycle.sql`), el modelo
entidad-relación y `packages/domain` usan **4 estados** en `SNAKE_CASE`:

`EN_CASA`, `A_BORDO_VEHICULO`, `EN_COLEGIO`, `RETORNO_SEDE_POR_FALLA_ENTREGA`.

Cambiar la máquina de estados implica una migración nueva, volver a validar RLS, auditoría y
pruebas. El frontend no puede inventar dos listas distintas.

## Decisión

La lista canónica es la de la base de datos (4 estados). El SRS §4 se traduce al modelo real:
los dos estados que faltan **no son estados**, son hechos auditables en tablas propias.

| SRS §4                        | Modelo canónico                  | Implementación                                      |
| :---------------------------- | :------------------------------- | :-------------------------------------------------- |
| En Casa / En Espera           | `EN_CASA`                        | estado inicial del día                              |
| A Bordo del Vehículo          | `A_BORDO_VEHICULO`               | habilita el mapa de custodia                        |
| Ausente Confirmado            | —                                | registro en `inasistencia`; libera cupo (RN-03)     |
| Entregado a Adulto Autorizado | —                                | evento en `entrega`; cierra el viaje del estudiante |
| Retorno Seguro a Sede         | `RETORNO_SEDE_POR_FALLA_ENTREGA` | estado de retorno                                   |
| En Custodia Institucional     | `EN_COLEGIO` + `acta_custodia`   | el acta formaliza la custodia                       |

### Reglas de implementación

1. El frontend solo envía y compara los 4 valores canónicos.
2. "Ausente" y "Entregado" se muestran como resultado de un evento, nunca como un estado inventado.
3. La custodia institucional exige `EN_COLEGIO` **y** un `acta_custodia` vigente; sin acta, la UI
   no afirma que el menor está bajo custodia institucional.
4. Los eventos de custodia no se mutan ni se borran (RNF-08); una corrección es un evento nuevo.
5. El tope de 3 adultos autorizados (`assertMaxAuthorizedAdults`) y el cero sobrecupo (RN-02) se
   validan en el dominio, no solo en la UI.

## Alternativas descartadas

1. **B) Ampliar la máquina a 6 estados** con una migración `V011`: más fiel al texto, pero exige
   revalidar RLS, auditoría, ER y pruebas, y duplica conceptos que ya existen como tablas.
2. **C) 4 estados + 2 subestados derivados en el cliente**: mantiene la BD, pero crea una segunda
   máquina de estados en el frontend y dos definiciones de "ausente" y "entregado".

## Consecuencias

- Una sola lista de estados en todo el sistema.
- El SRS §4 se lee con la tabla de equivalencias; no se "corrige" el SRS para que diga 4.
- Si el responsable prefiere B o C, este ADR se reemplaza y se actualiza `packages/domain`, el ER,
  la migración y el SRS en el mismo PR.
- El skill `estados-custodia` implementa esta decisión y rechaza cualquier estado fuera de la lista.
