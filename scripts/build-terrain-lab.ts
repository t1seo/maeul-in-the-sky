import { writeFile } from 'node:fs/promises';
import { build } from 'tsup';
import { sampleSnapshot } from '../src/demo/sample.js';
import { snapshotToContributionData } from '../src/core/settings/parse.js';
import { renderTerrain } from '../src/themes/terrain/index.js';

await build({
  config: false,
  entry: { main: 'src/terrain-lab/main.ts' },
  outDir: 'docs/demo/terrain-lab/app',
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

const sample = sampleSnapshot();
const original = renderTerrain(snapshotToContributionData(sample), {
  ...sample.settings,
  motion: 'off',
  style: 'korean',
  title: 'Same contribution calendar · synthetic sample',
});
await Promise.all(
  (['light', 'dark'] as const).map((mode) =>
    writeFile(`docs/demo/terrain-lab/calendar-${mode}.svg`, original[mode]),
  ),
);
