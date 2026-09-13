import { build } from 'tsup';

await build({
  config: false,
  entry: { main: 'src/demo/main.ts' },
  outDir: 'docs/demo/app',
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  bundle: true,
  noExternal: [/.*/],
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: true,
  dts: false,
});
