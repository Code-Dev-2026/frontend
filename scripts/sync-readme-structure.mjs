#!/usr/bin/env node
/**
 * Genera el árbol de estructura del README a partir del índice de Git.
 *
 * Uso:
 *   node scripts/sync-readme-structure.mjs            # reescribe el bloque
 *   node scripts/sync-readme-structure.mjs --check    # falla si hay deriva
 *   node scripts/sync-readme-structure.mjs --depth 4  # ajusta la profundidad
 *
 * El bloque generado vive entre los marcadores:
 *   <!-- estructura:inicio -->
 *   <!-- estructura:fin -->
 *
 * No edites ese bloque a mano: cambia la estructura del repositorio y ejecuta
 * `pnpm readme:sync` (o `git add` los archivos nuevos primero).
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const README = path.join(ROOT, 'README.md');

const ARGS = process.argv.slice(2);
const CHECK = ARGS.includes('--check');
const depthIndex = ARGS.indexOf('--depth');
const MAX_DEPTH =
  depthIndex >= 0 && ARGS[depthIndex + 1]
    ? Number.parseInt(ARGS[depthIndex + 1], 10)
    : 3;

const MARKER_START = '<!-- estructura:inicio -->';
const MARKER_END = '<!-- estructura:fin -->';

const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.turbo',
  '.expo',
  '.expo-shared',
  'dist',
  'build',
  'coverage',
]);

const IGNORED_FILES = new Set([
  '.gitkeep',
  '.DS_Store',
  'tsconfig.tsbuildinfo',
]);

function ignoredDir(name) {
  return IGNORED_DIRS.has(name);
}

function ignoredFile(name) {
  return IGNORED_FILES.has(name) || name.endsWith('.tsbuildinfo');
}

function normalize(file) {
  return file.replace(/\\/g, '/');
}

function gitLsFiles() {
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  if (result.error || result.status !== 0) return null;
  return result.stdout.split('\0').filter(Boolean).map(normalize);
}

async function walkFiles() {
  const files = [];

  async function walk(dir, prefix) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (ignoredDir(entry.name)) continue;
        await walk(path.join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.isFile()) {
        files.push(`${prefix}${entry.name}`);
      }
    }
  }

  await walk(ROOT, '');
  return files;
}

async function listFiles() {
  const tracked = gitLsFiles();
  if (tracked) return tracked;
  console.warn(
    'AVISO: `git ls-files` no está disponible; se recorre el sistema de archivos.',
  );
  return walkFiles();
}

function createNode() {
  return { dirs: new Map(), files: new Set() };
}

function addPath(root, file) {
  const segments = normalize(file).split('/').filter(Boolean);
  if (segments.length === 0) return;
  if (segments.some((segment) => ignoredDir(segment))) return;

  let node = root;
  const dirCount = segments.length - 1;
  for (let index = 0; index < dirCount; index += 1) {
    const name = segments[index];
    const depth = index + 1;
    if (depth > MAX_DEPTH) return;
    if (!node.dirs.has(name)) node.dirs.set(name, createNode());
    node = node.dirs.get(name);
    if (depth === MAX_DEPTH) return;
  }

  const name = segments[segments.length - 1];
  if (ignoredFile(name)) return;
  node.files.add(name);
}

function byName(a, b) {
  return a.localeCompare(b, 'es', { sensitivity: 'base' });
}

function renderTree(root) {
  const lines = ['frontend/'];

  function renderChildren(node, prefix) {
    const entries = [
      ...[...node.dirs.keys()]
        .sort(byName)
        .map((name) => ({ name, node: node.dirs.get(name), isDir: true })),
      ...[...node.files]
        .sort(byName)
        .map((name) => ({ name, node: null, isDir: false })),
    ];

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const branch = isLast ? '└─ ' : '├─ ';
      lines.push(`${prefix}${branch}${entry.name}${entry.isDir ? '/' : ''}`);
      if (entry.isDir) {
        renderChildren(entry.node, `${prefix}${isLast ? '   ' : '│  '}`);
      }
    });
  }

  renderChildren(root, '');
  return lines.join('\n');
}

function buildBlock(tree) {
  return `${MARKER_START}\n\n\`\`\`text\n${tree}\n\`\`\`\n\n${MARKER_END}`;
}

function replaceBlock(readme, block) {
  const start = readme.indexOf(MARKER_START);
  const end = readme.indexOf(MARKER_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `No se encontraron los marcadores ${MARKER_START} / ${MARKER_END} en README.md.`,
    );
  }
  return readme.slice(0, start) + block + readme.slice(end + MARKER_END.length);
}

if (!Number.isInteger(MAX_DEPTH) || MAX_DEPTH < 1) {
  console.error('ERROR: --depth debe ser un entero mayor o igual a 1.');
  process.exit(1);
}

if (!existsSync(README)) {
  console.error('ERROR: no existe README.md en la raíz del repositorio.');
  process.exit(1);
}

const files = await listFiles();
const root = createNode();
for (const file of files) addPath(root, file);

const block = buildBlock(renderTree(root));
const current = await readFile(README, 'utf8');
const next = replaceBlock(current, block);

if (CHECK) {
  if (current !== next) {
    console.error(
      'ERROR: la estructura del README.md está desactualizada.\n' +
        'Ejecuta `pnpm readme:sync` y vuelve a intentarlo.',
    );
    process.exit(1);
  }
  console.log('OK: la estructura del README.md está sincronizada.');
  process.exit(0);
}

if (current === next) {
  console.log('OK: la estructura del README.md ya estaba sincronizada.');
  process.exit(0);
}

await writeFile(README, next, 'utf8');
console.log('✔ README.md actualizado con la estructura actual.');
