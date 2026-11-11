import sharedConfig from '@camino/config/eslint.config.mjs';

export default [...sharedConfig, { ignores: ['src/generated/**'] }];
