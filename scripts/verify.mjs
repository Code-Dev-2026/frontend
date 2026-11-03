#!/usr/bin/env node
/**
 * Verificación completa del frontend, sin bash.
 *
 * Uso:
 *   node scripts/verify.mjs
 *   node scripts/verify.mjs --no-install
 *   node scripts/verify.mjs --skip-build
 */
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const ARGS = new Set(process.argv.slice(2));
const NO_INSTALL = ARGS.has('--no-install');
const SKIP_BUILD = ARGS.has('--skip-build');
const IS_WINDOWS = process.platform === 'win32';
const PNPM = IS_WINDOWS ? 'pnpm.cmd' : 'pnpm';

function needsShell(command) {
  // En Windows los .cmd (pnpm.cmd) exigen shell; el ejecutable de Node no.
  // Usar shell con process.execPath parte la ruta en "C:\Program Files\...".
  return IS_WINDOWS && /\.cmd$/i.test(command);
}

function run(name, command, args) {
  console.log(`\n▶ ${name}: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: needsShell(command),
    env: process.env
  });
  if (result.error) {
    console.error(`✖ ${name}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`✖ ${name} falló (código ${result.status ?? 'señal'}).`);
    process.exit(result.status ?? 1);
  }
}

const steps = [];
if (!NO_INSTALL) steps.push(['install', PNPM, ['install', '--frozen-lockfile']]);
steps.push(['lint', PNPM, ['lint']]);
steps.push(['typecheck', PNPM, ['typecheck']]);
steps.push(['test', PNPM, ['test']]);
if (!SKIP_BUILD) steps.push(['build', PNPM, ['build']]);
steps.push(['invariantes', process.execPath, ['scripts/check-invariants.mjs']]);
steps.push(['espejo backend', process.execPath, ['scripts/sync-backend-ref.mjs', '--check']]);

for (const [name, command, args] of steps) run(name, command, args);

console.log('\n✔ Verificación completa en verde.');
