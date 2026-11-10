import { fileURLToPath } from 'node:url';
import sharedConfig from '@camino/config/eslint.config.mjs';
import nextPlugin from '@next/eslint-plugin-next';

const nextConfigs = nextPlugin.flatConfig;
const rootDir = fileURLToPath(new URL('.', import.meta.url));

/**
 * Configuración del portal: reglas compartidas del monorepo + reglas
 * específicas de Next.js.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  ...sharedConfig,
  nextConfigs.coreWebVitals,
  {
    settings: {
      next: {
        rootDir,
      },
    },
  },
];
