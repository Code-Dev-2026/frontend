#!/usr/bin/env node
/**
 * Invariantes del frontend + validación de specs.
 * No usa bash: funciona en Windows, Linux y CI.
 *
 * Uso:
 *   node scripts/check-invariants.mjs
 *   node scripts/check-invariants.mjs --specs-only
 *   node scripts/check-invariants.mjs --source-only
 *   node scripts/check-invariants.mjs --json
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const JSON_OUT = ARGS.has('--json');
const SPECS_ONLY = ARGS.has('--specs-only');
const SOURCE_ONLY = ARGS.has('--source-only');

const SOURCE_DIRS = ['apps', 'packages'];
const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json']);
const SKIP_DIRS = new Set([
  'node_modules', '.next', 'dist', 'build', 'coverage', '.turbo', '.git', '.expo', '.expo-shared'
]);
const SKIP_FILE = /(\.test\.|\.spec\.|__tests__)/;

const RULES = [
  {
    id: 'storage',
    pattern: /\b(?:localStorage|sessionStorage)\b/,
    message: 'Prohibido guardar tokens o datos personales en localStorage/sessionStorage (RNF-01, RNF-02).'
  },
  {
    id: 'mqtt',
    pattern: /\bmqtt\b/i,
    message: 'Prohibido MQTT en clientes frontend; el tiempo real es Socket.IO.'
  },
  {
    id: 'geo-continua',
    pattern: /\b(?:watchPosition|watchPositionAsync)\b/,
    message: 'Prohibida la geolocalización continua en móviles (RNF-07).'
  },
  {
    id: 'private-key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    message: 'No se permite una clave privada en el repositorio.'
  },
  {
    id: 'aws-key',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
    message: 'Posible clave de AWS en el código; usa variables de entorno.'
  }
];

const SPEC_STATES = new Set([
  'borrador', 'en-revision', 'aprobada', 'implementada', 'verificada', 'archivada'
]);
const SPEC_APPS = new Set(['portal', 'acudiente', 'monitora', 'packages', 'transversal']);
const REQ_ID = /^(?:RF|RNF|RN|HU)-\d{2}$/;

const errors = [];
const warnings = [];
let scannedFiles = 0;
let checkedSpecs = 0;

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
              message: rule.message
            });
          }
        }
      });
    });
  }
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const data = {};
  let currentKey = null;
  for (const raw of match[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const item = raw.match(/^\s*-\s+(.+)$/);
    if (item && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(stripQuotes(item[1].trim()));
      continue;
    }
    const pair = raw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    currentKey = pair[1];
    const value = pair[2].trim();
    if (!value) {
      data[currentKey] = [];
      continue;
    }
    const inline = value.match(/^\[(.*)\]$/);
    if (inline) {
      data[currentKey] = inline[1]
        .split(',')
        .map((part) => stripQuotes(part.trim()))
        .filter(Boolean);
    } else {
      data[currentKey] = stripQuotes(value);
    }
  }
  return data;
}

function stripQuotes(value) {
  return value.replace(/^['"]|['"]$/g, '');
}

async function loadSrsIds() {
  const mirror = path.join(ROOT, 'docs', 'backend-ref', 'srs.md');
  if (!existsSync(mirror)) {
    warnings.push('No existe docs/backend-ref/srs.md: no se pueden validar los IDs de las specs.');
    return null;
  }
  const text = await readFile(mirror, 'utf8');
  const ids = new Set();
  for (const match of text.matchAll(/\b(?:RF|RNF|RN|HU)-\d{2}\b/g)) ids.add(match[0]);
  return ids;
}

async function checkSpecs() {
  const specsDir = path.join(ROOT, 'specs');
  if (!existsSync(specsDir)) {
    warnings.push('No existe specs/: no hay specs que validar.');
    return;
  }
  const srsIds = await loadSrsIds();
  const entries = await readdir(specsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === '_template') continue;
    if (!/^\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name)) {
      warnings.push(`specs/${entry.name}: el nombre no cumple NNN-<app>-<feature>.`);
      continue;
    }
    checkedSpecs += 1;
    const dir = path.join(specsDir, entry.name);
    const specFile = path.join(dir, 'spec.md');
    if (!existsSync(specFile)) {
      errors.push({ kind: 'spec', file: `specs/${entry.name}`, message: 'Falta spec.md.' });
      continue;
    }
    const text = await readFile(specFile, 'utf8');
    const meta = parseFrontmatter(text);
    if (!meta) {
      errors.push({ kind: 'spec', file: rel(specFile), message: 'Falta el frontmatter.' });
      continue;
    }
    if (!SPEC_STATES.has(meta.state)) {
      errors.push({ kind: 'spec', file: rel(specFile), message: `state inválido: ${meta.state ?? '(vacío)'}.` });
    }
    if (!SPEC_APPS.has(meta.app)) {
      errors.push({ kind: 'spec', file: rel(specFile), message: `app inválida: ${meta.app ?? '(vacío)'}.` });
    }
    const requirements = (Array.isArray(meta.requirements) ? meta.requirements : [meta.requirements])
      .filter(Boolean);
    const valid = requirements.filter((id) => REQ_ID.test(id));
    if (valid.length === 0) {
      errors.push({ kind: 'spec', file: rel(specFile), message: 'Debe citar al menos un RF/RNF/RN/HU.' });
    }
    for (const id of valid) {
      if (!REQ_ID.test(id)) continue;
      if (srsIds && !srsIds.has(id)) {
        errors.push({ kind: 'spec', file: rel(specFile), message: `El requisito ${id} no existe en el SRS.` });
      }
    }
    if (meta.state !== 'borrador') {
      if (!existsSync(path.join(dir, 'plan.md'))) {
        errors.push({ kind: 'spec', file: `specs/${entry.name}`, message: `Falta plan.md para state=${meta.state}.` });
      }
      if (!existsSync(path.join(dir, 'tasks.md'))) {
        errors.push({ kind: 'spec', file: `specs/${entry.name}`, message: `Falta tasks.md para state=${meta.state}.` });
      }
    }
    if (meta.state === 'implementada' || meta.state === 'verificada') {
      const tasksFile = path.join(dir, 'tasks.md');
      if (existsSync(tasksFile)) {
        const tasks = await readFile(tasksFile, 'utf8');
        if (!/^- \[x\]/im.test(tasks)) {
          errors.push({ kind: 'spec', file: rel(tasksFile), message: 'No hay tareas marcadas como completadas.' });
        }
      }
    }
    if (meta.state === 'verificada') {
      const evidenceDir = path.join(dir, 'evidence');
      const evidenceOk = existsSync(evidenceDir)
        && (await readdir(evidenceDir)).some((name) => name !== 'README.md');
      if (!evidenceOk) {
        errors.push({ kind: 'spec', file: `specs/${entry.name}`, message: 'state=verificada sin evidencia.' });
      }
    }
  }
}

function printResults() {
  if (JSON_OUT) {
    console.log(JSON.stringify({ scannedFiles, checkedSpecs, errors, warnings }, null, 2));
    return;
  }
  console.log(`Archivos de código escaneados: ${scannedFiles}`);
  console.log(`Specs validadas: ${checkedSpecs}`);
  for (const warning of warnings) console.warn(`AVISO: ${warning}`);
  for (const error of errors) {
    const where = error.line ? `${error.file}:${error.line}` : error.file;
    console.error(`ERROR [${error.kind}] ${where} — ${error.message}`);
  }
  if (errors.length === 0) {
    console.log('OK: invariantes y specs sin errores.');
  } else {
    console.error(`Fallaron ${errors.length} comprobación(es).`);
  }
}

if (!SOURCE_ONLY) await checkSpecs();
if (!SPECS_ONLY) await scanSources();
printResults();
process.exit(errors.length === 0 ? 0 : 1);
