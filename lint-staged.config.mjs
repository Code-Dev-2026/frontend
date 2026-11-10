/**
 * Validaciones ejecutadas por Husky antes de cada commit.
 *
 * ESLint resuelve la configuración más cercana a cada archivo, por lo que
 * cada workspace puede añadir sus propias reglas sin duplicar comandos.
 *
 * @type {import('lint-staged').Config}
 */
export default {
  '*.{js,cjs,mjs,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md,css,scss,yml,yaml}': ['prettier --write'],
};
