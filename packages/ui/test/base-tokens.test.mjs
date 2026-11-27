import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { analyzeSvg } from '../scripts/svg-check.mjs';

const UI_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));

const EXPECTED_FIGMA_ICONS = [
  'arrow-left',
  'bell',
  'bus-front',
  'chevron-left',
  'chevron-right',
  'circle-check',
  'download',
  'eye',
  'house',
  'info',
  'loader-circle',
  'lock-keyhole',
  'map-pin',
  'menu',
  'refresh-cw',
  'route',
  'school',
  'search',
  'shield-check',
  'triangle-alert',
  'user-round',
  'users',
  'wifi',
  'wifi-off',
  'x',
];

const EXPECTED_EXPORTS = [
  'MIN_TOUCH_TARGET',
  'designTokens',
  'buttonSize',
  'baseTokens',
  'Button',
  'InteractivePressable',
  'AnimatedNavIcon',
  'BottomNavBar',
  'SwipeBackView',
  'Card',
  'Badge',
  'Modal',
  'Dialog',
  'Banner',
  'BrandLoader',
  'BrandLoadingOverlay',
  'ScreenLoadingProvider',
  'useScreenLoading',
  'Input',
  'EmptyState',
  'Icon',
  'ICON_NAMES',
  'UiCatalogScreen',
  'SplashScreen',
  'MfaVerificationScreen',
  'RoleBlockedScreen',
];

test('all Icon SVG assets exist and pass svg:check with currentColor', async () => {
  for (const name of EXPECTED_FIGMA_ICONS) {
    const filePath = path.join(UI_ROOT, 'src', 'svg', `icon-${name}.svg`);
    assert.equal(existsSync(filePath), true, `Falta icon-${name}.svg`);
    const svg = await readFile(filePath, 'utf8');
    assert.deepEqual(analyzeSvg(svg, `icon-${name}.svg`).issues, []);
    assert.match(
      svg,
      /currentColor/,
      `icon-${name}.svg debe usar currentColor`,
    );
  }
});

test('base tokens define required cs/* palette and RNF-04 touch minimum', async () => {
  const baseSource = await readFile(
    path.join(UI_ROOT, 'src', 'tokens', 'base.ts'),
    'utf8',
  );

  assert.match(baseSource, /touchMin:\s*48/);

  const requiredColorKeys = [
    'navy900',
    'cyan500',
    'orange500',
    'primary500',
    'link600',
    'actionPrimary',
    'actionPrimaryPressed',
    'actionSoftPressed',
    'actionSoftPressedText',
    'focusRing',
    'disabledBg',
    'disabledText',
    'surface',
    'surfaceInput',
    'borderSoft',
    'borderStrong',
    'textStrong',
    'textBody',
    'textMuted',
    'infoBg',
    'infoBorder',
    'infoText',
    'successBg',
    'successBorder',
    'successText',
    'warningBg',
    'warningBorder',
    'warningText',
    'criticalBg',
    'criticalBorder',
    'criticalText',
    'criticalSolid',
  ];

  for (const key of requiredColorKeys) {
    assert.match(
      baseSource,
      new RegExp(`\\b${key}:\\s*'#[0-9a-f]{6}'`, 'i'),
      `Falta el token de color hexadecimal ${key} en packages/ui/src/tokens/base.ts`,
    );
  }
});

test('packages/ui index exports all 8 base components and preserves legacy tokens', async () => {
  const indexSource = await readFile(
    path.join(UI_ROOT, 'src', 'index.ts'),
    'utf8',
  );

  for (const symbol of EXPECTED_EXPORTS) {
    assert.match(
      indexSource,
      new RegExp(`\\b${symbol}\\b`),
      `Falta el export ${symbol} en packages/ui/src/index.ts`,
    );
  }

  for (const legacyKey of ['alert', 'success', 'warning', 'highContrast']) {
    assert.match(
      indexSource,
      new RegExp(`\\b${legacyKey}:`),
      `Falta la clave retrocompatible ${legacyKey} en designTokens`,
    );
  }
});

test('BrandLoader reuses exact paths from logotipo-sin-texto.svg and respects reduced motion', async () => {
  const [svgSource, loaderSource] = await Promise.all([
    readFile(
      path.join(UI_ROOT, 'src', 'svg', 'logotipo-sin-texto.svg'),
      'utf8',
    ),
    readFile(
      path.join(
        UI_ROOT,
        'src',
        'components',
        'brand-loader',
        'BrandLoader.tsx',
      ),
      'utf8',
    ),
  ]);

  const svgPaths = [...svgSource.matchAll(/d="([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert.equal(svgPaths.length, 6, 'logotipo-sin-texto.svg debe tener 6 paths');

  for (const pathData of svgPaths) {
    assert.equal(
      loaderSource.includes(pathData),
      true,
      'BrandLoader.tsx debe reutilizar exactamente los trazados de logotipo-sin-texto.svg',
    );
  }

  assert.match(loaderSource, /isReduceMotionEnabled/);
});
