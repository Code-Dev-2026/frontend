#!/usr/bin/env node
/**
 * Exporta un frame de Figma a docs/design/<app-o-base>/<pantalla>/.
 *
 * Uso:
 *   $env:FIGMA_TOKEN="figd_..."
 *   pnpm figma:export "https://www.figma.com/design/<fileKey>/...?node-id=7-2" base/login [--suffix cargando]
 *
 * Requiere un token personal de Figma con permiso de lectura del archivo.
 * El token se lee de FIGMA_TOKEN o, si no existe, del archivo local
 * .figma-token (ignorado por Git). Nunca se escribe en los archivos exportados.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPS = new Set(['base', 'monitora', 'acudiente', 'portal']);

function usage() {
  console.error(
    [
      'Uso: pnpm figma:export "<url-de-figma>" <app-o-base>/<pantalla> [--suffix <estado>]',
      '',
      'Ejemplo:',
      '  pnpm figma:export "https://www.figma.com/design/abc123/Untitled?node-id=7-2" base/login',
      '  pnpm figma:export "https://www.figma.com/design/abc123/Untitled?node-id=7-8" base/login --suffix error',
      '',
      'Requiere un token personal de Figma en FIGMA_TOKEN o en el archivo local .figma-token.',
    ].join('\n'),
  );
}

function parseFigmaUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('La URL de Figma no es válida.');
  }

  if (!/(^|\.)figma\.com$/i.test(url.hostname)) {
    throw new Error('La URL debe pertenecer a figma.com.');
  }

  const match = url.pathname.match(/^\/(?:design|file)\/([A-Za-z0-9]+)\//);
  if (!match) {
    throw new Error(
      'No se encontró el fileKey. Usa una URL con /design/<fileKey>/ o /file/<fileKey>/.',
    );
  }

  const rawNodeId = url.searchParams.get('node-id');
  if (!rawNodeId) {
    throw new Error(
      'La URL no incluye node-id. Abre el frame en Figma y copia su enlace.',
    );
  }

  const nodeId = rawNodeId.replace(/-/g, ':');
  if (!/^\d+:\d+$/.test(nodeId)) {
    throw new Error(`node-id inválido: ${rawNodeId}`);
  }

  return { fileKey: match[1], nodeId };
}

function parseOutputDir(value) {
  const parts = value.replace(/\\/g, '/').split('/').filter(Boolean);
  if (parts.length !== 2) {
    throw new Error('Indica el destino como <app-o-base>/<pantalla>.');
  }

  const [app, screen] = parts;
  if (!APPS.has(app)) {
    throw new Error(
      `App inválida: ${app}. Usa base, monitora, acudiente o portal.`,
    );
  }
  if (!/^[a-z0-9-]+$/.test(screen)) {
    throw new Error(
      'El nombre de la pantalla debe usar minúsculas, números y guiones.',
    );
  }

  return path.join(ROOT, 'docs', 'design', app, screen);
}

async function figmaGet(token, pathname) {
  const response = await fetch(`https://api.figma.com/v1${pathname}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `Figma API ${response.status} ${response.statusText}` +
        (detail ? `: ${detail.slice(0, 300)}` : ''),
    );
  }
  return response;
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function downloadImage(token, fileKey, nodeId, format, outDir, suffix) {
  const scale = format === 'png' ? '&scale=2' : '';
  const response = await figmaGet(
    token,
    `/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=${format}${scale}`,
  );
  const body = await response.json();
  const imageUrl = body.images?.[nodeId];
  if (!imageUrl) {
    throw new Error(
      `Figma no devolvió una imagen ${format} para el nodo ${nodeId}.`,
    );
  }

  const asset = await fetch(imageUrl);
  if (!asset.ok) {
    throw new Error(`No se pudo descargar la imagen ${format}.`);
  }
  await writeFile(
    path.join(outDir, suffix ? `frame-${suffix}.${format}` : `frame.${format}`),
    Buffer.from(await asset.arrayBuffer()),
  );
}

async function resolveToken() {
  const fromEnv = process.env.FIGMA_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  try {
    const fromFile = (
      await readFile(path.join(ROOT, '.figma-token'), 'utf8')
    ).trim();
    if (fromFile) return fromFile;
  } catch {
    // No hay archivo local .figma-token.
  }

  return null;
}

async function main() {
  const token = await resolveToken();
  const args = process.argv.slice(2);
  const suffixIndex = args.indexOf('--suffix');
  let suffix = '';

  if (suffixIndex !== -1) {
    suffix = args[suffixIndex + 1] ?? '';
    args.splice(suffixIndex, 2);
    if (!/^[a-z0-9-]+$/.test(suffix)) {
      console.error(
        'El sufijo debe usar minúsculas, números y guiones (por ejemplo cargando).',
      );
      process.exit(1);
    }
  }

  const [urlArg, outputArg] = args;

  if (!urlArg || !outputArg) {
    usage();
    process.exit(1);
  }
  if (!token) {
    console.error(
      'Falta el token de Figma. Define FIGMA_TOKEN o crea el archivo local .figma-token con el token (solo lectura).',
    );
    process.exit(1);
  }

  const { fileKey, nodeId } = parseFigmaUrl(urlArg);
  const outDir = parseOutputDir(outputArg);
  await mkdir(outDir, { recursive: true });

  console.log(
    `▶ Exportando ${fileKey} / ${nodeId} → ${path.relative(ROOT, outDir)}`,
  );

  const nodesResponse = await figmaGet(
    token,
    `/files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`,
  );
  const nodes = await nodesResponse.json();
  if (!nodes.nodes?.[nodeId]) {
    throw new Error(`El nodo ${nodeId} no existe o no es accesible.`);
  }
  delete nodes.thumbnailUrl;
  await writeJson(
    path.join(outDir, suffix ? `figma-node-${suffix}.json` : 'figma-node.json'),
    nodes,
  );

  if (!suffix) {
    try {
      const stylesResponse = await figmaGet(token, `/files/${fileKey}/styles`);
      await writeJson(
        path.join(outDir, 'figma-styles.json'),
        await stylesResponse.json(),
      );
    } catch (error) {
      console.warn(`⚠ No se pudieron exportar los estilos: ${error.message}`);
    }
  }

  await downloadImage(token, fileKey, nodeId, 'png', outDir, suffix);
  await downloadImage(token, fileKey, nodeId, 'svg', outDir, suffix);

  console.log(suffix ? `✔ Frame exportado (${suffix}).` : '✔ Frame exportado.');
  if (!suffix) {
    console.log(
      'Completa en la misma carpeta: textos.md, tokens.json, medidas.md, estados.md y los SVG individuales.',
    );
  }
}

main().catch((error) => {
  console.error(`✖ ${error.message}`);
  process.exit(1);
});
