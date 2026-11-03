#!/usr/bin/env node
/**
 * Sincroniza los documentos canónicos del backend hacia docs/backend-ref/.
 *
 * Uso:
 *   node scripts/sync-backend-ref.mjs            # escribe los espejos habilitados
 *   node scripts/sync-backend-ref.mjs --check    # falla si hay deriva
 *   node scripts/sync-backend-ref.mjs --all      # incluye los pendientes de mover
 *
 * Variables:
 *   BACKEND_DOCS_DIR  ruta al docs/ del backend (por defecto ../backend/docs)
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const ARGS = new Set(process.argv.slice(2));
const CHECK = ARGS.has("--check");
const ALL = ARGS.has("--all");
const REQUIRE_SOURCE = ARGS.has("--require-source");

const SOURCE_DIR = process.env.BACKEND_DOCS_DIR
  ? path.resolve(process.env.BACKEND_DOCS_DIR)
  : path.resolve(ROOT, "..", "backend", "docs");
const DEST_DIR = path.resolve(ROOT, "docs", "backend-ref");
const REPO_ROOT = path.resolve(SOURCE_DIR, "..");

const MIRRORS = [
  { file: "srs.md", enabled: true },
  { file: "er.md", enabled: true },
  { file: "trazabilidad-srs.md", enabled: true },
  { file: "supuestos-y-propuestas.md", enabled: true },
  { file: "contrato-backend-frontend.md", enabled: true },
];

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

// `--check` compara el contenido, no el banner: el banner fija el HEAD del
// backend y cambiaría con cualquier commit ajeno al documento.
const BANNER_SEPARATOR = Buffer.from("\n\n---\n\n");

function readMirror(buffer) {
  const index = buffer.indexOf(BANNER_SEPARATOR);
  if (index === -1) return null;
  return {
    header: buffer.subarray(0, index).toString("utf8"),
    body: buffer.subarray(index + BANNER_SEPARATOR.length),
  };
}

function git(args) {
  const result = spawnSync("git", ["-C", REPO_ROOT, ...args], {
    encoding: "utf8",
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function buildBanner(file, hash) {
  const commit = git(["rev-parse", "--short", "HEAD"]) || "sin-commit";
  const relative = path
    .relative(REPO_ROOT, path.join(SOURCE_DIR, file))
    .replace(/\\/g, "/");
  const dirty = git(["status", "--porcelain", "--", relative]);
  const dirtyNote = dirty ? " (árbol de trabajo con cambios sin commit)" : "";
  return [
    "> ESPEJO DE SOLO LECTURA — no editar aquí.",
    `> Fuente: \`Code-Dev-2026/backend\` → \`docs/${file}\` @ \`${commit}\`${dirtyNote}`,
    `> SHA-256 del canónico: \`${hash}\``,
    "> Se actualiza en el mismo PR que cambie el documento canónico.",
    "",
    "---",
    "",
    "",
  ].join("\n");
}

if (!existsSync(SOURCE_DIR)) {
  const message = `No existe el directorio canónico: ${SOURCE_DIR}`;
  if (REQUIRE_SOURCE) {
    console.error(`ERROR: ${message}`);
    process.exit(1);
  }
  console.warn(`AVISO: ${message}. Se omite la sincronización.`);
  process.exit(0);
}

let checked = 0;
let written = 0;
let drifted = 0;

for (const mirror of MIRRORS) {
  if (!mirror.enabled && !ALL) {
    continue;
  }
  const sourceFile = path.join(SOURCE_DIR, mirror.file);
  const destFile = path.join(DEST_DIR, mirror.file);
  if (!existsSync(sourceFile)) {
    console.warn(`AVISO: falta ${path.relative(ROOT, sourceFile)}; se omite.`);
    continue;
  }
  checked += 1;
  const sourceBytes = await readFile(sourceFile);
  const hash = sha256(sourceBytes);
  const banner = buildBanner(mirror.file, hash);
  const expected = Buffer.concat([Buffer.from(banner, "utf8"), sourceBytes]);

  if (CHECK) {
    if (!existsSync(destFile)) {
      console.error(`DERIVA: falta ${path.relative(ROOT, destFile)}.`);
      drifted += 1;
      continue;
    }
    const current = await readFile(destFile);
    const mirror = readMirror(current);
    const expectedHashLine = `SHA-256 del canónico: \`${hash}\``;
    if (!mirror || !mirror.header.includes(expectedHashLine)) {
      console.error(
        `DERIVA: ${path.relative(ROOT, destFile)} tiene una cabecera inválida.`,
      );
      drifted += 1;
      continue;
    }
    if (sha256(mirror.body) !== hash) {
      console.error(
        `DERIVA: ${path.relative(ROOT, destFile)} no coincide. ` +
          `canónico=${hash.slice(0, 12)} espejo=${sha256(mirror.body).slice(0, 12)}`,
      );
      drifted += 1;
    }
    continue;
  }

  await mkdir(DEST_DIR, { recursive: true });
  await writeFile(destFile, expected);
  written += 1;
  console.log(`✔ ${path.relative(ROOT, destFile)} (${hash.slice(0, 12)})`);
}

if (CHECK) {
  if (drifted === 0) {
    console.log(`OK: ${checked} espejo(s) al día.`);
  } else {
    console.error(
      `Fallaron ${drifted} espejo(s). Ejecuta: node scripts/sync-backend-ref.mjs`,
    );
    process.exit(1);
  }
} else {
  console.log(`OK: ${written} espejo(s) escrito(s), ${checked} verificado(s).`);
  for (const mirror of MIRRORS) {
    if (!mirror.enabled && !ALL)
      console.log(`  · ${mirror.note ?? mirror.file}`);
  }
}
