# AGENTS.md: portal web (`apps/portal`)

Complementa las reglas compartidas de `../../AGENTS.md`. Estas instrucciones aplican solo a `apps/portal`; las instrucciones móviles de `apps/AGENTS.md` no aplican aquí. Si hay conflicto con las reglas compartidas, prevalece la guía raíz salvo que esta guía indique explícitamente una excepción web.

## 1. Stack del portal

- Next.js `15.1.0` (App Router), React `19.0.0`, TypeScript estricto.
- Tailwind CSS `3.4` + **shadcn/ui** (a instalar en FE-18).
- TanStack Query y React Hook Form + Zod (ya instalados).
- Por instalar según la issue: MapLibre GL JS + Terra Draw (mapa y diseñador de rutas), Recharts (gráficas), librería de tablas (TanStack Table), carga CSV.
- **No uses** React Native, Expo, `react-native-svg` ni `packages/ui` (es de React Native y no corre en web). React del portal (19) y de las apps móviles (18.3.1) son distintos: no compartas componentes.

## 2. Comandos

```bash
pnpm --filter portal dev           # servidor en http://localhost:3000
pnpm --filter portal build
pnpm --filter portal lint
pnpm --filter portal typecheck
pnpm --filter portal test          # Vitest (unitarias)
pnpm verify                        # pipeline completo antes de cerrar la tarea
```

- El portal se prueba en el **navegador**, no en emulador. El SRS prevé **Playwright** para pruebas de extremo a extremo web: añádelo cuando una issue lo pida.
- Puerto 3000: el backend usa `localhost:3000` según `.env.example`. Al correr ambos, cambia el puerto del portal (`next dev -p 3100`) y documenta el cambio.

## 3. Estructura

```
apps/portal/
  app/                 # rutas (App Router): login, health, módulos placeholder
  src/components/      # forms, layout, tables (+ ui/ de shadcn)
  src/features/        # auth, reporting, routes, students (lógica de pantalla)
  src/lib/api/         # cliente: importa solo módulos de @camino/contracts
  src/lib/auth/        # sesión y guardas de rol
```

Hay dos zonas de código (`app/` y `src/`). **Problema conocido:** `tailwind.config.ts` solo escanea `./app/**`, así que las clases usadas en `src/` no se generan. FE-18 lo corrige; hasta entonces no confíes en estilos de componentes de `src/`.

## 4. Reglas específicas de web

1. **Contratos:** importa por módulo (`@camino/contracts/routes`, `/trips`...) desde `src/lib/api/`, como ya hace `health/page.tsx`. No definas tipos de API propios y no edites `src/generated/`.
2. **Textos de error:** muéstralos con `ApiError.message` del catálogo; no los escribas a mano.
3. **Sesión:** `localStorage` y `sessionStorage` están **prohibidos** (invariante del CI). La sesión debe ir en cookies `httpOnly` gestionadas por el servidor. El mecanismo exacto depende de la decisión de login de FE-05 (el backend devuelve tokens en el cuerpo JSON y el cliente usa cookies). No improvises el esquema de autenticación.
4. **Roles y visibilidad:** el portal tiene vistas por rol (Coordinación, Gerencia de Transporte, Jefe de Operaciones, Administrador de Cartera). La interfaz oculta lo que el rol no puede ver, pero **la autorización real es del backend**; no la sustituyas con lógica de cliente. Datos de cartera/mora solo para el rol de cartera (RF-15).
5. **Estados y reglas** del estudiante salen de `@camino/domain`.
6. **Componentes de servidor vs. cliente:** por defecto Server Components. Usa `'use client'` solo donde haya estado, efectos o mapas.
7. **Mapas:** MapLibre GL JS con el estilo `NEXT_PUBLIC_MAPLIBRE_STYLE_URL`. Carga el mapa solo en cliente (sin SSR). El tiempo real es Socket.IO; mientras el backend no defina eventos (`realtime-events.ts` está vacío) usa datos simulados marcados como `PROVISIONAL`.
8. **Accesibilidad:** ESLint incluye `jsx-a11y`. Foco visible, etiquetas en formularios, contraste suficiente. Los 48 px táctiles aplican en pantallas táctiles, no son obligatorios para el cursor.
9. **Privacidad:** no registres en consola ni en logs datos personales de menores, documentos o fotos. Las fotos de autorizados se muestran solo a roles con permiso y sin cachear en lugares públicos.

## 4.1 Reglas de producto específicas del portal (SRS)

- Solo el perfil **Superadministrador (Coordinación)** puede suspender, editar o archivar una restricción de custodia (RN-04). Monitoras y acudientes nunca.
- La **vista global de flota** es solo para Coordinación y Gerencia de Transporte (RF-19).
- **Reportes** generados no se editan en el sistema; cualquier ajuste queda registrado con firma de auditoría (RF-16).
- **Comunicados:** informativo o urgente; no hay chats abiertos con la tripulación (RF-12/RF-20).
- **Rutas:** los cambios de paradas se hacen aquí y solo por roles autorizados; las apps móviles no las editan (RN-06).

## 5. Flujo de diseño: Figma → web

- Exporta desde Figma los **tokens** (colores, tipografía, radios, espaciados) y cárgalos en `tailwind.config.ts` (`theme.extend`) y en variables CSS de shadcn/ui. Los valores deben ser **idénticos a Figma**.
- Los **SVG** (logos, iconos, ilustraciones) se usan como archivos en `public/` o como componentes React mediante SVGR (`@svgr/webpack` en `next.config.mjs`), **sin** `react-native-svg`. Nombres en kebab-case. No rasterices SVG.
- Los componentes se construyen con shadcn/ui y se ajustan al diseño; no copies estilos "aproximados".
- Referencias de diseño de cada pantalla: `docs/design/portal/<pantalla>/` (frame + SVG + textos). Si faltan, aplica la sección 5.1.
- Antes de tocar una pantalla, lee `docs/design/README.md`: explica cómo interpretar el enlace de Figma (`fileKey` y `node-id`) y cómo exportar el frame a `docs/design/portal/<pantalla>/` con `pnpm figma:export` (requiere `FIGMA_TOKEN`) o a mano. Si el archivo es privado y no hay token, pide la exportación (PNG + SVG + textos + tokens).

## 5.1 Cuando falta un asset, un dato o una decisión

Aplican las reglas compartidas de la guía raíz, con estas precisiones para web:

- Antes de empezar, verifica que existan los archivos del bloque **"Assets listos"** de la issue (frame en PNG, SVG de logos/iconos, `textos.md`, tokens).
- Si falta algo que define el aspecto o el contenido de la pantalla: **detente, lista qué falta (ruta esperada y para qué) y espera.** Con nadie presente (segundo plano, programada o CI), no avances en esa pantalla: entrega lo que no depende del asset, deja la lista pendiente en el PR y termina.
- Un detalle menor no especificado: usa el token o componente de shadcn/ui más cercano, no agregues valores nuevos y anótalo en el PR.
- No uses iconos de una librería (por ejemplo lucide) en lugar de un SVG de Figma, salvo que la issue lo permita.
- Cualquier placeholder necesario para compilar va marcado `// PROVISIONAL: falta <archivo>` y declarado en el PR.
- No afirmes fidelidad visual sin haber tenido el frame para compararla.
- **Fidelidad:** compara en el navegador contra el frame a 1440 px y a 768 px. Tolerancia de 1-2 px en espaciados y tamaños.

## 6. Entrega específica del portal

- Para toda pantalla nueva, compara Figma con el navegador y describe el resultado en el PR; no guardes capturas ni otros archivos en `specs/`.
- Si no pudiste abrir el navegador o ver el resultado, **dilo en el PR**; no afirmes fidelidad visual sin haberla comprobado.
- No toques `apps/monitora`, `apps/acudiente` ni `packages/ui`.
