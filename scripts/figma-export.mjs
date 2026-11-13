#!/usr/bin/env node
/**
 * Exporta un frame de Figma a docs/design/<app>/<pantalla>/.
 *
 * Uso:
 *   $env:FIGMA_TOKEN="figd_..."
 *   pnpm figma:export "https://www.figma.com/design/<fileKey>/...?node-id=7-2" monitora/login
 *
 * Requiere un token personal de Figma con permiso de lectura del archivo.
 * El token solo se lee de FIGMA_TOKEN y nunca se escribe en disco.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPS = new Set(['monitora', 'acudiente', 'portal']);

function usage() {
  console.error(
    [
      'Uso: pnpm figma:export "<url-de-figma>" <app>/<pantalla>',
      '',
      'Ejemplo:',
      '  pnpm figma:export "https://www.figma.com/design/abc123/Untitled?node-id=7-2" monitora/login',
      '',
      'Requiere la variable de entorno FIGMA_TOKEN con un token personal de Figma.',
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
    throw new Error('Indica el destino como <app>/<pantalla>.');
  }

  const [app, screen] = parts;
  if (!APPS.has(app)) {
    throw new Error(`App inválida: ${app}. Usa monitora, acudiente o portal.`);
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

async function downloadImage(token, fileKey, nodeId, format, outDir) {
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
    path.join(outDir, `frame.${format}`),
    Buffer.from(await asset.arrayBuffer()),
  );
}

async function main() {
  const token = process.env.FIGMA_TOKEN?.trim();
  const [urlArg, outputArg] = process.argv.slice(2);

  if (!urlArg || !outputArg) {
    usage();
    process.exit(1);
  }
  if (!token) {
    console.error(
      'Falta FIGMA_TOKEN. Genera un token personal con lectura de archivos en Figma → Settings → Security.',
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
  await writeJson(path.join(outDir, 'figma-node.json'), nodes);

  try {
    const stylesResponse = await figmaGet(token, `/files/${fileKey}/styles`);
    await writeJson(
      path.join(outDir, 'figma-styles.json'),
      await stylesResponse.json(),
    );
  } catch (error) {
    console.warn(`⚠ No se pudieron exportar los estilos: ${error.message}`);
  }

  await downloadImage(token, fileKey, nodeId, 'png', outDir);
  await downloadImage(token, fileKey, nodeId, 'svg', outDir);

  console.log('✔ Frame exportado.');
  console.log(
    'Completa en la misma carpeta: textos.md, tokens.json, medidas.md, estados.md y los SVG individuales.',
  );
}

main().catch((error) => {
  console.error(`✖ ${error.message}`);
  process.exit(1);
});
