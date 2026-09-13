import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';

const requireFromConfig = createRequire(import.meta.url);
const cssTreeCommonJsEntry = requireFromConfig.resolve('css-tree');

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    dts: false,
    clean: true,
    shims: true,
    splitting: false,
    sourcemap: true,
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
    esbuildOptions(options) {
      options.alias = { ...options.alias, 'css-tree': cssTreeCommonJsEntry };
    },
  },
  {
    entry: { browser: 'src/browser.ts' },
    format: ['esm'],
    platform: 'browser',
    target: 'es2022',
    dts: true,
    clean: false,
    splitting: false,
    sourcemap: true,
    minify: true,
    noExternal: [/.*/],
  },
]);
