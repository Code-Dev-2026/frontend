# Exportación de SVG de Figma para React Native

Los logos, iconos e ilustraciones se guardan una sola vez en
`packages/ui/src/svg/` y se importan como componentes:

```tsx
import Logo from '@camino/ui/svg/logo-texto.svg';

<Logo width={160} height={174} />;
```

## Preparar el archivo en Figma

- Exporta cada logo, icono o ilustración individualmente en SVG; no exportes una
  pantalla completa como un único componente.
- Convierte textos y trazos a contornos antes de exportar.
- Usa nombres en kebab-case y un `viewBox` explícito.
- No incrustes imágenes rasterizadas ni uses filtros SVG.
- Conserva los colores originales. Usa `currentColor` solo para elementos que
  deban cambiar de color según el tema.

## Optimización y validación

SVGO usa `packages/ui/svgo.config.js`, que conserva `viewBox` y los IDs de
gradientes, máscaras y clip-paths. No reemplaces ni cambies esos IDs a mano.

Después de agregar o modificar un SVG, ejecuta:

```bash
pnpm --filter @camino/ui svg:check
pnpm --filter @camino/ui test
```

El chequeo detecta filtros, imágenes incrustadas, textos o fuentes sin convertir
a contornos, y comprueba que SVGO conserve el `viewBox`, los IDs protegidos y
las referencias.
