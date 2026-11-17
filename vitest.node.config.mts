import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tools/node-test-setup.mts'],
    include: ['apps/**/*.node.spec.ts', 'libs/**/*.node.spec.ts'],
  },
  resolve: {
    alias: {
      '@gscf/core': fileURLToPath(new URL('./libs/core/src/public-api.ts', import.meta.url)),
      '@gscf/disputes-data-access': fileURLToPath(
        new URL('./libs/data-access/disputes/src/public-api.ts', import.meta.url),
      ),
    },
  },
});
