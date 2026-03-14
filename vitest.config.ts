import { defineConfig } from 'vitest/config';
import { join } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      src: join(__dirname, 'src'),
      classes: join(__dirname, 'src/classes'),
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
      include: ['src/classes/**/*.ts', 'src/utils/**/*.ts'],
    },
  },
});
