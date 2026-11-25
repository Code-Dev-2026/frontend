// Metro en monorepo: Expo SDK 52 ya detecta el workspace, pero la issue exige
// declarar la raíz y los node_modules del monorepo de forma explícita.

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
    path.resolve(monorepoRoot, 'node_modules', '.pnpm', 'node_modules'),
  ]),
];
config.resolver.unstable_enablePackageExports = true;

config.resolver.blockList = [/[\\/]android[\\/].*/, /[\\/]ios[\\/].*/];

module.exports = config;
