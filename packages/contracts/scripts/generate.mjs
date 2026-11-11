#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import {
  cp,
  mkdtemp,
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PACKAGE_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const SOURCE_URL = process.env.BACKEND_OPENAPI_URL;
const SYNC_SNAPSHOT = process.argv.includes('--sync-openapi');
const SNAPSHOT_PATH = path.join(PACKAGE_DIR, 'openapi.json');
const GENERATED_PATH = path.join(PACKAGE_DIR, 'src', 'generated');
const ORVAL_CLI = path.join(
  PACKAGE_DIR,
  'node_modules',
  'orval',
  'dist',
  'bin',
  'orval.js',
);
const PRETTIER_CLI = path.join(
  PACKAGE_DIR,
  '..',
  '..',
  'node_modules',
  'prettier',
  'bin',
  'prettier.cjs',
);

const API_TAGS = {
  'Identidad y Autenticación (Sprint 1)': 'auth',
  'Expedientes de Estudiantes (Sprint 1)': 'students',
  'Instituciones Educativas (Sprint 1)': 'schools',
  'Empresas Transportadoras y Flota (Sprint 1)': 'transport-companies',
  'Rutas Escolares y Georreferenciación (Sprint 2)': 'routes',
  'Viajes y Monitoreo Operativo (Sprint 2)': 'trips',
  'Cadena de Custodia Física y FSM (Sprint 2)': 'custody',
  'Control de Asistencia y Aforo QR (Sprint 2)': 'attendance',
  'Pasajeros Ocasionales (Sprint 3)': 'passengers',
  'Telemetría IoT Vehicular (Sprint 3)': 'telemetry',
  'Tracking en Tiempo Real y ETA (Sprint 3)': 'tracking',
  'Despacho de Notificaciones (Sprint 3)': 'notifications',
  'Sincronización Offline e Idempotencia (Sprint 4)': 'offline',
  'Auditoría Forense Inmutable WORM (Sprint 4)': 'audit',
  'Facturación y Segregación Financiera (Sprint 4)': 'billing-isolation',
  auth: 'auth',
  students: 'students',
  schools: 'schools',
  transportCompanies: 'transport-companies',
  'transport-companies': 'transport-companies',
  routes: 'routes',
  trips: 'trips',
  custody: 'custody',
  attendance: 'attendance',
  passengers: 'passengers',
  telemetry: 'telemetry',
  tracking: 'tracking',
  notifications: 'notifications',
  offline: 'offline',
  audit: 'audit',
  billingIsolation: 'billing-isolation',
  'billing-isolation': 'billing-isolation',
};

function normalizeOpenApi(document) {
  const normalizeTag = (tag) => {
    const mapped = API_TAGS[tag];
    if (!mapped) {
      throw new Error(
        `El tag OpenAPI "${tag}" no tiene módulo cliente asignado.`,
      );
    }
    return mapped;
  };

  if (Array.isArray(document.tags)) {
    const normalizedTags = new Map();
    for (const tag of document.tags) {
      const name = normalizeTag(tag.name);
      if (!normalizedTags.has(name)) {
        normalizedTags.set(name, { ...tag, name });
      }
    }
    document.tags = [...normalizedTags.values()];
  }

  const methods = new Set([
    'get',
    'put',
    'post',
    'delete',
    'options',
    'head',
    'patch',
    'trace',
  ]);
  for (const [route, pathItem] of Object.entries(document.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!methods.has(method)) continue;
      if (!Array.isArray(operation.tags) || operation.tags.length === 0) {
        throw new Error(
          `La operación ${method.toUpperCase()} ${route} no tiene tag OpenAPI.`,
        );
      }
      operation.tags = operation.tags.map(normalizeTag);
    }
  }
  return document;
}

function createMocksIndex(tags) {
  const modules = [...new Set(tags)].sort();
  const imports = modules.map((tag) => {
    const exportName = tag
      .split('-')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('');
    return `import { get${exportName}Mock } from '../endpoints/${tag}/${tag}.msw';`;
  });
  const namedExports = modules.map((tag) => {
    const exportName = tag
      .split('-')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('');
    return `  get${exportName}Mock,`;
  });
  const exports = modules.map((tag) => {
    const exportName = tag
      .split('-')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join('');
    return `  ...get${exportName}Mock(),`;
  });

  return `${imports.join('\n')}\n\nexport {\n${namedExports.join('\n')}\n};\n\nexport const handlers = [\n${exports.join('\n')}\n];\n`;
}

function runNode(script, args, env) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: PACKAGE_DIR,
    env,
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${path.basename(script)} terminó con código ${result.status}.`,
    );
  }
}

async function syncGeneratedOutput(source, destination) {
  await syncDirectory(source, destination);
}

async function syncDirectory(source, destination) {
  await mkdir(destination, { recursive: true });
  const sourceEntries = await readdir(source, { withFileTypes: true });
  const sourceNames = new Set(sourceEntries.map((entry) => entry.name));

  for (const entry of await readdir(destination, { withFileTypes: true })) {
    if (!sourceNames.has(entry.name)) {
      await rm(path.join(destination, entry.name), {
        recursive: true,
        force: true,
      });
    }
  }

  for (const entry of sourceEntries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      if (
        existsSync(destinationPath) &&
        !(await stat(destinationPath)).isDirectory()
      ) {
        await rm(destinationPath, { force: true });
      }
      await syncDirectory(sourcePath, destinationPath);
      continue;
    }

    if (
      existsSync(destinationPath) &&
      (await stat(destinationPath)).isDirectory()
    ) {
      await rm(destinationPath, { recursive: true, force: true });
    }
    await cp(sourcePath, destinationPath, { force: true });
  }
}

if (SYNC_SNAPSHOT && !SOURCE_URL) {
  throw new Error(
    'Define BACKEND_OPENAPI_URL para sincronizar el snapshot de OpenAPI.',
  );
}

const stageDir = await mkdtemp(
  path.join(PACKAGE_DIR, 'src', '.generated-stage-'),
);
let snapshotTempPath;
let backupDir;
let generatedUpdated = false;
let hadGeneratedOutput = false;

try {
  let openApiPath = SNAPSHOT_PATH;
  let openApiDocument;

  if (SOURCE_URL) {
    const response = await fetch(SOURCE_URL);
    if (!response.ok) {
      throw new Error(
        `No se pudo descargar OpenAPI: HTTP ${response.status} ${response.statusText}.`,
      );
    }

    const content = await response.text();
    openApiDocument = JSON.parse(content);
  } else {
    openApiDocument = JSON.parse(await readFile(SNAPSHOT_PATH, 'utf8'));
  }
  if (
    typeof openApiDocument !== 'object' ||
    openApiDocument === null ||
    typeof openApiDocument.openapi !== 'string' ||
    typeof openApiDocument.paths !== 'object' ||
    openApiDocument.paths === null
  ) {
    throw new Error('La fuente no devolvió un documento OpenAPI válido.');
  }
  openApiDocument = normalizeOpenApi(openApiDocument);

  openApiPath = path.join(stageDir, 'openapi.json');
  await writeFile(openApiPath, `${JSON.stringify(openApiDocument, null, 2)}\n`);

  const env = {
    ...process.env,
    BACKEND_OPENAPI_FILE: openApiPath,
    BACKEND_GENERATED_DIR: stageDir,
  };
  delete env.BACKEND_OPENAPI_URL;

  runNode(ORVAL_CLI, ['--config', './orval.config.ts'], env);
  runNode(
    PRETTIER_CLI,
    [
      '--write',
      path.join(stageDir, 'endpoints'),
      path.join(stageDir, 'models'),
    ],
    env,
  );

  const operationTags = Object.values(openApiDocument.paths).flatMap(
    (pathItem) =>
      Object.entries(pathItem)
        .filter(([method]) =>
          [
            'get',
            'put',
            'post',
            'delete',
            'options',
            'head',
            'patch',
            'trace',
          ].includes(method),
        )
        .flatMap(([, operation]) => operation.tags),
  );
  await mkdir(path.join(stageDir, 'mocks'), { recursive: true });
  await writeFile(
    path.join(stageDir, 'mocks', 'index.ts'),
    createMocksIndex(operationTags),
  );
  await rm(openApiPath, { force: true });
  runNode(
    PRETTIER_CLI,
    ['--write', path.join(stageDir, 'mocks', 'index.ts')],
    env,
  );

  if (existsSync(GENERATED_PATH)) {
    hadGeneratedOutput = true;
    backupDir = await mkdtemp(
      path.join(PACKAGE_DIR, 'src', '.generated-backup-'),
    );
    await syncGeneratedOutput(GENERATED_PATH, backupDir);
  }
  generatedUpdated = true;
  await syncGeneratedOutput(stageDir, GENERATED_PATH);

  if (SYNC_SNAPSHOT && SOURCE_URL) {
    snapshotTempPath = path.join(PACKAGE_DIR, `.openapi-${process.pid}.json`);
    await writeFile(
      snapshotTempPath,
      `${JSON.stringify(openApiDocument, null, 2)}\n`,
    );
    runNode(PRETTIER_CLI, ['--write', snapshotTempPath], env);
    await rename(snapshotTempPath, SNAPSHOT_PATH);
    snapshotTempPath = undefined;
  }
} catch (error) {
  if (generatedUpdated) {
    if (hadGeneratedOutput && backupDir) {
      await syncGeneratedOutput(backupDir, GENERATED_PATH);
    } else {
      await rm(GENERATED_PATH, { recursive: true, force: true });
    }
  }
  throw error;
} finally {
  if (snapshotTempPath) await rm(snapshotTempPath, { force: true });
  if (existsSync(stageDir))
    await rm(stageDir, { recursive: true, force: true });
  if (backupDir) await rm(backupDir, { recursive: true, force: true });
}
