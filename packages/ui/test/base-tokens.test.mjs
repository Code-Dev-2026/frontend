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
  'Card',
  'Badge',
  'Modal',
  'Dialog',
  'Banner',
  'Input',
  'EmptyState',
  'Icon',
  'ICON_NAMES',
  'UiCatalogScreen',
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

test('base tokens align with Figma tokens.json colors and RNF-04 touch minimum', async () => {
  const [baseSource, tokensJsonRaw] = await Promise.all([
    readFile(path.join(UI_ROOT, 'src', 'tokens', 'base.ts'), 'utf8'),
    readFile(
      path.resolve(UI_ROOT, '../../docs/design/base/componentes/tokens.json'),
      'utf8',
    ),
  ]);

  const figmaTokens = JSON.parse(tokensJsonRaw);
  assert.equal(figmaTokens.layout['cs/touch-min'], 48);
  assert.match(baseSource, /touchMin:\s*48/);

  for (const hex of Object.values(figmaTokens.colors)) {
    assert.equal(
      baseSource.toLowerCase().includes(String(hex).toLowerCase()),
      true,
      `El color de Figma ${hex} debe existir en packages/ui/src/tokens/base.ts`,
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
