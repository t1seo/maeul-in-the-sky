import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  shims: true,
  splitting: false,
  sourcemap: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
