import { defineConfig } from 'vitest/config';
import { join } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      src: join(__dirname, 'src'),
      core: join(__dirname, 'src/core'),
      types: join(__dirname, 'src/types'),
      constants: join(__dirname, 'src/constants'),
      stores: join(__dirname, 'src/stores'),
      components: join(__dirname, 'src/components'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts', 'src/utils/**/*.ts', 'src/stores/**/*.ts'],
    },
  },
});
