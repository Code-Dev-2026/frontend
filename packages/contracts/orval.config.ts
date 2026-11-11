import { defineConfig } from 'orval';
import path from 'node:path';

export default defineConfig({
  api: {
    input: {
      target: process.env.BACKEND_OPENAPI_FILE ?? './openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: path.resolve(
        process.env.BACKEND_GENERATED_DIR ?? './src/generated',
        'endpoints',
      ),
      schemas: path.resolve(
        process.env.BACKEND_GENERATED_DIR ?? './src/generated',
        'models',
      ),
      client: 'fetch',
      mock: true,
      clean: true,
      override: {
        mutator: {
          path: './src/http/client.ts',
          name: 'orvalFetcher',
        },
      },
    },
  },
});
