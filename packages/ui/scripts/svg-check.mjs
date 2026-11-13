import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimize } from 'svgo';
import svgoConfig from '../svgo.config.js';

const SVG_DIR = path.resolve(
  fileURLToPath(new URL('../src/svg/', import.meta.url)),
);

function getViewBox(svg) {
  return svg.match(/<svg\b[^>]*\bviewBox=(["'])(.*?)\1/i)?.[2] ?? null;
}

function getProtectedIds(svg) {
  return new Set(
    [
      ...svg.matchAll(
        /<(?:linearGradient|radialGradient|mask|clipPath)\b[^>]*\bid=(["'])(.*?)\1/gi,
      ),
    ].map((match) => match[2]),
  );
}

function getReferencedIds(svg) {
  return new Set([
    ...[...svg.matchAll(/url\(\s*#([^)]+)\s*\)/gi)].map((match) => match[1]),
    ...[...svg.matchAll(/(?:href|xlink:href)=(["'])#(.*?)\1/gi)].map(
      (match) => match[2],
    ),
  ]);
}

export function analyzeSvg(svg, filePath = 'asset.svg') {
  const issues = [];

  if (!/<svg\b/i.test(svg)) {
    issues.push('Falta el elemento raíz <svg>.');
  }
  if (!getViewBox(svg)) {
    issues.push('Falta viewBox; el componente no tendrá una escala confiable.');
  }
  if (/<filter\b|\bfilter\s*=/i.test(svg)) {
    issues.push(
      'Contiene filtros SVG que no son compatibles con React Native.',
    );
  }
  if (/<image\b|data:image\//i.test(svg)) {
    issues.push(
      'Contiene imágenes incrustadas; expórtalas como SVG independiente.',
    );
  }
  if (/<(?:text|textPath)\b|\bfont-(?:family|size|weight)\s*=/i.test(svg)) {
    issues.push(
      'Contiene texto o fuentes; convierte los textos a contornos en Figma.',
    );
  }

  const optimizedSvg = optimize(svg, {
    ...svgoConfig,
    path: filePath,
  }).data;
  const sourceViewBox = getViewBox(svg);
  const optimizedViewBox = getViewBox(optimizedSvg);

  if (sourceViewBox && sourceViewBox !== optimizedViewBox) {
    issues.push('SVGO modificó o eliminó viewBox.');
  }

  const optimizedIds = getProtectedIds(optimizedSvg);
  for (const id of getProtectedIds(svg)) {
    if (!optimizedIds.has(id)) {
      issues.push(`SVGO modificó o eliminó el ID de recurso "${id}".`);
    }
  }

  const optimizedReferences = getReferencedIds(optimizedSvg);
  for (const id of getReferencedIds(svg)) {
    if (!optimizedReferences.has(id)) {
      issues.push(`SVGO modificó o eliminó la referencia al ID "${id}".`);
    }
  }

  return { issues, optimizedSvg };
}

async function findSvgFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findSvgFiles(entryPath)));
    } else if (
      entry.isFile() &&
      path.extname(entry.name).toLowerCase() === '.svg'
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

export async function runSvgCheck() {
  const files = await findSvgFiles(SVG_DIR);
  if (files.length === 0) {
    console.error('No se encontraron archivos SVG en packages/ui/src/svg/.');
    process.exitCode = 1;
    return;
  }

  let issueCount = 0;
  for (const filePath of files) {
    const svg = await readFile(filePath, 'utf8');
    const { issues } = analyzeSvg(svg, filePath);
    if (issues.length === 0) {
      console.log(`OK ${path.relative(SVG_DIR, filePath).replace(/\\/g, '/')}`);
      continue;
    }

    issueCount += issues.length;
    const relativePath = path.relative(SVG_DIR, filePath).replace(/\\/g, '/');
    for (const issue of issues) {
      console.error(`ERROR ${relativePath}: ${issue}`);
    }
  }

  if (issueCount > 0) {
    process.exitCode = 1;
  } else {
    console.log(`OK: ${files.length} SVG revisados.`);
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await runSvgCheck();
}
