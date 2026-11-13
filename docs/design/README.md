# Guía de diseño: de Figma al código

Este directorio guarda la **referencia de diseño** de cada pantalla para que
cualquier agente o persona construya la interfaz **idéntica** a Figma sin abrir
el archivo original (es privado y no es accesible desde el repositorio ni desde
CI).

Regla de oro: si un dato visual (color, tamaño, texto, icono, logo) no está en
esta carpeta, **no se inventa**. El agente se detiene y pide el asset. Ver
`apps/AGENTS.md` §4.1 (móvil) y `apps/portal/AGENTS.md` §5.1 (web).

## 1. Cómo leer una URL de Figma

Formato habitual:

```text
https://www.figma.com/design/<fileKey>/<nombre>?node-id=<nodo>&t=<share>
```

- `fileKey`: identificador del archivo; el fragmento que va justo después de
  `/design/` (o `/file/`).
- `node-id`: el frame o sección concreto. En la URL usa guiones
  (`node-id=7-2`); la API de Figma lo espera con dos puntos (`7:2`).
- `t=`: token de enlace compartido; no se usa para la API.

Ejemplo real:

```text
https://www.figma.com/design/ig1NPLOHpjHSCWL36bHW8z/Untitled?node-id=7-2&t=PRe33vHJH44W7QtX-4
                        └────── fileKey ──────┘                    └ nodo 7:2
```

`scripts/figma-export.mjs` acepta esa URL tal cual y traduce el `node-id`
automáticamente (`7-2` → `7:2`).

> Si el enlace no incluye `node-id`, no apunta a un frame concreto: en Figma
> haz clic en el frame y usa **Copy link to selection** para obtener el enlace
> correcto.

## 2. Estructura de carpetas

```text
docs/design/
  <app>/            # monitora | acudiente | portal
    <pantalla>/     # minúsculas, números y guiones (login, ruta-activa...)
```

Cada pantalla debe contener, como mínimo:

| Archivo           | Para qué                                                                        |
| ----------------- | ------------------------------------------------------------------------------- |
| `frame.png`       | Captura del frame a 2x, para comparar visualmente.                              |
| `figma-node.json` | Árbol del nodo con posiciones, tamaños, colores, tipografías y textos. Exacto.  |
| `textos.md`       | Copia literal de todos los textos, con mayúsculas, tildes y puntuación.         |
| `tokens.json`     | Colores, tipografía, radios y espaciados usados en la pantalla.                 |
| `medidas.md`      | Tamaños y separaciones relevantes (si no se deducen del nodo).                  |
| `estados.md`      | Estados que cubre el diseño (error, cargando, vacío…).                          |
| `*.svg`           | Logos, iconos e ilustraciones **individuales**, exportados como SVG.            |

No se admiten placeholders presentados como definitivos.

`tokens.json` de referencia:

```json
{
  "colors": { "primary": "#0F172A", "background": "#FFFFFF" },
  "typography": {
    "title": {
      "fontFamily": "Inter",
      "fontSize": 24,
      "fontWeight": "700",
      "lineHeight": 32
    }
  },
  "radii": { "md": 12 },
  "spacing": { "md": 16 }
}
```

## 3. Opción A — exportación automática (requiere token)

1. En Figma: **Settings → Security → Personal access tokens → Generate new
   token**, con permiso de lectura del archivo.
2. Da el token al script sin pegarlo en el código ni en el chat. Hay dos
   formas:

   **Archivo local (recomendado).** Crea `.figma-token` en la raíz del repo con
   el token como única línea (el archivo está en `.gitignore`):

   ```powershell
   Set-Content -NoNewline .figma-token "figd_..."
   pnpm figma:export "https://www.figma.com/design/ig1NPLOHpjHSCWL36bHW8z/Untitled?node-id=7-2" monitora/login
   Remove-Item .figma-token
   ```

   **Variable de entorno (CI o uso puntual).**

   ```powershell
   $env:FIGMA_TOKEN = "figd_..."
   pnpm figma:export "https://www.figma.com/design/ig1NPLOHpjHSCWL36bHW8z/Untitled?node-id=7-2" monitora/login
   Remove-Item Env:FIGMA_TOKEN
   ```

   El segundo argumento es `<app>/<pantalla>`.

3. El script crea `docs/design/<app>/<pantalla>/` con `figma-node.json`,
   `figma-styles.json`, `frame.png` y `frame.svg`.

Después completa a mano `textos.md`, `tokens.json`, `medidas.md` y
`estados.md`, y exporta cada SVG por separado si el frame los incluye.

Si el login tiene **un frame por app**, ejecuta el comando una vez por cada
`node-id` (por ejemplo `monitora/login` y `acudiente/login`).

Si `figma-node.json` queda muy pesado, resume los valores relevantes en
`tokens.json` y `medidas.md` y conserva el JSON solo en local.

## 4. Opción B — exportación manual (sin token)

1. Abre el frame en Figma.
2. Selecciona el frame completo y expórtalo como **PNG 2x** → `frame.png`.
3. Selecciona cada logo, icono o ilustración y expórtalo como **SVG** (nunca
   rasterizado), con nombre en kebab-case.
4. Con el frame seleccionado, abre **Inspect** y copia:
   - rellenos, trazos y colores → `tokens.json`,
   - tipografías, tamaños y pesos → `tokens.json`,
   - espaciados y tamaños → `medidas.md`,
   - todos los textos → `textos.md`.
5. Copia los archivos a `docs/design/<app>/<pantalla>/`.

## 5. Seguridad del token

- El token **nunca** se escribe en el código, en `.env.example`, en un commit,
  en un issue ni en el chat. El script lo lee de `FIGMA_TOKEN` o del archivo
  local `.figma-token`.
- `.figma-token` está en `.gitignore`: no se versiona. Bórralo al terminar.
- El script no escribe el token en los archivos exportados.
- Revoca el token en Figma cuando termines.

## 6. Qué aporta el usuario y qué escribe el agente

- **Aporta el usuario:** `frame.png`, los SVG, los textos y los tokens (o el
  `FIGMA_TOKEN` para generarlos).
- **Escribe el agente:** los componentes de React Native / React, usando los
  tokens y SVG. No se aportan componentes de React desde Figma.

## 7. Referencias

- Reglas móviles: `apps/AGENTS.md` §4 y §4.1.
- Reglas web: `apps/portal/AGENTS.md` §5 y §5.1.
