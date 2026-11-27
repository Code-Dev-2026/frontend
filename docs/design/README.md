# Guía de diseño: de Figma al código

Este documento define las reglas oficiales para traducir pantallas diseñadas en Figma a componentes de React Native y Web con alta fidelidad visual.

## 1. El flujo de construcción (4 pasos)

1. **Activos vectoriales (SVG):**
   - Exporta únicamente logos, isotipos e iconos individuales como `.svg` (en kebab-case, ej: `icon-check.svg`).
   - Guárdalos en `packages/ui/src/svg/` para aplicaciones móviles (o en `apps/portal/public/` para web).
   - **Regla estricta:** Nunca exportes una pantalla completa como un solo SVG. Las pantallas se componen con elementos nativos.
2. **Tokens de diseño:**
   - Define los colores, fuentes, espaciados y radios en `packages/ui/src/tokens/<pantalla>.ts` (o en `tailwind.config.ts` para el portal web).
3. **Construir componentes nativos:**
   - En móviles: utiliza `<ScrollView>`, `<View>`, `<Text>`, `<TextInput>`, `<Pressable>` y `StyleSheet.create`.
   - Aplica los tokens definidos y ubica los SVGs en sus posiciones exactas.
   - **Referencia base:** Revisa [`packages/ui/src/components/login/LoginScreen.tsx`](../../packages/ui/src/components/login/LoginScreen.tsx), el cual consume `loginTokens` y el SVG `logo-texto.svg`.
4. **Reutilización:**
   - Si una pantalla, tarjeta o elemento visual lo comparten `apps/acudiente` y `apps/monitora`, constrúyelo una sola vez en `packages/ui/src/components/` y expórtalo en `packages/ui/src/index.ts`. Las apps solo consumen el componente y conectan su lógica propia.

## 2. Criterios de SVG para React Native

- Convierte todos los textos y trazos a contornos antes de exportar desde Figma.
- No incrustes imágenes rasterizadas ni uses filtros SVG pesados.
- Usa `currentColor` únicamente en iconos o elementos que deban cambiar de color según el tema (claro/oscuro); en los demás, conserva sus colores originales.
- Tras agregar o modificar un SVG, ejecuta:
  ```bash
  pnpm --filter @camino/ui svg:check
  ```
