// Metro en monorepo: Expo SDK 52 ya detecta el workspace, pero la issue exige
// declarar la raíz y los node_modules del monorepo de forma explícita. Se
// conservan los valores por defecto (watchFolders de cada paquete del
// workspace) para no romper la resolución.
//
// `unstable_enablePackageExports` es necesario porque Metro 0.81 lo deja
// apagado y `@camino/contracts` expone sus módulos por subrutas en `exports`.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer/expo'),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((extension) => extension !== 'svg'),
  sourceExts: [...new Set([...resolver.sourceExts, 'svg'])],
};

config.watchFolders = [...new Set([...config.watchFolders, monorepoRoot])];
config.resolver.nodeModulesPaths = [
  ...new Set([
    ...config.resolver.nodeModulesPaths,
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
  ]),
];
config.resolver.unstable_enablePackageExports = true;

// Metro no debe vigilar `android/` ni `ios/`: son carpetas nativas que genera
// `expo prebuild` y sus archivos intermedios (`.gradle`, `build`) cambian
// mientras Gradle compila. En Windows, el watcher retiene handles sobre
// `.gradle/.../dependencies-accessors` y Gradle falla al renombrar su workspace
// inmutable (`AccessDeniedException`). Excluirlas también acelera el bundler.
config.resolver.blockList = [/[\\/]android[\\/].*/, /[\\/]ios[\\/].*/];

module.exports = config;
