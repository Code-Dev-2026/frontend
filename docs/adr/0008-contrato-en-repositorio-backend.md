# ADR 0008: El contrato backend↔frontend vive en el repositorio backend

- Status: Proposed (aprobado por el responsable del frontend el 2026-11-03; requiere aceptación del equipo backend en el PR)
- Date: 2026-11-03
- Relacionado: `docs/adr/0005-fuente-de-verdad-y-precedencia.md`, `docs/adr/0007-sesion-y-superficie-por-rol.md`,
  `docs/propuestas/contrato-auth.md`, `specs/001-portal-login/spec.md`

## Contexto

El contrato backend↔frontend vivía **solo** en `frontend/docs/contrato-backend-frontend.md`, mientras:

- `backend/CODEOWNERS` ya declaraba una regla para `/docs/contrato-backend-frontend.md` con los cuatro
  dueños (dos de backend y dos de frontend). Esa regla nunca se activó porque el archivo no existía
  en el repositorio backend.
- La issue de arranque del backend
  (`.github/workflows/issues/001-harness-engineering.md`, línea 156) ordenaba explícitamente crear
  `docs/contrato-backend-frontend.md` **en el repositorio backend**.
- El contrato actual dice que un cambio requiere "un dueño del backend y un dueño del frontend",
  pero en el repositorio frontend no hay forma de exigir la firma del backend.

El resultado es una regla escrita que se cumple a mano. Con la autenticación pendiente de ratificar
(ADR 0007), esa ambigüedad ya cuesta: nadie sabe dónde se firma el contrato.

## Decisión

El documento canónico es **`backend/docs/contrato-backend-frontend.md`**.

- El frontend deja de tener una copia editable y consume un **espejo de solo lectura** en
  `docs/backend-ref/contrato-backend-frontend.md`, generado por `node scripts/sync-backend-ref.mjs`.
- El contrato pasa a ser el quinto espejo activo, junto con SRS, ER, trazabilidad y supuestos.
- Los cambios se proponen y aprueban en un PR del repositorio backend, donde `CODEOWNERS` exige la
  revisión de `@Muchavisoy-20`, `@YutamasPRO`, `@jabv123` y `@Z-83` para esa ruta.
- El frontend no edita el espejo: si detecta un error, lo corrige en backend y regenera.

### Qué no cambia

- `packages/contracts/openapi.json` sigue en el frontend como artefacto legible por las apps. La
  ratificación de la autenticación exige actualizar **ambos**: el contrato en backend y el OpenAPI
  del frontend. Unificar el OpenAPI en backend queda como decisión posterior, fuera de este ADR.
- Las reglas de revisión no se relajan: un cambio de contrato sigue necesitando un dueño de cada
  lado.

## Alternativas descartadas

1. **Dejar el contrato en frontend y añadir a los dueños del backend en su `CODEOWNERS`.** Evita el
   movimiento, pero mantiene el contrato como propiedad del frontend y deja muerta la regla que el
   backend ya escribió para su propio repositorio.
2. **Mantener dos copias editables.** Garantiza la deriva y obliga a reconciliar a mano; ya se
   descartó para el SRS en el ADR 0005.
3. **Eliminar la copia del frontend y leer solo el repo hermano.** Rompe CI y clones aislados; el
   frontend dejaría de ser autocontenido.

## Consecuencias

- El equipo backend es dueño del contrato y su revisión se exige automáticamente mediante el check
  `contract-review` y el ruleset, no solo por `CODEOWNERS`.
- El frontend gana un quinto espejo: `sync-backend-ref --check` falla si hay deriva cuando el repo
  backend está disponible; en CI, sin el canónico, avisa y no falla para no romper clones aislados.
- La política de doble aprobación se protege a sí misma: sus archivos están en `paths`, así que
  relajarla exige también las dos firmas.
- El PR de mudanza debe incluir el archivo en backend y, en frontend, el espejo, la eliminación del
  archivo suelto y la actualización de referencias.
- Si el backend rechaza la propiedad del contrato, este ADR se reemplaza y se aplica la alternativa 1.
