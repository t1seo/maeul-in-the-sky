import { defineConfig } from 'tsup';

export default defineConfig([
  // CLI entry — includes shebang banner
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: false,
    clean: true,
    shims: true,
    splitting: false,
    sourcemap: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  // Library entry — no shebang, includes type declarations
  {
    entry: { lib: 'src/lib.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    shims: true,
    splitting: false,
    sourcemap: true,
  },
  // GitHub Action entry — CJS bundle with all dependencies
  {
    entry: { action: 'src/action.ts' },
    format: ['cjs'],
    dts: false,
    clean: false,
    shims: true,
    splitting: false,
    sourcemap: true,
    bundle: true,
    noExternal: [/.*/],
  },
]);
