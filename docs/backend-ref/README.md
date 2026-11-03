# backend-ref — espejo de solo lectura del backend

Este directorio contiene copias de los documentos canónicos del repositorio
`Code-Dev-2026/backend`. **Nada de aquí se edita**: si un documento está mal, se corrige en el
backend y se vuelve a copiar con `node scripts/sync-backend-ref.mjs`.

## Fuente canónica

| Documento | Canónico en | Espejo aquí | Estado |
| :--- | :--- | :--- | :--- |
| SRS v2.0 (el QUÉ) | `backend/docs/srs.md` | `srs.md` | **espejo activo** |
| Modelo entidad-relación | `backend/docs/er.md` | `er.md` | **espejo activo** |
| Matriz de trazabilidad | `backend/docs/trazabilidad-srs.md` | `trazabilidad-srs.md` | **espejo activo** |
| Supuestos y propuestas | `backend/docs/supuestos-y-propuestas.md` | `supuestos-y-propuestas.md` | **espejo activo** |
| Contrato backend↔frontend | *(no existe en `backend/docs/`)* | — | propiedad compartida; ver abajo |

Los SHA-256 vigentes están en la cabecera de cada espejo y los imprime
`node scripts/sync-backend-ref.mjs --check`.

### Contrato backend↔frontend

`docs/contrato-backend-frontend.md` **no** se mueve aquí porque el repositorio backend todavía no
tiene ese archivo en `docs/`. Guardarlo en un directorio llamado "espejo del backend" sería una
mentira documental. Sigue en `docs/` como documento compartido y requiere un ADR conjunto para
decidir dónde vive y quién lo aprueba.

## Cabecera obligatoria de cada espejo

```md
> ESPEJO DE SOLO LECTURA — no editar aquí.
> Fuente: Code-Dev-2026/backend → <ruta canónica> @ <commit>
> SHA-256 del canónico: <hash>
> Se actualiza en el mismo PR que cambie el documento canónico.
```

La cabecera la genera el script; no se escribe a mano.

## Regla de sincronización

1. Cambiar un documento canónico exige actualizar su espejo en el **mismo PR**.
2. Si el espejo y el canónico difieren, gana el canónico y el espejo se regenera.
3. Los agentes leen el espejo (no el repo hermano) para que el trabajo funcione en CI y en clones aislados.
4. Este espejo **no** contiene secretos, credenciales ni datos personales reales.
5. `docs/backend-ref/` está excluido de Prettier y de `lint-staged`: el espejo debe ser
   **byte-idéntico** al canónico (incluidos fin de línea y tablas sin alinear).

## Comandos

```bash
node scripts/sync-backend-ref.mjs          # regenera los 4 espejos
node scripts/sync-backend-ref.mjs --check  # falla si hay deriva
```

## Verificar un hash a mano

```powershell
cd F:\CaminoSeguro-App\frontend\docs\backend-ref
$b = [IO.File]::ReadAllBytes('..\..\..\backend\docs\srs.md')
([BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($b)) -replace '-','').ToLower()
```

Si el hash no coincide con la cabecera, el espejo está desactualizado.
