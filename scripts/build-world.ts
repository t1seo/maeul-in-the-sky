import { build } from 'tsup';

await build({
  config: false,
  entry: { main: 'src/world/app/main.ts' },
  outDir: 'docs/demo/world/app',
  format: ['esm'],
  platform: 'browser',
  target: 'es2022',
  bundle: true,
  noExternal: [/.*/],
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: true,
  dts: false,
});
