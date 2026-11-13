---
state: implementada
app: packages
requirements: [RNF-04]
---

# FE-06 — Pipeline de SVG de Figma para React Native

## Contexto y objetivo

`packages/ui` ya comparte tokens, pero las apps móviles duplican cuatro logos
SVG y no pueden importarlos como componentes React Native. Centralizar los
logos y configurar la resolución, transformación y validación de SVG para ambas
apps.

## Alcance

- Exportar `@camino/ui` con una condición `react-native` y subrutas para SVG.
- Centralizar los cuatro logos en `packages/ui/src/svg/` y retirar las copias
  por app.
- Configurar `react-native-svg`, `react-native-svg-transformer` y declaraciones
  TypeScript en ambas apps.
- Configurar SVGO para conservar `viewBox` e IDs de recursos y validar
  incompatibilidades antes de usar los SVG.
- Documentar el flujo de Figma en `docs/design/README.md` §9.

## Requisito relacionado

`RNF-04`: accesibilidad y usabilidad móvil, incluidos controles táctiles de al
menos 48 px y alto contraste. Este pipeline habilita los recursos visuales
vectoriales usados por las interfaces móviles.

## Criterios de aceptación

- `@camino/ui/svg/logo-texto.svg` se resuelve como componente en las apps Expo.
- SVGO conserva `viewBox` y los IDs y referencias de gradientes, máscaras y
  clip-paths.
- `svg:check` detecta filtros, imágenes incrustadas y texto/fuentes sin
  convertir a contornos.
- Pruebas cubren un logo, un icono y una ilustración con degradado, máscara y
  clip-path.
- La guía documenta exportación individual, contornos y kebab-case.

## Verificación visual

La comprobación visual en emuladores se documenta en el PR. No se crean archivos
de evidencia en esta carpeta, de acuerdo con la guía raíz.
