#!/usr/bin/env node
/**
 * Invariantes de seguridad y arquitectura del frontend.
 * No usa bash: funciona en Windows, Linux y CI.
 *
 * Uso:
 *   node scripts/check-invariants.mjs
 *   node scripts/check-invariants.mjs --json
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const JSON_OUT = ARGS.has('--json');

const SOURCE_DIRS = ['apps', 'packages'];
const SOURCE_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
]);
const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  'coverage',
  '.turbo',
  '.git',
  '.expo',
  '.expo-shared',
  'android',
  'ios',
]);
const SKIP_FILE = /(\.test\.|\.spec\.|__tests__)/;

const RULES = [
  {
    id: 'storage',
    pattern: /\b(?:localStorage|sessionStorage)\b/,
    message:
      'Prohibido guardar tokens o datos personales en localStorage/sessionStorage (RNF-01, RNF-02).',
  },
  {
    id: 'mqtt',
    pattern: /\bmqtt\b/i,
    message:
      'Prohibido MQTT en clientes frontend; el tiempo real es Socket.IO.',
  },
  {
    id: 'geo-continua',
    pattern: /\b(?:watchPosition|watchPositionAsync)\b/,
    message: 'Prohibida la geolocalización continua en móviles (RNF-07).',
  },
  {
    id: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    message: 'No se permite una clave privada en el repositorio.',
  },
  {
    id: 'aws-key',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
    message: 'Posible clave de AWS en el código; usa variables de entorno.',
  },
];

const errors = [];
const warnings = [];
let scannedFiles = 0;

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

async function walk(dir, visit) {
  if (!existsSync(dir)) return;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env.example') {
      if (SKIP_DIRS.has(entry.name)) continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      await walk(full, visit);
    } else if (entry.isFile()) {
      await visit(full);
    }
  }
}

async function scanSources() {
  for (const dirName of SOURCE_DIRS) {
    await walk(path.join(ROOT, dirName), async (file) => {
      if (!SOURCE_EXT.has(path.extname(file))) return;
      if (SKIP_FILE.test(file)) return;
      scannedFiles += 1;
      const text = await readFile(file, 'utf8');
      const lines = text.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (line.includes('invariants-allow')) return;
        for (const rule of RULES) {
          if (rule.pattern.test(line)) {
            errors.push({
              kind: `invariante:${rule.id}`,
              file: rel(file),
              line: index + 1,
              message: rule.message,
            });
          }
        }
      });
    });
  }
}

function printResults() {
  if (JSON_OUT) {
    console.log(JSON.stringify({ scannedFiles, errors, warnings }, null, 2));
    return;
  }
  console.log(`Archivos de código escaneados: ${scannedFiles}`);
  for (const warning of warnings) console.warn(`AVISO: ${warning}`);
  for (const error of errors) {
    const where = error.line ? `${error.file}:${error.line}` : error.file;
    console.error(`ERROR [${error.kind}] ${where} — ${error.message}`);
  }
  if (errors.length === 0) {
    console.log('OK: invariantes de seguridad sin errores.');
  } else {
    console.error(`Fallaron ${errors.length} comprobación(es).`);
  }
}

await scanSources();
printResults();
process.exit(errors.length === 0 ? 0 : 1);
