import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { analyzeSvg } from '../scripts/svg-check.mjs';

test('accepts a source brand logo', async () => {
  const logo = await readFile(
    new URL('../src/svg/logo-texto.svg', import.meta.url),
    'utf8',
  );

  assert.deepEqual(analyzeSvg(logo, 'logo-texto.svg').issues, []);
});

test('preserves the viewBox and gradient, mask, and clip-path IDs', () => {
  const illustration = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <defs>
        <linearGradient id="brand-gradient">
          <stop offset="0" stop-color="#023866"/>
          <stop offset="1" stop-color="#0ABAE2"/>
        </linearGradient>
        <mask id="brand-mask"><rect width="24" height="24" fill="white"/></mask>
        <clipPath id="brand-clip"><circle cx="12" cy="12" r="10"/></clipPath>
      </defs>
      <g mask="url(#brand-mask)" clip-path="url(#brand-clip)">
        <path d="M2 2h20v20H2z" fill="url(#brand-gradient)"/>
      </g>
    </svg>
  `;
  const result = analyzeSvg(illustration, 'gradient-illustration.svg');

  assert.deepEqual(result.issues, []);
  assert.match(result.optimizedSvg, /viewBox="0 0 24 24"/);
  assert.match(result.optimizedSvg, /id="brand-gradient"/);
  assert.match(result.optimizedSvg, /id="brand-mask"/);
  assert.match(result.optimizedSvg, /id="brand-clip"/);
});

test('accepts a simple icon without unsupported features', () => {
  const icon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M4 12h16M12 4v16" stroke="currentColor"/>
    </svg>
  `;

  assert.deepEqual(analyzeSvg(icon, 'icon.svg').issues, []);
});

test('reports filters, embedded images, and unoutlined fonts', () => {
  const unsupported = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <filter id="shadow"><feGaussianBlur stdDeviation="1"/></filter>
      <image href="data:image/png;base64,AA==" width="1" height="1"/>
      <text font-family="Inter" x="0" y="12">Text</text>
    </svg>
  `;
  const issues = analyzeSvg(unsupported, 'unsupported.svg').issues.join(' ');

  assert.match(issues, /filtros SVG/i);
  assert.match(issues, /imágenes incrustadas/i);
  assert.match(issues, /convierte los textos a contornos/i);
});
