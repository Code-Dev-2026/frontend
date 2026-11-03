---
name: Estados y custodia
description: Lista canónica de 4 estados, transiciones válidas, traducción desde el SRS §4 y reglas de custodia, entrega y sobrecupo.
---

# Estados y custodia

Fuente: `packages/domain` + `docs/adr/0006-estados-canonicos-custodia.md`. El SRS §4 describe 6
estados en lenguaje natural; dos de ellos son **eventos**, no estados.

## Lista canónica (4)

| Estado                           | Significado                                       | Sale hacia                                     |
| :------------------------------- | :------------------------------------------------ | :--------------------------------------------- |
| `EN_CASA`                        | inicio del día                                    | `A_BORDO_VEHICULO`                             |
| `A_BORDO_VEHICULO`               | el menor está en el vehículo                      | `EN_COLEGIO`, `RETORNO_SEDE_POR_FALLA_ENTREGA` |
| `EN_COLEGIO`                     | llegó al colegio o está en custodia institucional | `RETORNO_SEDE_POR_FALLA_ENTREGA`               |
| `RETORNO_SEDE_POR_FALLA_ENTREGA` | no se pudo entregar y vuelve a sede               | `EN_CASA`                                      |

## Traducción desde el SRS §4

| SRS §4                        | Implementación                            |
| :---------------------------- | :---------------------------------------- |
| En Casa / En Espera           | `EN_CASA`                                 |
| A Bordo del Vehículo          | `A_BORDO_VEHICULO`                        |
| Ausente Confirmado            | registro en `inasistencia` (no es estado) |
| Entregado a Adulto Autorizado | evento en `entrega` (no es estado)        |
| Retorno Seguro a Sede         | `RETORNO_SEDE_POR_FALLA_ENTREGA`          |
| En Custodia Institucional     | `EN_COLEGIO` + `acta_custodia` vigente    |

## Reglas que no se negocian

1. **Transiciones**: solo las de `VALID_TRANSITIONS`; un salto inválido se rechaza en el cliente y en el servidor.
2. **Mapa**: se muestra solo con `A_BORDO_VEHICULO` (`shouldShowCustodyMap`, RN-07).
3. **Sobrecupo**: máximo 3 adultos autorizados por estudiante (`assertMaxAuthorizedAdults`); el cero sobrecupo del vehículo es duro (RN-02).
4. **QR**: el carné con QR es el único medio de abordaje (RN-01); sin QR válido no hay transición.
5. **Ocasional**: solo con inasistencia previa que libere cupo (RN-03).
6. **Alerta legal**: si hay restricción judicial, no se entrega a la persona señalada sin Policía de Infancia o delegación de Rectoría (RN-04).
7. **Auditoría**: los eventos de custodia no se mutan ni se borran; una corrección es un evento nuevo (RNF-08).
8. **Denegaciones**: deben existir pruebas de transición inválida, sobrecupo y entrega bloqueada.

## Qué NO hacer

- Crear estados nuevos en el frontend (`AUSENTE`, `ENTREGADO`, `EN_CUSTODIA`).
- Deducir el estado desde el último evento sin confirmación del servidor.
- Mostrar el mapa "por si acaso" o durante `EN_CASA`.
- Permitir una entrega con alerta judicial activa.
